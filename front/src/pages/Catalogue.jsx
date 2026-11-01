import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Catalogue() {
  const { products, onAdd } = useOutletContext();
  const { utilisateur } = useAuth();
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState('');
 
  const produits = useMemo(() => {
    const texte = recherche.trim().toLowerCase();
    if (!texte) return products;
    return products.filter((product) => (
      product.name.toLowerCase().includes(texte)
      || product.info.toLowerCase().includes(texte)
      || product.description.toLowerCase().includes(texte)
    ));
  }, [products, recherche]);

  return (
    <section className="section">
      <div className="section-head">
        <h2>Catalogue</h2>
        <p>{utilisateur} · {produits.length} article{produits.length > 1 ? 's' : ''}</p>
      </div>
      <label className="search">
        Rechercher un produit
        <input
          type="search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="T-shirt, tasse, coton..."
        />
      </label>
      {produits.length === 0 ? (
        <p className="empty">{recherche.trim() ? 'Aucun produit ne correspond.' : 'Aucun produit pour le moment.'}</p>
      ) : (
        <ProductGrid
          products={produits}
          onOpen={(id) => navigate(`/catalogue/${id}`)}
          onAdd={onAdd}
        />
      )}
    </section>
  );
}
