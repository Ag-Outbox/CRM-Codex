import { Search } from 'lucide-react';

type Props = {
  onAddLead?: () => void;
};

export function TopBar({ onAddLead }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Search size={14} />
        <input className="w-56 rounded border border-slate-200 px-2 py-1 text-xs" placeholder="Buscar por nome, telefone..." />
        <select className="rounded border border-slate-200 px-2 py-1"><option>Origem</option></select>
        <select className="rounded border border-slate-200 px-2 py-1"><option>Responsável</option></select>
        <select className="rounded border border-slate-200 px-2 py-1"><option>Mais recentes</option></select>
      </div>
      <button onClick={onAddLead} className="rounded-lg bg-[#00B9A7] px-3 py-1.5 text-xs font-medium text-white shadow hover:brightness-95">+ Adicionar</button>
    </div>
  );
}
