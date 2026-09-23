// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';

import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import SolicitudesListPage from './components/pages/SolicitudesListPage';
import NuevaSolicitudPage from './components/pages/NuevaSolicitudPage';
import SolicitudDetailPage from './components/pages/SolicitudDetailPage';
import EditarSolicitudPage from './components/pages/EditarSolicitudPage';
import AdminResumenPage from './components/pages/AdminResumenPage';
import NotFoundPage from './components/pages/NotFoundPage';
import ConfirmarCuentaPage from './components/pages/ConfirmarCuentaPage';
import RecuperarContrasenaPage from './components/pages/RecuperarContrasenaPage';
import RestablecerContrasenaPage from './components/pages/RestablecerContrasenaPage';
import ConfirmarCambioEmailPage from './components/pages/ConfirmarCambioEmailPage';
import PerfilPage from './components/pages/PerfilPage';


export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Públicas — redirigen a /solicitudes si ya hay sesión */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
          </Route>

          <Route path="/confirmar/:token" element={<ConfirmarCuentaPage />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasenaPage />} />

          {/* pública (llega por link de email): */}
          <Route path="/confirmar-cambio-email/:token" element={<ConfirmarCambioEmailPage />} />

          {/* protegida, dentro del mismo grupo que /solicitudes, /resumen, etc.: */}
          <Route element={<ProtectedRoute />}>
            {/* ...rutas existentes... */}
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>

          {/* Protegidas — requieren sesión */}
          <Route element={<ProtectedRoute />}>
            <Route path="/solicitudes" element={<SolicitudesListPage />} />
            <Route path="/solicitudes/nueva" element={<NuevaSolicitudPage />} />
            <Route path="/solicitudes/:id" element={<SolicitudDetailPage />} />
            <Route path="/solicitudes/:id/editar" element={<EditarSolicitudPage />} />
          </Route>

          {/* Solo admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/resumen" element={<AdminResumenPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/solicitudes" replace />} />

          {/* Ruta comodín — 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
