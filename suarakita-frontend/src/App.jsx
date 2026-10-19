import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { Loading } from './components/Feedback';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CreateReportPage from './pages/CreateReportPage';
import HomePage from './pages/HomePage';
import ReportDetailPage from './pages/ReportDetailPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-container"><Loading /></div>;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  useEffect(() => { document.documentElement.lang = 'id'; }, []);
  return <Suspense fallback={<div className="page-container"><Loading label="Menyiapkan halaman..." /></div>}><Routes><Route element={<AppLayout />}><Route index element={<HomePage />} /><Route path="login" element={<AuthPage mode="login" />} /><Route path="register" element={<AuthPage mode="register" />} /><Route path="reports/:id" element={<ReportDetailPage />} /><Route path="reports/new" element={<RequireAuth role="warga"><CreateReportPage /></RequireAuth>} /><Route path="dashboard" element={<RequireAuth role="admin"><DashboardPage /></RequireAuth>} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></Suspense>;
}
