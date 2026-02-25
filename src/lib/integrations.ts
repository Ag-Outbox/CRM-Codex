import { IncomingLeadPayload, LeadSource, LeadStage, UserProfile } from './types';

export function detectSource(payload: IncomingLeadPayload): {
  source: LeadSource;
  origin: 'WHATSAPP_DIRECT' | 'FACEBOOK_CAPI' | 'FACEBOOK_CLICK_TO_WHATSAPP';
} {
  if (payload.sourceHint === 'FACEBOOK_ADS') {
    return { source: 'FACEBOOK_ADS', origin: 'FACEBOOK_CAPI' };
  }
  if (payload.sourceHint === 'FACEBOOK_TO_WHATSAPP') {
    return { source: 'WHATSAPP', origin: 'FACEBOOK_CLICK_TO_WHATSAPP' };
  }
  return { source: 'WHATSAPP', origin: 'WHATSAPP_DIRECT' };
}

export function aiClassifyLead(payload: IncomingLeadPayload): {
  stage: LeadStage;
  probability: number;
  summary: string;
  queueRole: 'SALES' | 'ATENDIMENTO';
} {
  const message = (payload.message ?? '').toLowerCase();
  const hasPriceIntent = /preço|valor|contratar|plano|orçamento|comprar/.test(message);
  const hasSupportIntent = /suporte|problema|dúvida|atendimento|ajuda/.test(message);

  if (hasSupportIntent && !hasPriceIntent) {
    return {
      stage: 'CONTATO',
      probability: 35,
      summary: 'IA classificou como atendimento inicial. Encaminhar para equipe de atendimento.',
      queueRole: 'ATENDIMENTO',
    };
  }

  return {
    stage: hasPriceIntent ? 'QUALIFICADO' : 'CONTATO',
    probability: hasPriceIntent ? 62 : 45,
    summary: hasPriceIntent
      ? 'IA detectou intenção comercial com termos de compra/orçamento.'
      : 'IA detectou lead em fase de descoberta. Manter nutrição e follow-up.',
    queueRole: 'SALES',
  };
}

export function pickOwnerByRole(users: UserProfile[], role: 'SALES' | 'ATENDIMENTO') {
  return users.find((user) => user.role === role)?.id;
}
