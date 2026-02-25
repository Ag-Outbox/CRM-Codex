import { useState } from 'react';
import { CrmLayout } from '../../components/crm/Layout';
import { useCrmStore } from '../../state/crm-store';

export function LeadsPage() {
  const { leads, updateLeadProbability, createLead } = useCrmStore();
  const [filter, setFilter] = useState('');

  return (
    <CrmLayout onAddLead={() => createLead({ name: 'Lead manual', source: 'MANUAL', stage: 'NOVO' })}>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Leads / Contatos</h2>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border px-2 py-1 text-sm" placeholder="Filtrar por nome" />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Nome</th>
              <th className="p-2">Origem</th>
              <th className="p-2">Campanha</th>
              <th className="p-2">Etapa</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Probabilidade</th>
              <th className="p-2">IA</th>
            </tr>
          </thead>
          <tbody>
            {leads
              .filter((lead) => lead.name.toLowerCase().includes(filter.toLowerCase()))
              .map((lead) => (
                <tr key={lead.id} className="border-b align-top">
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">
                    <p>{lead.source}</p>
                    <p className="text-xs text-slate-400">{lead.channelOrigin ?? '-'}</p>
                  </td>
                  <td className="p-2">{lead.campaign ?? '-'}</td>
                  <td className="p-2">{lead.stage}</td>
                  <td className="p-2">R$ {lead.valueBrl.toLocaleString('pt-BR')}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={100} value={lead.probability} onChange={(event) => updateLeadProbability(lead.id, Number(event.target.value))} />
                      <span>{lead.probability}%</span>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-slate-500">{lead.aiSummary ?? 'Sem classificação IA'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </CrmLayout>
  );
}
