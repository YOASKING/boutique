import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const VIDE = { name: '', price: '', info: '', description: '' };

const VIDE_ADMIN = { email: '', password: '' };

export default function AdminPage() {
  const { products, reloadProducts } = useOutletContext();
  const { role } = useAuth();
  const [form, setForm] = useState(VIDE);
  const [image, setImage] = useState(null);
  const imageRef = useRef(null);
  const [nouvelAdmin, setNouvelAdmin] = useState(VIDE_ADMIN);
  const [comptes, setComptes] = useState([]);
  const [message, setMessage] = useState('');
  const principal = role === 'superadmin';

  const chargerComptes = () => {
    if (!principal) return Promise.resolve();
    return api('/users').then(setComptes).catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    chargerComptes();
  }, [principal]);

  const changer = (champ) => (event) => {
    setForm((valeur) => ({ ...valeur, [champ]: event.target.value }));
  };

  const ajouter = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('price', form.price);
      data.append('info', form.info);
      data.append('description', form.description);
      if (image) data.append('image', image);
      await api('/products', { method: 'POST', body: data });
      setForm(VIDE);
      setImage(null);
      if (imageRef.current) imageRef.current.value = '';
      await reloadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const creerAdmin = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api('/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouvelAdmin),
      });
      setNouvelAdmin(VIDE_ADMIN);
      await chargerComptes();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const changerRole = async (email, prochain) => {
    setMessage('');
    try {
      await api('/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: prochain }),
      });
      await chargerComptes();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const retirer = async (id) => {
    setMessage('');
    try {
      await api('/products/' + id, { method: 'DELETE' });
      await reloadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="section">
      <div className="section-head">
        <h2>Administration</h2>
        <p>Ajouter ou retirer un produit</p>
      </div>
      <form className="form admin-form" onSubmit={ajouter}>
        <label>
          Nom
          <input value={form.name} onChange={changer('name')} required />
        </label>
        <label>
          Prix (€)
          <input type="number" min="0" step="1" value={form.price} onChange={changer('price')} required />
        </label>
        <label>
          Détail
          <input value={form.info} onChange={changer('info')} />
        </label>
        <label>
          Description
          <input value={form.description} onChange={changer('description')} />
        </label>
        <label>
          Image
          <input
            ref={imageRef}
            className="file"
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
          />
        </label>
        <button className="cta" type="submit">Ajouter le produit</button>
        {message && <p className="error">{message}</p>}
      </form>
      <ul className="admin-list">
        {products.map((product) => (
          <li key={product.id} className="admin-line">
            <span>{product.name}</span>
            <span>{product.price} €</span>
            <button type="button" onClick={() => retirer(product.id)}>Retirer</button>
          </li>
        ))}
      </ul>
      {principal && (
        <section className="admin-roles">
          <div className="section-head">
            <h2>Comptes administrateur</h2>
            <p>Seul ce compte peut nommer ou retirer un administrateur</p>
          </div>
          <form className="form admin-form" onSubmit={creerAdmin}>
            <label>
              Adresse e-mail du nouvel administrateur
              <input
                type="email"
                value={nouvelAdmin.email}
                onChange={(event) => setNouvelAdmin((valeur) => ({ ...valeur, email: event.target.value }))}
                required
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                value={nouvelAdmin.password}
                onChange={(event) => setNouvelAdmin((valeur) => ({ ...valeur, password: event.target.value }))}
                required
              />
            </label>
            <button className="cta" type="submit">Créer un administrateur</button>
          </form>
          <ul className="admin-list">
            {comptes.map((compte) => (
              <li key={compte.email} className="admin-line">
                <span>{compte.email}</span>
                <span>{compte.role === 'admin' ? 'administrateur' : compte.role === 'superadmin' ? 'principal' : 'client'}</span>
                {compte.role === 'client' && (
                  <button type="button" onClick={() => changerRole(compte.email, 'admin')}>Nommer administrateur</button>
                )}
                {compte.role === 'admin' && (
                  <button type="button" onClick={() => changerRole(compte.email, 'client')}>Retirer le rôle</button>
                )}
                {compte.role === 'superadmin' && <span>Compte principal</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
