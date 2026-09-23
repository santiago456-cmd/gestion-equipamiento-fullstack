// src/components/pages/SolicitudDetailPage.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRoute } from '../../test/test-utils';
import SolicitudDetailPage from './SolicitudDetailPage';

function seedSession(rol: string, id = 99) {
  localStorage.setItem('token', 'fake-jwt-token');
  localStorage.setItem('usuario', JSON.stringify({ id, nombre: 'Admin General', rol }));
}

describe('SolicitudDetailPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra los datos de la solicitud, el historial y las acciones de admin', async () => {
  seedSession('admin');
  renderWithRoute(<SolicitudDetailPage />, {
    route: '/solicitudes/1',
    path: '/solicitudes/:id',
  });

  await waitFor(() => {
    expect(screen.getByText(/Detalle de Solicitud/)).toBeInTheDocument();
  });

  // "Lucas Fernández" aparece legítimamente en SolicitudInfoCard y en SolicitudHistorial
  expect(screen.getAllByText('Lucas Fernández').length).toBeGreaterThanOrEqual(1);
  // El email es exclusivo de SolicitudInfoCard: confirma que esa sección renderizó bien
  expect(screen.getByText('lucas@dds.com')).toBeInTheDocument();
  expect(screen.getByText('Historial de Cambios')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Aprobar/ })).toBeInTheDocument();
});

  it('muestra la alerta de "Solicitud Pendiente" cuando corresponde', async () => {
    seedSession('usuario');
    renderWithRoute(<SolicitudDetailPage />, {
      route: '/solicitudes/1',
      path: '/solicitudes/:id',
    });

    await waitFor(() => {
      expect(screen.getByText('Solicitud Pendiente')).toBeInTheDocument();
    });
  });

  it('un encargado ve el botón Aprobar pero no Rechazar', async () => {
    seedSession('encargado');
    renderWithRoute(<SolicitudDetailPage />, {
      route: '/solicitudes/1',
      path: '/solicitudes/:id',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Aprobar/ })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Rechazar/ })).not.toBeInTheDocument();
});
});