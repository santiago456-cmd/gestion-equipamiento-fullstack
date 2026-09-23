// src/components/layout/TopBar.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import TopBar from './TopBar';

function renderTopBar(usuario?: { nombre: string; rol: string }) {
  if (usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TopBar />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('TopBar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra el nombre y el rol traducido del usuario', async () => {
    renderTopBar({ nombre: 'Carla Gómez', rol: 'admin' });
    await waitFor(() => expect(screen.getByText('Carla Gómez')).toBeInTheDocument());
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('muestra "Usuario" como fallback cuando no hay sesión', async () => {
    renderTopBar();
    await waitFor(() => expect(screen.getByText('Usuario')).toBeInTheDocument());
  });

  it('logout limpia la sesión al hacer click en "Cerrar Sesión"', async () => {
    const user = userEvent.setup();
    renderTopBar({ nombre: 'Carla Gómez', rol: 'usuario' });
    await waitFor(() => expect(screen.getByText('Carla Gómez')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));

    expect(localStorage.getItem('usuario')).toBeNull();
  });
});