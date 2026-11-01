import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute() {
  const { utilisateur, pret } = useAuth();
  const parent = useOutletContext();

  if (!pret) return null;
  if (!utilisateur) return <Navigate to="/login" replace />;
  return <Outlet context={parent} />;
}
