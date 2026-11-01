import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../api.js';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function AdminLayout() {
  const [products, setProducts] = useState([]);

  const reloadProducts = () => api('/products').then(setProducts).catch(() => setProducts([]));

  useEffect(() => {
    reloadProducts();
  }, []);

  return (
    <div className="layout">
      <Header espace="admin" />
      <main className="main">
        <Outlet context={{ products, reloadProducts }} />
      </main>
      <Footer />
    </div>
  );
}
