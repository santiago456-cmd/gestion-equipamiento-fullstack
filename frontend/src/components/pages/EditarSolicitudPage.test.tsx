// src/components/pages/EditarSolicitudPage.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRoute } from '../../test/test-utils';
import EditarSolicitudPage from './EditarSolicitudPage';

describe('EditarSolicitudPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carga y muestra los datos de la solicitud pendiente en el formulario', async () => {
    renderWithRoute(<EditarSolicitudPage />, { 
        route: '/solicitudes/1/editar',
        path: '/solicitudes/:id/editar',

    });

    await waitFor(() => {
      expect(screen.getByText('Editar Solicitud #1')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Presentación en evento externo')).toBeInTheDocument();
  });
});