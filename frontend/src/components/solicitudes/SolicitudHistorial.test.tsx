// src/components/solicitudes/SolicitudHistorial.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SolicitudHistorial from './SolicitudHistorial';
import type { HistorialRow } from '../../types/solicitud';

describe('SolicitudHistorial', () => {
  it('muestra el mensaje de vacío cuando no hay movimientos', () => {
    render(<SolicitudHistorial historial={[]} />);
    expect(screen.getByText('Sin movimientos registrados.')).toBeInTheDocument();
  });

  it('renderiza una fila por cada entrada del historial', () => {
    const historial: HistorialRow[] = [
      {
        id: 1,
        fechaHora: '2026-08-15T10:00:00Z',
        usuario: { nombre: 'Lucas Fernández' },
        accion: 'creacion',
        valorNuevo: JSON.stringify({ estado: 'pendiente' }),
      },
      {
        id: 2,
        fechaHora: '2026-08-16T10:00:00Z',
        operador: { nombre: 'Admin General' },
        accion: 'aprobacion',
        valorAnterior: JSON.stringify({ estado: 'pendiente' }),
        valorNuevo: JSON.stringify({ estado: 'aprobada' }),
      },
    ];

    render(<SolicitudHistorial historial={historial} />);

    expect(screen.getByText('CREACIÓN')).toBeInTheDocument();
    expect(screen.getByText('APROBACIÓN')).toBeInTheDocument();
    expect(screen.getByText('Lucas Fernández')).toBeInTheDocument();
    expect(screen.getByText('Admin General')).toBeInTheDocument();
    expect(screen.getAllByText('Estado: pendiente')).toHaveLength(2)
    expect(screen.getByText('Estado: aprobada')).toBeInTheDocument();
  });

  it('muestra "Antes"/"Ahora" cuando hay valorAnterior', () => {
    const historial: HistorialRow[] = [
      {
        id: 1,
        accion: 'rechazo',
        valorAnterior: JSON.stringify({ estado: 'pendiente' }),
        valorNuevo: JSON.stringify({ estado: 'rechazada' }),
      },
    ];
    render(<SolicitudHistorial historial={historial} />);
    expect(screen.getByText('Antes:')).toBeInTheDocument();
    expect(screen.getByText('Ahora:')).toBeInTheDocument();
  });
});