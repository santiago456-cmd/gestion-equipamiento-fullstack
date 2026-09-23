// src/routes/ProtectedRoute.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function renderProtected(initialRoute: string, roles?: string[]) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Pantalla de login</div>} />
          <Route path="/solicitudes" element={<div>Pantalla de solicitudes</div>} />
          <Route element={<ProtectedRoute roles={roles} />}>
            <Route path="/resumen" element={<div>Pantalla de resumen</div>} />
            <Route path="/protegida" element={<div>Contenido protegido</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}


describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirige a /login si no hay sesión', async () => {
    renderProtected('/protegida');
    await waitFor(() => expect(screen.getByText('Pantalla de login')).toBeInTheDocument());
  });

  it('renderiza el contenido si hay sesión activa', async () => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Carla', rol: 'usuario' }));

    renderProtected('/protegida');

    await waitFor(() => expect(screen.getByText('Contenido protegido')).toBeInTheDocument());
  });

  it('redirige a /solicitudes si el usuario no tiene el rol requerido', async () => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Carla', rol: 'usuario' }));

    renderProtected('/resumen', ['admin']);

    await waitFor(() => expect(screen.getByText('Pantalla de solicitudes')).toBeInTheDocument());
  });

  it('permite el acceso cuando el rol del usuario está en la lista permitida', async () => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Admin', rol: 'admin' }));

    renderProtected('/resumen', ['admin']);

    await waitFor(() => expect(screen.getByText('Pantalla de resumen')).toBeInTheDocument());
  });
});