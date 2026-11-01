export default function CartLine({ item, onQuantity, onRemove }) {
  return (
    <li className="cart-line">
      <div>
        <strong>{item.name}</strong>
        <p>{item.price} €</p>
      </div>
      <div className="qty">
        <button type="button" onClick={() => onQuantity(item.id, -1)}>-</button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => onQuantity(item.id, 1)}>+</button>
      </div>
      <span>{item.price * item.quantity} €</span>
      <button type="button" className="link" onClick={() => onRemove(item.id)}>Retirer</button>
    </li>
  );
}
