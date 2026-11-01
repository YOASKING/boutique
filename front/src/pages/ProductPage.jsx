import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

export default function ProductPage() {
  const { products, onAdd } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return (
      <section className="section">
        <p className="empty">Produit introuvable.</p>
        <button className="link" type="button" onClick={() => navigate('/catalogue')}>Retour au catalogue</button>
      </section>
    );
  }

  return (
    <section className="product">
      <button className="link" type="button" onClick={() => navigate('/catalogue')}>← Catalogue</button>
      <div className="product-grid">
        <div className="product-visual">
          {product.image
            ? <img src={'/api' + product.image} alt={product.name} />
            : <span aria-hidden="true">{product.name.charAt(0)}</span>}
        </div>
        <div>
          <p className="eyebrow">{product.info}</p>
          <h1>{product.name}</h1>
          <p className="lead">{product.description}</p>
          <p className="product-price">{product.price} €</p>
          <button className="cta" type="button" onClick={() => onAdd(product)}>Ajouter au panier</button>
        </div>
      </div>
    </section>
  );
}
