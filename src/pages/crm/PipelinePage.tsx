import { CrmLayout } from '../../components/crm/Layout';
import { LeadStage } from '../../lib/types';
import { useCrmStore } from '../../state/crm-store';

const STAGES: LeadStage[] = ['NOVO', 'CONTATO', 'QUALIFICADO', 'AGENDADO_001', 'SHOWUP_001', 'SHOWUP_002', 'SHOWUP_003', 'PROPOSTA', 'ANALISANDO', 'NEGOCIACAO', 'CLIENTE', 'CLOSED', 'CHURNED'];

function nextStage(stage: LeadStage): LeadStage {
  const idx = STAGES.indexOf(stage);
  return STAGES[Math.min(STAGES.length - 1, idx + 1)];
}

function prevStage(stage: LeadStage): LeadStage {
  const idx = STAGES.indexOf(stage);
  return STAGES[Math.max(0, idx - 1)];
}

function LeadCard({
  id,
  name,
  company,
  valueBrl,
  probability,
  email,
  phone,
  source,
  stage,
  onMove,
}: {
  id: string;
  name: string;
  company?: string;
  valueBrl: number;
  probability: number;
  email?: string;
  phone?: string;
  source: string;
  stage: LeadStage;
  onMove: (leadId: string, newStage: LeadStage) => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-2 text-xs shadow-sm">
      <p className="font-semibold">{name}</p>
      <p className="text-slate-500">{company}</p>
      <p className="mt-1 text-xl font-bold text-teal-600">R$ {valueBrl.toLocaleString('pt-BR')}</p>
      <p className="mt-1 text-[10px] text-slate-500">~ Probabilidade {probability}%</p>
      <div className="h-1.5 rounded bg-slate-200"><div className="h-1.5 rounded bg-sky-500" style={{ width: `${probability}%` }} /></div>
      <p className="mt-1 truncate text-[10px] text-slate-500">{email}</p>
      <p className="truncate text-[10px] text-slate-500">{phone}</p>
      <span className="mt-1 inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-500">{source}</span>
      <div className="mt-2 flex gap-1">
        <button className="rounded bg-slate-100 px-2 py-1 text-[10px]" onClick={() => onMove(id, prevStage(stage))}>◀ Etapa</button>
        <button className="rounded bg-sky-100 px-2 py-1 text-[10px] text-sky-700" onClick={() => onMove(id, nextStage(stage))}>Etapa ▶</button>
      </div>
    </article>
  );
}

function Column({ stage, children }: { stage: LeadStage; children: React.ReactNode }) {
  return (
    <section className="min-h-[70vh] w-[260px] shrink-0 rounded-xl border border-slate-200 bg-slate-100 p-2">
      <div className="mb-2 flex items-center justify-between border-b pb-1">
        <h3 className="text-xs font-bold">{stage.replaceAll('_', ' ')}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function PipelinePage() {
  const { leads, moveLead, createLead } = useCrmStore();

  return (
    <CrmLayout onAddLead={() => createLead({ name: `Novo Lead ${Math.floor(Math.random() * 90)}`, source: 'WHATSAPP', stage: 'NOVO' })}>
      <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
        Modo compatível sem dnd-kit: use os botões "Etapa ◀/▶" nos cards para mover no funil.
      </div>
      <div className="flex gap-2 overflow-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage);
          return (
            <Column key={stage} stage={stage}>
              {stageLeads.length === 0 && <p className="pt-8 text-center text-xs text-slate-400">Nenhum item</p>}
              {stageLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  id={lead.id}
                  name={lead.name}
                  company={lead.company}
                  valueBrl={lead.valueBrl}
                  probability={lead.probability}
                  email={lead.email}
                  phone={lead.phone}
                  source={lead.source}
                  stage={lead.stage}
                  onMove={moveLead}
                />
              ))}
            </Column>
          );
        })}
      </div>
    </CrmLayout>
  );
}
