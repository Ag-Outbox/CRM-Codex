import { CrmLayout } from '../../components/crm/Layout';
import { useCrmStore } from '../../state/crm-store';

export function ContatosPage() {
  const { leads } = useCrmStore();

  return (
    <CrmLayout>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Contatos</h2>
        <div className="grid grid-cols-2 gap-2">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-lg border border-slate-100 p-2 text-sm">
              <p className="font-semibold">{lead.name}</p>
              <p className="text-slate-500">{lead.company}</p>
              <p className="text-slate-500">{lead.email}</p>
              <p className="text-slate-500">{lead.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </CrmLayout>
  );
}
