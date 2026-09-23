// src/components/solicitudes/SolicitudInfoCard.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SolicitudInfoCard from './SolicitudInfoCard';
import type { Solicitud } from '../../types/solicitud';

const solicitud: Solicitud = {
  id: 1,
  estado: 'pendiente',
  equipo: {
    id: 10,
    nombre: 'Notebook Dell',
    categoria: 'Hardware Computacional',
    codigoInventario: 'INV-001',
  },
  solicitante: { id: 2, nombre: 'Lucas Fernández', email: 'lucas@dds.com' },
  fechaRetiro: '2026-08-20',
  fechaDevolucion: '2026-08-25',
  motivo: 'Presentación en evento externo',
};

describe('SolicitudInfoCard', () => {
  it('muestra los datos del solicitante y del equipo', () => {
    render(<SolicitudInfoCard solicitud={solicitud} />);
    expect(screen.getByText('Lucas Fernández')).toBeInTheDocument();
    expect(screen.getByText('lucas@dds.com')).toBeInTheDocument();
    expect(screen.getByText(/Notebook Dell/)).toBeInTheDocument();
    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
  });

  it('muestra el motivo de la solicitud', () => {
    render(<SolicitudInfoCard solicitud={solicitud} />);
    expect(screen.getByText('Presentación en evento externo')).toBeInTheDocument();
  });

  it('no muestra la sección de autorizador si no hay uno', () => {
    render(<SolicitudInfoCard solicitud={solicitud} />);
    expect(screen.queryByText('Autorizado por')).not.toBeInTheDocument();
  });

  it('muestra al autorizador cuando está presente', () => {
    const conAutorizador: Solicitud = {
      ...solicitud,
      autorizador: { nombre: 'Admin General', rol: 'admin' },
    };
    render(<SolicitudInfoCard solicitud={conAutorizador} />);
    expect(screen.getByText(/Admin General/)).toBeInTheDocument();
  });
});