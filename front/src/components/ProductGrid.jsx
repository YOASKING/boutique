import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onOpen, onAdd }) {
  if (products.length === 0) return <p className="empty">Aucun produit pour le moment.</p>;

  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={onOpen}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}
