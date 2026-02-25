-- Adds production support for WhatsApp/Facebook Ads ingestion and Atendimento role.

alter type public.member_role add value if not exists 'ATENDIMENTO';

alter table public.leads
  add column if not exists campaign text,
  add column if not exists channel_origin text,
  add column if not exists ai_summary text,
  add column if not exists external_id text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists leads_external_id_idx on public.leads(external_id);
create index if not exists leads_channel_origin_idx on public.leads(channel_origin);

create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  external_id text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'RECEIVED',
  created_at timestamptz not null default now()
);

alter table public.integration_events enable row level security;

drop policy if exists "integration_events_select" on public.integration_events;
create policy "integration_events_select"
on public.integration_events for select
using (public.is_member(org_id));

drop policy if exists "integration_events_insert" on public.integration_events;
create policy "integration_events_insert"
on public.integration_events for insert
with check (public.is_member(org_id));

create or replace function public.ingest_external_lead(
  p_name text,
  p_phone text,
  p_email text,
  p_source_hint text,
  p_campaign text,
  p_message text,
  p_estimated_value numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_org uuid;
  v_lead_id uuid;
  v_source public.lead_source;
  v_channel_origin text;
  v_prob int;
  v_stage public.lead_stage;
  v_summary text;
  v_external_id text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select m.org_id into v_org
  from public.memberships m
  where m.user_id = v_uid and m.status = 'ACTIVE'
  order by m.created_at asc
  limit 1;

  if v_org is null then
    raise exception 'No active organization found for user';
  end if;

  if p_source_hint = 'FACEBOOK_ADS' then
    v_source := 'FACEBOOK_ADS';
    v_channel_origin := 'FACEBOOK_CAPI';
  elsif p_source_hint = 'FACEBOOK_TO_WHATSAPP' then
    v_source := 'WHATSAPP';
    v_channel_origin := 'FACEBOOK_CLICK_TO_WHATSAPP';
  else
    v_source := 'WHATSAPP';
    v_channel_origin := 'WHATSAPP_DIRECT';
  end if;

  if coalesce(lower(p_message), '') ~ '(preço|valor|contratar|plano|orçamento|comprar)' then
    v_stage := 'QUALIFICADO';
    v_prob := 62;
    v_summary := 'IA detectou intenção comercial com termos de compra/orçamento.';
  elsif coalesce(lower(p_message), '') ~ '(suporte|problema|dúvida|atendimento|ajuda)' then
    v_stage := 'CONTATO';
    v_prob := 35;
    v_summary := 'IA classificou como atendimento inicial.';
  else
    v_stage := 'CONTATO';
    v_prob := 45;
    v_summary := 'IA classificou o lead em fase de descoberta.';
  end if;

  v_external_id := encode(digest(coalesce(p_phone, '') || ':' || coalesce(p_email, '') || ':' || coalesce(p_campaign, ''), 'sha256'), 'hex');

  insert into public.leads (
    org_id,
    name,
    phone,
    email,
    stage,
    source,
    value_brl,
    probability,
    campaign,
    channel_origin,
    ai_summary,
    external_id,
    metadata,
    created_by
  )
  values (
    v_org,
    p_name,
    p_phone,
    p_email,
    v_stage,
    v_source,
    coalesce(p_estimated_value, 0),
    v_prob,
    p_campaign,
    v_channel_origin,
    v_summary,
    v_external_id,
    jsonb_build_object('message', p_message, 'source_hint', p_source_hint),
    v_uid
  )
  returning id into v_lead_id;

  insert into public.activities (org_id, lead_id, actor_user_id, type, payload)
  values (
    v_org,
    v_lead_id,
    v_uid,
    'INTEGRATION_INGESTED',
    jsonb_build_object('source_hint', p_source_hint, 'campaign', p_campaign, 'ai_summary', v_summary)
  );

  insert into public.integration_events (org_id, provider, external_id, payload, status)
  values (
    v_org,
    case when p_source_hint = 'FACEBOOK_ADS' then 'facebook_ads' else 'whatsapp' end,
    v_external_id,
    jsonb_build_object('name', p_name, 'phone', p_phone, 'email', p_email, 'campaign', p_campaign, 'message', p_message),
    'PROCESSED'
  );

  return v_lead_id;
end;
$$;
