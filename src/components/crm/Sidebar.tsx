import { BarChart3, Bell, BriefcaseBusiness, Contact, Gauge, KanbanSquare, Settings2, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const primary = [
  { to: '/crm/dashboard', icon: Gauge, label: 'Dashboard' },
  { to: '/crm/pipeline', icon: KanbanSquare, label: 'Graph Viewer' },
  { to: '/crm/contatos', icon: Contact, label: 'Contatos' },
];

const secondary = [
  { to: '/crm/leads', icon: BriefcaseBusiness, label: 'Leads' },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
  { to: '/settings', icon: Settings2, label: 'Configurações' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
    isActive ? 'bg-slate-200 text-slate-900 border-t-2 border-blue-500' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-[#f7f7f8] p-3">
      <div className="mb-6 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
        <BarChart3 className="text-teal-600" size={16} />
        <p className="text-sm font-semibold">CRM Codex</p>
      </div>

      <nav className="space-y-1">
        {primary.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <item.icon size={15} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="my-4 border-t border-slate-200" />
      <p className="mb-2 px-2 text-xs uppercase text-slate-400">Painéis</p>
      <nav className="space-y-1">
        {secondary.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <item.icon size={15} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-xs text-slate-500">
        <Bell size={14} /> Integrações: WhatsApp / IA / Agenda
      </div>
    </aside>
  );
}
