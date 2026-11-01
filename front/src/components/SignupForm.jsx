import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function SignupForm() {
  const { connecter } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (password !== confirmation) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await api('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      await connecter(email, password);
      navigate('/catalogue');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Adresse e-mail
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Mot de passe
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <label>
        Confirmer le mot de passe
        <input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required />
      </label>
      <button className="cta" type="submit">Créer le compte</button>
      {message && <p className="error">{message}</p>}
    </form>
  );
}
