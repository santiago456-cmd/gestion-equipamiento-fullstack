// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  /** Roles permitidos (opcional) */
  roles?: string[];
}

/**
 * ProtectedRoute — requiere sesión iniciada.
 * Si se pasa `roles`, además valida que el usuario tenga uno de esos roles.
 */
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading,  usuario } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // o un spinner/skeleton si preferís algo visible acá
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(usuario?.rol ?? '')) {
    return <Navigate to="/solicitudes" replace />;
  }

  return <Outlet />;
}