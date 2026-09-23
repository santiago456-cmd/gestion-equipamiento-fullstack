// src/components/solicitudes/SolicitudTable.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SolicitudTable from './SolicitudTable';
import type { Solicitud } from '../../types/solicitud';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

const mockRow: Solicitud = {
  id: 1,
  estado: 'pendiente',
  equipo: { id: 10, nombre: 'Notebook Dell' },
  solicitante: { id: 2, nombre: 'Lucas Fernández' },
  fechaRetiro: '2026-08-20',
  fechaDevolucion: '2026-08-25',
};

function renderTable(props: Partial<React.ComponentProps<typeof SolicitudTable>> = {}) {
  return render(
    <MemoryRouter>
      <SolicitudTable
        rows={[]}
        isLoading={false}
        error={null}
        currentPage={1}
        totalPages={1}
        totalResults={0}
        pageSize={5}
        onPageChange={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('SolicitudTable', () => {
  it('muestra el mensaje de carga cuando isLoading es true', () => {
    renderTable({ isLoading: true });
    expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();
  });

  it('muestra el mensaje de error cuando hay error', () => {
    renderTable({ error: 'No se pudieron cargar las solicitudes.' });
    expect(screen.getByText('No se pudieron cargar las solicitudes.')).toBeInTheDocument();
  });

  it('muestra el mensaje de estado vacío cuando no hay filas', () => {
    renderTable({ rows: [] });
    expect(
      screen.getByText('No se encontraron solicitudes para los filtros aplicados.'),
    ).toBeInTheDocument();
  });

  it('renderiza las filas y el badge de estado cuando hay datos', () => {
    renderTable({ rows: [mockRow], totalResults: 1 });
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Notebook Dell')).toBeInTheDocument();
    expect(screen.getByText('Lucas Fernández')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('no muestra la paginación cuando totalResults es 0', () => {
    renderTable({ rows: [], totalResults: 0 });
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });

  it('muestra "Vencido" para una solicitud aprobada con fechaDevolucion pasada', () => {
    const vencida: Solicitud = { ...mockRow, estado: 'aprobada', fechaDevolucion: '2020-01-01' };
    renderTable({ rows: [vencida], totalResults: 1 });
    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });

  it('navega al detalle al hacer click en "Ver"', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    const user = userEvent.setup();

    renderTable({ rows: [mockRow], totalResults: 1 });

    await user.click(screen.getByRole('button', { name: /Ver/ }));

    expect(navigateMock).toHaveBeenCalledWith('/solicitudes/1');
  });
});