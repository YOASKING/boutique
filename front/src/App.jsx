import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import AdminRoute from './auth/AdminRoute.jsx';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import Catalogue from './pages/Catalogue.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import Login from './pages/Login.jsx';
import SignupPage from './pages/SignupPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function EspaceClient() {
  return (
    <AuthProvider espace="client">
      <Layout />
    </AuthProvider>
  );
}

function EspaceAdmin() {
  return (
    <AuthProvider espace="admin">
      <AdminLayout />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<EspaceAdmin />}>
          <Route path="login" element={<Login espace="admin" />} />
          <Route element={<AdminRoute />}>
            <Route index element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route element={<EspaceClient />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/catalogue/:id" element={<ProductPage />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
