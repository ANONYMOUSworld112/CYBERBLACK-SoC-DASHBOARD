import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import Shell from './components/layout/Shell.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Setup2FAPage from './pages/Setup2FAPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import NetworkPage from './pages/NetworkPage.jsx';
import OsintPage from './pages/OsintPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token);
  const totpVerified = useAuthStore((s) => s.totpVerified);
  if (!token) return <Navigate to="/login" replace />;
  if (!totpVerified) return <Navigate to="/setup-2fa" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup-2fa" element={<Setup2FAPage />} />
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/osint" element={<OsintPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
