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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas — redirigen a /solicitudes si ya hay sesión */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
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
