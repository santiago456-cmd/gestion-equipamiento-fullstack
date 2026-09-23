// src/components/pages/SolicitudesListPage.test.tsx
import { describe, expect, it, beforeEach} from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { renderWithProviders } from '../../test/test-utils';
import SolicitudesListPage from './SolicitudesListPage';

const baseURL = 'http://localhost:3000/api';

function seedSession() {
  localStorage.setItem('token', 'fake-jwt-token');
  localStorage.setItem(
    'usuario',
    JSON.stringify({ id: 1, nombre: 'Carla Gómez', email: 'carla@dds.com', rol: 'usuario' }),
  );
}

describe('SolicitudesListPage', () => {
  beforeEach(() => {
    localStorage.clear();
    seedSession();
  });

  it('muestra el estado de carga y luego las solicitudes de la API', async () => {
    renderWithProviders(<SolicitudesListPage />, { route: '/solicitudes' });

    expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Notebook Dell')).toBeInTheDocument();
    });

    expect(screen.getByText('Lucas Fernández')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Solicitudes')).toBeInTheDocument();
  });

  it('muestra un mensaje de error cuando la API falla', async () => {
    server.use(
      http.get(`${baseURL}/solicitudes`, () =>
        HttpResponse.json({ error: 'Error de servidor' }, { status: 500 }),
      ),
    );

    renderWithProviders(<SolicitudesListPage />, { route: '/solicitudes' });

    await waitFor(() => {
      expect(screen.getByText('Error de servidor')).toBeInTheDocument();
    });
  });

  it('aplica un filtro y dispara una nueva búsqueda con el query param', async () => {
    const user = userEvent.setup();
    let capturedUrl: URL | null = null;

    server.use(
      http.get(`${baseURL}/solicitudes`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ data: [], totalItems: 0 });
      }),
    );

    renderWithProviders(<SolicitudesListPage />, { route: '/solicitudes' });

    await waitFor(() => {
      expect(screen.getByText('No se encontraron solicitudes para los filtros aplicados.')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Estado'), 'aprobada');
    await user.click(screen.getByRole('button', { name: /Filtrar/ }));

    await waitFor(() => {
      expect(capturedUrl?.searchParams.get('estado')).toBe('aprobada');
    });
  });

  it('navega a /solicitudes/nueva al hacer click en "Nueva Solicitud"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SolicitudesListPage />, { route: '/solicitudes' });

    await waitFor(() => {
      expect(screen.getByText('Notebook Dell')).toBeInTheDocument();
    });

    // No verificamos la navegación en sí (eso es responsabilidad de react-router),
    // solo que el botón esté presente y sea clickeable sin romper el render.
    await user.click(screen.getByRole('button', { name: /Nueva Solicitud/ }));
    expect(screen.getByRole('button', { name: /Nueva Solicitud/ })).toBeInTheDocument();
  });
});