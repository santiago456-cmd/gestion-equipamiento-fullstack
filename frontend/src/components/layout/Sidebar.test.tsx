// src/components/layout/Sidebar.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Sidebar from './Sidebar';

function renderSidebar(usuario?: { nombre: string; rol: string }) {
  if (usuario) {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Sidebar />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra los ítems visibles para un usuario sin rol admin', () => {
    renderSidebar({ nombre: 'Carla', rol: 'usuario' });
    expect(screen.getByText('Lista de Solicitudes')).toBeInTheDocument();
    expect(screen.getByText('Nueva Solicitud')).toBeInTheDocument();
    expect(screen.queryByText('Resumen Administrativo')).not.toBeInTheDocument();
  });

  it('muestra "Resumen Administrativo" solo para admin', () => {
    renderSidebar({ nombre: 'Admin', rol: 'admin' });
    expect(screen.getByText('Resumen Administrativo')).toBeInTheDocument();
  });

  it('no rompe cuando no hay usuario en sesión', () => {
    renderSidebar();
    expect(screen.getByText('Lista de Solicitudes')).toBeInTheDocument();
    expect(screen.queryByText('Resumen Administrativo')).not.toBeInTheDocument();
  });
});