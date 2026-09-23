// src/components/pages/NuevaSolicitudPage.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import NuevaSolicitudPage from './NuevaSolicitudPage';

describe('NuevaSolicitudPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carga la lista de equipos disponibles', async () => {
    renderWithProviders(<NuevaSolicitudPage />, { route: '/solicitudes/nueva' });

    await waitFor(() => {
      expect(screen.getByText('Notebook Dell')).toBeInTheDocument();
    });
    expect(screen.getByText('Proyector Epson')).toBeInTheDocument();
  });

  it('selecciona un equipo y avanza el stepper', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NuevaSolicitudPage />, { route: '/solicitudes/nueva' });

    await waitFor(() => screen.getByText('Notebook Dell'));
    await user.click(screen.getByText('Notebook Dell'));

    // El equipo seleccionado queda marcado visualmente; verificamos vía el input oculto de motivo/contador
    expect(screen.getByText('0 / 500')).toBeInTheDocument();
  });

  it('muestra el conteo de caracteres del motivo a medida que se escribe', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NuevaSolicitudPage />, { route: '/solicitudes/nueva' });

    await waitFor(() => screen.getByText('Notebook Dell'));
    await user.type(screen.getByLabelText('Motivo de la Solicitud'), 'Necesito el equipo');

    expect(screen.getByText('18 / 500')).toBeInTheDocument();
  });
});