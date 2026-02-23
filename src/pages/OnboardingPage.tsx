import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function OnboardingPage() {
  const [name, setName] = useState('');
  const [adminName, setAdminName] = useState('Marcello');
  const [insertDemo, setInsertDemo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError('Informe um nome de organização.');
    setLoading(true);
    setError(null);

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    const { data, error: rpcError } = await supabase.rpc('create_organization_and_admin_membership', {
      p_name: name,
      p_slug: slug,
      p_admin_name: adminName,
      p_insert_demo: insertDemo,
    });

    if (rpcError) {
      localStorage.setItem('active_org', JSON.stringify({ id: `local-${slug}`, name }));
      navigate('/crm/dashboard');
      return;
    }

    localStorage.setItem('active_org', JSON.stringify({ id: data, name }));
    navigate('/crm/dashboard');
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Bem-vindo ao CRM</h1>
        <p className="mb-4 text-sm text-slate-500">Configure sua organização para iniciar o pipeline.</p>
        <input className="mb-3 w-full rounded-lg border p-3" placeholder="Nome da organização" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="mb-3 w-full rounded-lg border p-3" placeholder="Seu nome" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
        <label className="mb-5 flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={insertDemo} onChange={(e) => setInsertDemo(e.target.checked)} /> Inserir dados de exemplo</label>
        {error && <p className="mb-3 text-sm text-rose-500">{error}</p>}
        <button disabled={loading} className="rounded-lg bg-teal-600 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Criando...' : 'Começar'}</button>
      </form>
    </div>
  );
}
