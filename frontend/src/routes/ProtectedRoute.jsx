// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — requiere sesión iniciada.
 * Si se pasa `roles`, además valida que el usuario tenga uno de esos roles.
 *
 * Props:
 *   roles {string[]} — roles permitidos (opcional)
 */
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, usuario } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(usuario?.rol)) {
    return <Navigate to="/solicitudes" replace />;
  }

  return <Outlet />;
}
