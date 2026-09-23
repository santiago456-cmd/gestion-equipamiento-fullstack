// src/routes/PublicOnlyRoute.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PublicOnlyRoute from './PublicOnlyRoute';

function renderPublicOnly(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/solicitudes" element={<div>Pantalla de solicitudes</div>} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>Pantalla de login</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renderiza la ruta pública si no hay sesión', async () => {
    renderPublicOnly('/login');
    await waitFor(() => expect(screen.getByText('Pantalla de login')).toBeInTheDocument());
  });

  it('redirige a /solicitudes si ya hay sesión activa', async () => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Carla', rol: 'usuario' }));

    renderPublicOnly('/login');

    await waitFor(() => expect(screen.getByText('Pantalla de solicitudes')).toBeInTheDocument());
  });
});