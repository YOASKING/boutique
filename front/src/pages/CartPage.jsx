import { useNavigate, useOutletContext } from 'react-router-dom';
import CartLine from '../components/CartLine.jsx';
import { STRIPE_LINK } from '../constants.js';

export default function CartPage() {
  const { cart, onQuantity, onRemove } = useOutletContext();
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <section className="section">
        <h2>Panier</h2>
        <p className="empty">Votre panier est vide.</p>
        <button className="cta" type="button" onClick={() => navigate('/catalogue')}>Continuer les achats</button>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Panier</h2>
      </div>
      <ul className="cart-list">
        {cart.map((item) => (
          <CartLine
            key={item.id}
            item={item}
            onQuantity={onQuantity}
            onRemove={onRemove}
          />
        ))}
      </ul>
      <div className="cart-total">
        <span>Total</span>
        <strong>{total} €</strong>
      </div>
      <a
        className="cta pay"
        href={STRIPE_LINK || '#'}
        onClick={(event) => { if (!STRIPE_LINK) event.preventDefault(); }}
      >
        Payer
      </a>
    </section>
  );
}
