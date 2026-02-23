import { supabase } from './supabase';
import { IncomingLeadPayload } from './types';

export async function persistIncomingLead(payload: IncomingLeadPayload) {
  const { error } = await supabase.rpc('ingest_external_lead', {
    p_name: payload.name,
    p_phone: payload.phone ?? null,
    p_email: payload.email ?? null,
    p_source_hint: payload.sourceHint,
    p_campaign: payload.campaign ?? null,
    p_message: payload.message ?? null,
    p_estimated_value: payload.estimatedValue ?? 0,
  });

  return { ok: !error, error };
}
