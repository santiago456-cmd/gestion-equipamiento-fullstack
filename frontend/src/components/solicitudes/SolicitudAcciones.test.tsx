// src/components/solicitudes/SolicitudAcciones.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SolicitudAcciones from './SolicitudAcciones';
import type { Solicitud } from '../../types/solicitud';

const solicitudPendiente: Solicitud = {
  id: 1,
  estado: 'pendiente',
  solicitante: { id: 2, nombre: 'Lucas Fernández' },
};

const solicitudAprobada: Solicitud = { ...solicitudPendiente, estado: 'aprobada' };

function renderAcciones(props: Partial<React.ComponentProps<typeof SolicitudAcciones>> = {}) {
  return render(
    <MemoryRouter>
      <SolicitudAcciones
        id={1}
        solicitud={solicitudPendiente}
        isAdmin={false}
        isEncargado={false}
        isOwner={false}
        onAprobar={vi.fn()}
        onRechazar={vi.fn()}
        onCancelar={vi.fn()}
        onDevolver={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('SolicitudAcciones', () => {
  it('no renderiza nada si no hay ninguna acción disponible', () => {
    const { container } = renderAcciones({ isAdmin: false, isOwner: false, solicitud: solicitudAprobada });
    // isOwner=false + isAdmin=false + estado aprobada => solo canDevolver depende de isAdmin||isOwner, ambos false
    expect(container.firstChild).toBeNull();
  });

  it('el dueño ve Editar y Cancelar cuando está pendiente', () => {
    renderAcciones({ isOwner: true, solicitud: solicitudPendiente });
    expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar Solicitud/ })).toBeInTheDocument();
  });

  it('el admin ve Aprobar y Rechazar cuando está pendiente', () => {
    renderAcciones({ isAdmin: true, solicitud: solicitudPendiente });
    expect(screen.getByRole('button', { name: /Aprobar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rechazar/ })).toBeInTheDocument();
  });

  it('ni el admin ni el dueño ven Aprobar/Rechazar si la solicitud ya no está pendiente', () => {
    renderAcciones({ isAdmin: true, solicitud: solicitudAprobada });
    expect(screen.queryByRole('button', { name: /Aprobar/ })).not.toBeInTheDocument();
  });

  it('el dueño ve "Registrar Devolución" cuando está aprobada', () => {
    renderAcciones({ isOwner: true, solicitud: solicitudAprobada });
    expect(screen.getByRole('button', { name: /Registrar Devolución/ })).toBeInTheDocument();
  });

  it('llama a onCancelar al hacer click en "Cancelar Solicitud"', async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    renderAcciones({ isOwner: true, solicitud: solicitudPendiente, onCancelar });

    await user.click(screen.getByRole('button', { name: /Cancelar Solicitud/ }));

    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('llama a onAprobar al hacer click en "Aprobar"', async () => {
    const user = userEvent.setup();
    const onAprobar = vi.fn();
    renderAcciones({ isAdmin: true, solicitud: solicitudPendiente, onAprobar });

    await user.click(screen.getByRole('button', { name: /Aprobar/ }));

    expect(onAprobar).toHaveBeenCalledTimes(1);
  });

  it('abre el modal de rechazo, valida el motivo vacío y confirma con motivo cargado', async () => {
    const user = userEvent.setup();
    const onRechazar = vi.fn().mockResolvedValue(undefined);
    renderAcciones({ isAdmin: true, solicitud: solicitudPendiente, onRechazar });

    await user.click(screen.getByRole('button', { name: /Rechazar/ }));

    expect(screen.getByText('Rechazar Solicitud')).toBeInTheDocument();

    // Intentar confirmar sin motivo -> debe mostrar error de validación y no llamar onRechazar
    await user.click(screen.getByRole('button', { name: 'Confirmar Rechazo' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onRechazar).not.toHaveBeenCalled();

    // Cargar motivo y confirmar
    await user.type(screen.getByLabelText('Motivo del rechazo'), 'No cumple los requisitos');
    await user.click(screen.getByRole('button', { name: 'Confirmar Rechazo' }));

    expect(onRechazar).toHaveBeenCalledTimes(1);
  });

  it('cierra el modal de rechazo al hacer click en "Cancelar" dentro del modal', async () => {
    const user = userEvent.setup();
    renderAcciones({ isAdmin: true, solicitud: solicitudPendiente });

    await user.click(screen.getByRole('button', { name: /Rechazar/ }));
    expect(screen.getByText('Rechazar Solicitud')).toBeInTheDocument();

    // Hay dos botones "Cancelar": el del modal es el último que aparece
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancelar' });
    await user.click(cancelButtons[cancelButtons.length - 1]);

    expect(screen.queryByText('Rechazar Solicitud')).not.toBeInTheDocument();
  });

  it('el encargado ve "Aprobar" pero NO "Rechazar" cuando está pendiente', () => {
  renderAcciones({ isEncargado: true, solicitud: solicitudPendiente });
  expect(screen.getByRole('button', { name: /Aprobar/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Rechazar/ })).not.toBeInTheDocument();
});

it('el encargado no ve ninguna acción sobre una solicitud ya aprobada (y no es dueño)', () => {
  renderAcciones({ isEncargado: true, solicitud: solicitudAprobada });
  expect(screen.queryByRole('button', { name: /Aprobar/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Registrar Devolución/ })).not.toBeInTheDocument();
});

it('llama a onAprobar cuando un encargado hace click en "Aprobar"', async () => {
  const user = userEvent.setup();
  const onAprobar = vi.fn();
  renderAcciones({ isEncargado: true, solicitud: solicitudPendiente, onAprobar });

  await user.click(screen.getByRole('button', { name: /Aprobar/ }));

  expect(onAprobar).toHaveBeenCalledTimes(1);
});

it('muestra la nota "como encargado" cuando corresponde', () => {
  renderAcciones({ isEncargado: true, solicitud: solicitudPendiente });
  expect(screen.getByText('Revisando solicitud como encargado.')).toBeInTheDocument();
});
});