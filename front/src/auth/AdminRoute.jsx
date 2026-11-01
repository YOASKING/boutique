import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { estAdmin, useAuth } from './AuthContext.jsx';

export default function AdminRoute() {
  const { role, pret } = useAuth();
  const parent = useOutletContext();

  if (!pret) return null;

  if (!estAdmin(role)) {
    console.log('[Navigate] pas admin → /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet context={parent} />;
}
