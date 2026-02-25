import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { persistIncomingLead } from '../lib/ingestion-rpc';
import { aiClassifyLead, detectSource, pickOwnerByRole } from '../lib/integrations';
import {
  Activity,
  IncomingLeadPayload,
  IntegrationConfig,
  IntegrationStats,
  Lead,
  LeadSource,
  LeadStage,
  MembershipRequest,
  UserProfile,
} from '../lib/types';

const now = new Date().toISOString();

const seedLeads: Lead[] = [
  {
    id: 'l1',
    name: 'William Ueno',
    company: 'Golf Soluções',
    stage: 'SHOWUP_001',
    source: 'INDICACAO',
    valueBrl: 60000,
    probability: 50,
    email: 'william@golf.com',
    phone: '+5561991043544',
    state: 'GO',
    city: 'Goiânia',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'l2',
    name: 'Andre Salvador',
    company: 'A Area',
    stage: 'SHOWUP_002',
    source: 'FACEBOOK_ADS',
    valueBrl: 35000,
    probability: 25,
    email: 'andre@aarea.com.br',
    phone: '+556391731262',
    state: 'SP',
    city: 'São Paulo',
    createdAt: now,
    updatedAt: now,
    campaign: 'Meta - Fevereiro',
  },
];

const seedActivities: Activity[] = [
  { id: 'a1', leadId: 'l1', actorName: 'Marcello', type: 'STAGE_CHANGED', message: 'Moveu William para SHOWUP_001', createdAt: now },
];

const seedUsers: UserProfile[] = [
  { id: 'u-admin', name: 'Marcello', email: 'admin@bos.com', role: 'ADMIN', approved: true },
  { id: 'u-sales', name: 'Andre Gomes', email: 'andre@bos.com', role: 'SALES', approved: true },
  { id: 'u-care', name: 'Equipe Atendimento', email: 'atendimento@bos.com', role: 'ATENDIMENTO', approved: true },
];

const seedRequests: MembershipRequest[] = [
  { id: 'r1', email: 'vendedor1@empresa.com', requestedRole: 'SALES', status: 'PENDING', createdAt: now },
];

const seedIntegrationConfig: IntegrationConfig = {
  whatsappAutomationEnabled: true,
  facebookAdsIngestionEnabled: true,
  aiLeadScoringEnabled: true,
  autoAssignEnabled: true,
};

type CrmState = {
  leads: Lead[];
  activities: Activity[];
  users: UserProfile[];
  requests: MembershipRequest[];
  integrationConfig: IntegrationConfig;
  integrationStats: IntegrationStats;
  moveLead: (leadId: string, stage: LeadStage) => void;
  updateLeadProbability: (leadId: string, value: number) => void;
  createLead: (input: { name: string; source: LeadSource; stage: LeadStage }) => void;
  decideRequest: (id: string, approve: boolean) => void;
  updateIntegrationConfig: (patch: Partial<IntegrationConfig>) => void;
  ingestExternalLead: (payload: IncomingLeadPayload) => Promise<void>;
};

const CrmContext = createContext<CrmState | null>(null);

export function CrmStoreProvider({ children }: PropsWithChildren) {
  const [leads, setLeads] = useState(seedLeads);
  const [activities, setActivities] = useState(seedActivities);
  const [users, setUsers] = useState(seedUsers);
  const [requests, setRequests] = useState(seedRequests);
  const [integrationConfig, setIntegrationConfig] = useState(seedIntegrationConfig);

  const addActivity = (activity: Activity) => setActivities((prev) => [activity, ...prev].slice(0, 50));

  const moveLead = (leadId: string, stage: LeadStage) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead || lead.stage === stage) return;

    setLeads((prev) =>
      prev.map((item) =>
        item.id === leadId
          ? {
              ...item,
              stage,
              probability: scoreProbability(item.source, stage, item.updatedAt),
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );

    addActivity({
      id: crypto.randomUUID(),
      leadId,
      actorName: 'Marcello',
      type: 'STAGE_CHANGED',
      message: `${lead.name} foi movido para ${stage}`,
      createdAt: new Date().toISOString(),
    });
  };

  const updateLeadProbability = (leadId: string, value: number) => {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, probability: Math.max(0, Math.min(100, value)) } : lead)));
  };

  const createLead = (input: { name: string; source: LeadSource; stage: LeadStage }) => {
    const lead: Lead = {
      id: crypto.randomUUID(),
      name: input.name,
      source: input.source,
      stage: input.stage,
      probability: scoreProbability(input.source, input.stage, new Date().toISOString()),
      valueBrl: 35000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channelOrigin: 'MANUAL',
    };

    setLeads((prev) => [lead, ...prev]);
    addActivity({
      id: crypto.randomUUID(),
      leadId: lead.id,
      actorName: 'Marcello',
      type: 'CREATED',
      message: `Lead ${lead.name} criado`,
      createdAt: new Date().toISOString(),
    });
  };

  const ingestExternalLead = async (payload: IncomingLeadPayload) => {
    const sourceMeta = detectSource(payload);
    const aiResult = aiClassifyLead(payload);

    const shouldCreateFromWhatsapp = sourceMeta.source === 'WHATSAPP' && integrationConfig.whatsappAutomationEnabled;
    const shouldCreateFromMeta = sourceMeta.source === 'FACEBOOK_ADS' && integrationConfig.facebookAdsIngestionEnabled;
    if (!shouldCreateFromWhatsapp && !shouldCreateFromMeta) return;

    await persistIncomingLead(payload);

    const selectedStage = integrationConfig.aiLeadScoringEnabled ? aiResult.stage : 'NOVO';
    const selectedProbability = integrationConfig.aiLeadScoringEnabled ? aiResult.probability : 15;
    const ownerUserId = integrationConfig.autoAssignEnabled ? pickOwnerByRole(users, aiResult.queueRole) : undefined;

    const lead: Lead = {
      id: crypto.randomUUID(),
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      source: sourceMeta.source,
      stage: selectedStage,
      probability: selectedProbability,
      valueBrl: payload.estimatedValue ?? 20000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerUserId,
      campaign: payload.campaign,
      channelOrigin: sourceMeta.origin,
      aiSummary: aiResult.summary,
    };

    setLeads((prev) => [lead, ...prev]);
    addActivity({
      id: crypto.randomUUID(),
      leadId: lead.id,
      actorName: 'IA + Integrações',
      type: 'INTEGRATION',
      message: `Lead ${lead.name} recebido via ${sourceMeta.origin} e classificado para ${aiResult.queueRole}`,
      createdAt: new Date().toISOString(),
    });
  };

  const decideRequest = (id: string, approve: boolean) => {
    const req = requests.find((item) => item.id === id);
    if (!req) return;

    setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status: approve ? 'APPROVED' : 'REJECTED' } : item)));
    if (approve) {
      setUsers((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: req.email.split('@')[0], email: req.email, role: req.requestedRole, approved: true },
      ]);
    }
  };

  const updateIntegrationConfig = (patch: Partial<IntegrationConfig>) => {
    setIntegrationConfig((prev) => ({ ...prev, ...patch }));
  };

  const integrationStats: IntegrationStats = useMemo(
    () => ({
      whatsappLeads: leads.filter((lead) => lead.source === 'WHATSAPP').length,
      facebookLeads: leads.filter((lead) => lead.source === 'FACEBOOK_ADS').length,
      facebookToWhatsappLeads: leads.filter((lead) => lead.channelOrigin === 'FACEBOOK_CLICK_TO_WHATSAPP').length,
      aiProcessed: leads.filter((lead) => Boolean(lead.aiSummary)).length,
    }),
    [leads],
  );

  const value = useMemo(
    () => ({
      leads,
      activities,
      users,
      requests,
      integrationConfig,
      integrationStats,
      moveLead,
      updateLeadProbability,
      createLead,
      decideRequest,
      updateIntegrationConfig,
      ingestExternalLead,
    }),
    [leads, activities, users, requests, integrationConfig, integrationStats],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrmStore() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrmStore must be used within CrmStoreProvider');
  return ctx;
}

function scoreProbability(source: LeadSource, stage: LeadStage, updatedAt: string) {
  const stageScore: Record<LeadStage, number> = {
    NOVO: 10,
    CONTATO: 20,
    QUALIFICADO: 35,
    AGENDADO_001: 45,
    SHOWUP_001: 50,
    SHOWUP_002: 55,
    SHOWUP_003: 60,
    PROPOSTA: 68,
    ANALISANDO: 72,
    NEGOCIACAO: 80,
    CLIENTE: 100,
    CLOSED: 100,
    CHURNED: 0,
  };

  const sourceBoost: Record<LeadSource, number> = {
    INDICACAO: 15,
    NETWORK: 10,
    WHATSAPP: 8,
    FACEBOOK_ADS: 6,
    MANUAL: 4,
    OUTRO: 3,
  };

  const daysDiff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  const stalePenalty = daysDiff > 5 ? 10 : 0;
  return Math.max(0, Math.min(100, stageScore[stage] + sourceBoost[source] - stalePenalty));
}
