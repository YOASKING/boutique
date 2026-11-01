import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Header({ itemCount = 0, espace = 'client' }) {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();
  const admin = espace === 'admin';

  const sortir = () => {
    deconnecter();
    navigate(admin ? '/admin/login' : '/login');
  };

  if (admin) {
    return (
      <header className="header">
        <button className="logo" type="button" onClick={() => navigate('/admin')}>Administration</button>
        <nav>
          {utilisateur ? (
            <>
              <span className="user">{utilisateur}</span>
              <button type="button" onClick={sortir}>Se déconnecter</button>
            </>
          ) : (
            <NavLink to="/admin/login">Connexion</NavLink>
          )}
        </nav>
      </header>
    );
  }

  return (
    <header className="header">
      <button className="logo" type="button" onClick={() => navigate(utilisateur ? '/' : '/login')}>Boutique</button>
      <nav>
        {utilisateur ? (
          <>
            <NavLink to="/" end>Accueil</NavLink>
            <NavLink to="/catalogue">Catalogue</NavLink>
            <NavLink to="/panier">Panier{itemCount > 0 ? ` (${itemCount})` : ''}</NavLink>
            <span className="user">{utilisateur}</span>
            <button type="button" onClick={sortir}>Se déconnecter</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Connexion</NavLink>
            <NavLink to="/signup">Inscription</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
