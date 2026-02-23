-- See specification in prompt; full schema with RPC + RLS.
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create type public.member_role as enum ('ADMIN', 'SALES', 'MANAGER', 'VIEWER');
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'SALES',
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  unique(org_id, user_id)
);

create type public.request_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create table if not exists public.membership_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  requester_email text not null,
  requested_role public.member_role not null default 'SALES',
  status public.request_status not null default 'PENDING',
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create type public.lead_source as enum ('MANUAL', 'WHATSAPP', 'FACEBOOK_ADS', 'NETWORK', 'INDICACAO', 'OUTRO');
create type public.lead_stage as enum ('NOVO','CONTATO','QUALIFICADO','AGENDADO_001','SHOWUP_001','SHOWUP_002','SHOWUP_003','PROPOSTA','ANALISANDO','NEGOCIACAO','CLIENTE','CLOSED','CHURNED');

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  city text,
  state text,
  lat double precision,
  lng double precision,
  stage public.lead_stage not null default 'NOVO',
  source public.lead_source not null default 'MANUAL',
  owner_user_id uuid references auth.users(id),
  value_brl numeric(12,2) default 0,
  probability int not null default 10 check (probability between 0 and 100),
  last_contact_at timestamptz,
  next_meeting_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id),
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at before update on public.leads for each row execute function public.set_updated_at();

create or replace function public.create_organization_and_admin_membership(p_name text,p_slug text,p_admin_name text,p_insert_demo boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org_id uuid; v_uid uuid;
begin
  v_uid := auth.uid(); if v_uid is null then raise exception 'Not authenticated'; end if;
  insert into public.organizations(name, slug, created_by) values (p_name, p_slug, v_uid) returning id into v_org_id;
  insert into public.memberships(org_id, user_id, role) values (v_org_id, v_uid, 'ADMIN') on conflict do nothing;
  if p_insert_demo then
    insert into public.leads(org_id, name, company, state, city, stage, source, owner_user_id, value_brl, probability, created_by)
    values
      (v_org_id, 'Victor Mina', 'ODC', 'SP', 'São Paulo', 'NEGOCIACAO', 'INDICACAO', v_uid, 216000, 25, v_uid),
      (v_org_id, 'Samia Melo', 'Clínica Multi Imagem', 'MG', 'Belo Horizonte', 'PROPOSTA', 'FACEBOOK_ADS', v_uid, 146000, 70, v_uid),
      (v_org_id, 'Andre Martinho', 'Fise', 'RJ', 'Rio de Janeiro', 'ANALISANDO', 'NETWORK', v_uid, 65000, 80, v_uid);
  end if;
  return v_org_id;
end; $$;

create or replace function public.request_membership(p_org_id uuid, p_email text, p_role public.member_role default 'SALES') returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_uid uuid;
begin
  v_uid := auth.uid(); if v_uid is null then raise exception 'Not authenticated'; end if;
  insert into public.membership_requests(org_id, requester_user_id, requester_email, requested_role, status)
  values (p_org_id, v_uid, p_email, p_role, 'PENDING') returning id into v_id;
  return v_id;
end; $$;

create or replace function public.decide_membership_request(p_request_id uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid; v_org uuid; v_req record;
begin
  v_uid := auth.uid(); if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into v_req from public.membership_requests where id = p_request_id for update;
  if not found then raise exception 'Request not found'; end if;
  v_org := v_req.org_id;
  if not exists (select 1 from public.memberships m where m.org_id = v_org and m.user_id = v_uid and m.role = 'ADMIN' and m.status = 'ACTIVE') then
    raise exception 'Not authorized';
  end if;
  update public.membership_requests set status = case when p_approve then 'APPROVED' else 'REJECTED' end, decided_by = v_uid, decided_at = now() where id = p_request_id;
  if p_approve then
    insert into public.memberships(org_id, user_id, role) values (v_org, v_req.requester_user_id, v_req.requested_role)
    on conflict (org_id, user_id) do update set role = excluded.role, status='ACTIVE';
  end if;
end; $$;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.membership_requests enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;

create or replace function public.is_member(p_org_id uuid) returns boolean language sql stable as $$
  select exists (select 1 from public.memberships m where m.org_id = p_org_id and m.user_id = auth.uid() and m.status = 'ACTIVE');
$$;

create policy "org_select_members" on public.organizations for select using (public.is_member(id));
create policy "org_insert_none" on public.organizations for insert with check (false);
create policy "memberships_select" on public.memberships for select using (public.is_member(org_id));
create policy "memberships_insert_none" on public.memberships for insert with check (false);
create policy "memberships_update_none" on public.memberships for update using (false);
create policy "requests_select" on public.membership_requests for select using (requester_user_id = auth.uid() or exists (select 1 from public.memberships m where m.org_id = membership_requests.org_id and m.user_id = auth.uid() and m.role='ADMIN' and m.status='ACTIVE'));
create policy "requests_insert_none" on public.membership_requests for insert with check (false);
create policy "requests_update_none" on public.membership_requests for update using (false);
create policy "leads_select" on public.leads for select using (public.is_member(org_id));
create policy "leads_insert" on public.leads for insert with check (public.is_member(org_id) and created_by = auth.uid());
create policy "leads_update" on public.leads for update using (public.is_member(org_id));
create policy "leads_delete" on public.leads for delete using (public.is_member(org_id));
create policy "activities_select" on public.activities for select using (public.is_member(org_id));
create policy "activities_insert" on public.activities for insert with check (public.is_member(org_id) and actor_user_id = auth.uid());
