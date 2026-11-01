import { useNavigate, useOutletContext } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import ProductGrid from '../components/ProductGrid.jsx';

export default function HomePage() {
  const { products, onAdd } = useOutletContext();
  const navigate = useNavigate();

  return (
    <>
      <Hero />
      <section className="section">
        <div className="section-head">
          <h2>Sélection</h2>
          <button className="link" type="button" onClick={() => navigate('/catalogue')}>Tout voir</button>
        </div>
        <ProductGrid
          products={products.slice(0, 3)}
          onOpen={(id) => navigate(`/catalogue/${id}`)}
          onAdd={onAdd}
        />
      </section>
    </>
  );
}
