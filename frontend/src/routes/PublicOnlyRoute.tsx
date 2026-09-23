// src/routes/PublicOnlyRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicOnlyRoute — redirige a /solicitudes si el usuario ya tiene sesión activa.
 * Usado para /login y /registro.
 */
export default function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/solicitudes" replace />;
  }

  return <Outlet />;
}