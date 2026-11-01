import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, definirEspace } from '../api.js';

const AuthContext = createContext(null);

function cleSession(espace) {
  return espace === 'admin' ? 'session-admin' : 'session';
}

function lireSession(cle) {
  const brut = localStorage.getItem(cle);
  if (!brut) return null;
  try {
    const session = JSON.parse(brut);
    if (!session?.email || !session?.token) return null;
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ espace = 'client', children }) {
  const cle = cleSession(espace);
  definirEspace(espace);
  const [utilisateur, setUtilisateur] = useState(null);
  const [role, setRole] = useState(null);
  const [pret, setPret] = useState(false);
  const connecterPrecedent = useRef(null);
  const deconnecterPrecedent = useRef(null);

  useEffect(() => {
    definirEspace(espace);
    const session = lireSession(cle);
    console.log(
      '[useEffect] rechargement, session lue =',
      session?.email ?? null,
      '— sans cet effet, utilisateur resterait null après F5',
    );
    if (!session) {
      localStorage.removeItem(cle);
      setPret(true);
      return;
    }
    api('/me')
      .then((data) => {
        const admin = data.role === 'admin' || data.role === 'superadmin';
        if ((espace === 'admin' && !admin) || (espace === 'client' && admin)) {
          localStorage.removeItem(cle);
          return;
        }
        setUtilisateur(data.email);
        setRole(data.role);
      })
      .catch(() => {
        localStorage.removeItem(cle);
      })
      .finally(() => setPret(true));
  }, [espace, cle]);

  const connecter = useCallback(async (login, motDePasse) => {
    const data = await api('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: login, password: motDePasse }),
    });
    const session = { email: data.email, role: data.role, token: data.token };
    console.log('[useState] setUtilisateur(', session.email, session.role, ') → les composants qui lisent le contexte se re-rendent');
    setUtilisateur(session.email);
    setRole(session.role);
    localStorage.setItem(cle, JSON.stringify(session));
    return session;
  }, [cle]);

  const deconnecter = useCallback(() => {
    console.log('[useCallback] deconnecter retire la session');
    setUtilisateur(null);
    setRole(null);
    localStorage.removeItem(cle);
  }, [cle]);

  console.log('[useCallback] connecter a la même référence qu’au rendu précédent :', connecterPrecedent.current === connecter);
  console.log('[useCallback] deconnecter a la même référence qu’au rendu précédent :', deconnecterPrecedent.current === deconnecter);
  connecterPrecedent.current = connecter;
  deconnecterPrecedent.current = deconnecter;

  const value = useMemo(() => {
    console.log('[useMemo] value du Provider recalculée (utilisateur, connecter ou deconnecter a changé)');
    return { utilisateur, role, pret, connecter, deconnecter };
  }, [utilisateur, role, pret, connecter, deconnecter]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function estAdmin(role) {
  return role === 'admin' || role === 'superadmin';
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) throw new Error('useAuth doit être utilisé dans AuthProvider');
  console.log('[useContext] utilisateur lu sans props :', contexte.utilisateur, contexte.role);
  return contexte;
}
