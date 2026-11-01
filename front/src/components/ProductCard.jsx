export default function ProductCard({ product, onOpen, onAdd }) {
  return (
    <article className="card">
      <button className="card-hit" onClick={() => onOpen(product.id)}>
        <div className="card-visual" aria-hidden="true">
          {product.image
            ? <img src={'/api' + product.image} alt="" />
            : product.name.charAt(0)}
        </div>
        <div className="card-body">
          <h3>{product.name}</h3>
          <p>{product.info}</p>
          <span className="price">{product.price} €</span>
        </div>
      </button>
      <button className="card-add" onClick={() => onAdd(product)}>Ajouter au panier</button>
    </article>
  );
}
