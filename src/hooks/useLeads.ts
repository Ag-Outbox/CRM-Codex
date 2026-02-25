import { useMemo, useState } from 'react';
import { Lead } from '../lib/types';

const seed: Lead[] = [
  { id: '1', name: 'Victor Mina', company: 'ODC', source: 'INDICACAO', stage: 'NEGOCIACAO', value_brl: 216000, probability: 25, created_at: new Date().toISOString(), state: 'SP', city: 'São Paulo' },
  { id: '2', name: 'Samia Melo', company: 'Clínica Multi Imagem', source: 'FACEBOOK_ADS', stage: 'PROPOSTA', value_brl: 146000, probability: 70, created_at: new Date().toISOString(), state: 'MG', city: 'Belo Horizonte' },
  { id: '3', name: 'Andre Martinho', company: 'Fise', source: 'NETWORK', stage: 'ANALISANDO', value_brl: 65000, probability: 80, created_at: new Date().toISOString(), state: 'RJ', city: 'Rio de Janeiro' },
];

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(seed);

  const byStage = useMemo(
    () => leads.reduce<Record<string, Lead[]>>((acc, lead) => {
      acc[lead.stage] = acc[lead.stage] ? [...acc[lead.stage], lead] : [lead];
      return acc;
    }, {}),
    [leads],
  );

  const moveLeadStage = (leadId: string, stage: Lead['stage']) => {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, stage } : lead)));
  };

  return { leads, setLeads, byStage, moveLeadStage };
}
