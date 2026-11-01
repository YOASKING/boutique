import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <p className="eyebrow">Collection permanente</p>
      <h1>Des pièces simples,<br />bien faites.</h1>
      <p className="lead">Une courte sélection, en noir et blanc. Rien de plus.</p>
      <button className="cta" type="button" onClick={() => navigate('/catalogue')}>Voir la boutique</button>
    </section>
  );
}
