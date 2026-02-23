import { PropsWithChildren } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type Props = PropsWithChildren<{ onAddLead?: () => void }>;

export function CrmLayout({ children, onAddLead }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 p-4">
        <TopBar onAddLead={onAddLead} />
        {children}
      </main>
    </div>
  );
}
