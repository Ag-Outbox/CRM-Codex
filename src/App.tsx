import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/crm/DashboardPage';
import { PipelinePage } from './pages/crm/PipelinePage';
import { LeadsPage } from './pages/crm/LeadsPage';
import { ContatosPage } from './pages/crm/ContatosPage';
import { UsersPage } from './pages/admin/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';
import { CrmStoreProvider } from './state/crm-store';

function Private({ children }: { children: JSX.Element }) {
  const { userId, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center">Carregando...</div>;
  if (!userId) return <Navigate to="/auth" replace />;
  return children;
}

export function App() {
  return (
    <CrmStoreProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<Private><OnboardingPage /></Private>} />
        <Route path="/crm/dashboard" element={<Private><DashboardPage /></Private>} />
        <Route path="/crm/pipeline" element={<Private><PipelinePage /></Private>} />
        <Route path="/crm/leads" element={<Private><LeadsPage /></Private>} />
        <Route path="/crm/contatos" element={<Private><ContatosPage /></Private>} />
        <Route path="/admin/users" element={<Private><UsersPage /></Private>} />
        <Route path="/settings" element={<Private><SettingsPage /></Private>} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </CrmStoreProvider>
  );
}
