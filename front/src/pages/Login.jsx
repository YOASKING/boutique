import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { estAdmin, useAuth } from '../auth/AuthContext.jsx';

export default function Login({ espace = 'client' }) {
  const { utilisateur, role, pret, connecter, deconnecter } = useAuth();
  const naviguer = useNavigate();
  const admin = espace === 'admin';
  const champLogin = useRef(null);
  const [login, setLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!champLogin.current) return;
    champLogin.current.focus();
    console.log('[useRef] focus sur le login. Une ref ne déclenche pas de rendu, un state le ferait.');
  }, [pret, utilisateur]);

  console.log('[useState Login] login =', login, '| mot de passe saisi =', motDePasse.length > 0);

  if (!pret) return null;
  if (utilisateur && (admin ? estAdmin(role) : !estAdmin(role))) {
    return <Navigate to={admin ? '/admin' : '/catalogue'} replace />;
  }

  const soumettre = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const session = await connecter(login, motDePasse);
      if (admin && !estAdmin(session.role)) {
        deconnecter();
        setMessage('Réservé à l’administrateur.');
        return;
      }
      if (!admin && estAdmin(session.role)) {
        deconnecter();
        setMessage('Ce compte se connecte sur l’espace administrateur.');
        return;
      }
      const destination = admin ? '/admin' : '/catalogue';
      console.log('[useNavigate] identifiants acceptés →', destination, '(sans useLocation)');
      naviguer(destination);
    } catch (error) {
      setMessage(error.message);
      console.log('[useState Login] identifiants refusés, on reste sur Login');
    }
  };

  return (
    <section className="auth">
      <h2>{admin ? 'Connexion administrateur' : 'Connexion'}</h2>
      <form className="form" onSubmit={soumettre}>
        <label>
          Identifiant
          <input
            ref={champLogin}
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={motDePasse}
            onChange={(event) => setMotDePasse(event.target.value)}
            required
          />
        </label>
        <button className="cta" type="submit">Se connecter</button>
        {message && <p className="error">{message}</p>}
      </form>
      {!admin && (
        <button className="link" type="button" onClick={() => naviguer('/signup')}>
          Pas encore de compte ?
        </button>
      )}
    </section>
  );
}
