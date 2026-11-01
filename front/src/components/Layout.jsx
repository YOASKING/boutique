import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  const { utilisateur } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const reloadProducts = () => api('/products').then(setProducts).catch(() => setProducts([]));

  useEffect(() => {
    if (utilisateur) reloadProducts();
  }, [utilisateur]);

  const onAdd = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
      return [...items, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const onQuantity = (id, delta) => {
    setCart((items) => items
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  };

  const onRemove = (id) => {
    setCart((items) => items.filter((item) => item.id !== id));
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="layout">
      <Header itemCount={itemCount} />
      <main className="main">
        <Outlet context={{ products, cart, onAdd, onQuantity, onRemove, reloadProducts }} />
      </main>
      <Footer />
    </div>
  );
}
