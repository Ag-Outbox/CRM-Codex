export type MemberRole = 'ADMIN' | 'SALES' | 'MANAGER' | 'VIEWER' | 'ATENDIMENTO';

export type LeadStage =
  | 'NOVO'
  | 'CONTATO'
  | 'QUALIFICADO'
  | 'AGENDADO_001'
  | 'SHOWUP_001'
  | 'SHOWUP_002'
  | 'SHOWUP_003'
  | 'PROPOSTA'
  | 'ANALISANDO'
  | 'NEGOCIACAO'
  | 'CLIENTE'
  | 'CLOSED'
  | 'CHURNED';

export type LeadSource = 'MANUAL' | 'WHATSAPP' | 'FACEBOOK_ADS' | 'NETWORK' | 'INDICACAO' | 'OUTRO';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  approved: boolean;
};

export type Lead = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  stage: LeadStage;
  source: LeadSource;
  ownerUserId?: string;
  valueBrl: number;
  probability: number;
  createdAt: string;
  updatedAt: string;
  campaign?: string;
  channelOrigin?: 'WHATSAPP_DIRECT' | 'FACEBOOK_CAPI' | 'FACEBOOK_CLICK_TO_WHATSAPP' | 'MANUAL';
  aiSummary?: string;
};

export type ActivityType = 'STAGE_CHANGED' | 'CREATED' | 'ASSIGNED' | 'NOTE' | 'INTEGRATION';

export type Activity = {
  id: string;
  leadId: string;
  actorName: string;
  type: ActivityType;
  message: string;
  createdAt: string;
};

export type MembershipRequest = {
  id: string;
  email: string;
  requestedRole: MemberRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

export type IntegrationConfig = {
  whatsappAutomationEnabled: boolean;
  facebookAdsIngestionEnabled: boolean;
  aiLeadScoringEnabled: boolean;
  autoAssignEnabled: boolean;
};

export type IncomingLeadPayload = {
  name: string;
  phone?: string;
  email?: string;
  sourceHint: 'WHATSAPP' | 'FACEBOOK_ADS' | 'FACEBOOK_TO_WHATSAPP';
  campaign?: string;
  message?: string;
  estimatedValue?: number;
};

export type IntegrationStats = {
  whatsappLeads: number;
  facebookLeads: number;
  facebookToWhatsappLeads: number;
  aiProcessed: number;
};
