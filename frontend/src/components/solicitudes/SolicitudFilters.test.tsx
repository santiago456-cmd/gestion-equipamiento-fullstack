// src/components/solicitudes/SolicitudFilters.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SolicitudFilters from './SolicitudFilters';
import type { SolicitudFiltersState } from './SolicitudFilters';

const baseFilters: SolicitudFiltersState = {
  estado: '',
  equipoId: '',
  categoria: '',
  desde: '',
  hasta: '',
};

describe('SolicitudFilters', () => {
  it('renderiza los cinco campos de filtro y el botón', () => {
    render(<SolicitudFilters filters={baseFilters} onChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
    expect(screen.getByLabelText('ID Equipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Desde')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filtrar/ })).toBeInTheDocument();
  });

  it('llama a onChange con la key y el valor correctos al escribir en un campo', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SolicitudFilters filters={baseFilters} onChange={handleChange} onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText('ID Equipo'), '4');

    expect(handleChange).toHaveBeenCalledWith('equipoId', '4');
  });

  it('llama a onChange al seleccionar un estado', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SolicitudFilters filters={baseFilters} onChange={handleChange} onSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText('Estado'), 'aprobada');

    expect(handleChange).toHaveBeenCalledWith('estado', 'aprobada');
  });

  it('dispara onSubmit al enviar el formulario', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<SolicitudFilters filters={baseFilters} onChange={vi.fn()} onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: /Filtrar/ }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});