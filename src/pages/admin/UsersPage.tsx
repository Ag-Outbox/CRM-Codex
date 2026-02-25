import { CrmLayout } from '../../components/crm/Layout';
import { useCrmStore } from '../../state/crm-store';

export function UsersPage() {
  const { requests, users, decideRequest } = useCrmStore();

  return (
    <CrmLayout>
      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Solicitações</h2>
          <div className="space-y-2">
            {requests.map((req) => (
              <article key={req.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                <p className="font-medium">{req.email}</p>
                <p className="text-xs text-slate-500">Perfil: {req.requestedRole} • Status: {req.status}</p>
                {req.status === 'PENDING' && (
                  <div className="mt-2 space-x-2">
                    <button onClick={() => decideRequest(req.id, true)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">Aprovar</button>
                    <button onClick={() => decideRequest(req.id, false)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">Rejeitar</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Membros da Organização</h2>
          <div className="space-y-2 text-sm">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded border border-slate-100 p-2">
                <span>{user.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{user.role}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CrmLayout>
  );
}
