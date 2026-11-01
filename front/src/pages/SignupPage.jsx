import { Navigate, useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm.jsx';
import { estAdmin, useAuth } from '../auth/AuthContext.jsx';

export default function SignupPage() {
  const navigate = useNavigate();
  const { utilisateur, role, pret } = useAuth();

  if (!pret) return null;
  if (utilisateur) return <Navigate to={estAdmin(role) ? '/admin' : '/catalogue'} replace />;

  return (
    <section className="auth">
      <h2>Créer un compte</h2>
      <p>Cela ne prend qu’un instant.</p>
      <SignupForm />
      <button className="link" type="button" onClick={() => navigate('/login')}>Déjà inscrit ?</button>
    </section>
  );
}
