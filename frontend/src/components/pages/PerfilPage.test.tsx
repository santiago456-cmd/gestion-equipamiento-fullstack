// src/components/pages/PerfilPage.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import PerfilPage from './PerfilPage';

function seedSession() {
  localStorage.setItem(
    'usuario',
    JSON.stringify({ id: 2, nombre: 'Carla Gómez', email: 'carla@dds.com', rol: 'usuario' }),
  );
}

describe('PerfilPage', () => {
  beforeEach(() => {
    localStorage.clear();
    seedSession();
  });

  it('muestra los datos actuales del usuario', async () => {
    renderWithProviders(<PerfilPage />, { route: '/perfil' });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Carla Gómez')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('carla@dds.com')).toBeInTheDocument();
  });

  it('actualiza el nombre y muestra el mensaje de éxito', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PerfilPage />, { route: '/perfil' });

    await waitFor(() => screen.getByDisplayValue('Carla Gómez'));

    const nombreInput = screen.getByLabelText('Nombre Completo');
    await user.clear(nombreInput);
    await user.type(nombreInput, 'Carla Actualizada');
    await user.click(screen.getByRole('button', { name: /Guardar Cambios/ }));

    expect(await screen.findByText('Perfil actualizado exitosamente.')).toBeInTheDocument();
  });

  it('solicita el cambio de email y muestra el mensaje de confirmación', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PerfilPage />, { route: '/perfil' });
    await waitFor(() => screen.getByDisplayValue('Carla Gómez'));

    await user.type(screen.getByLabelText('Nuevo Correo Electrónico'), 'nuevo@dds.com');
    await user.click(screen.getByRole('button', { name: /Solicitar Cambio/ }));

    expect(await screen.findByText(/Revisá tu nuevo correo/)).toBeInTheDocument();
  });

  it('cambia la contraseña y fuerza logout', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PerfilPage />, { route: '/perfil' });
    await waitFor(() => screen.getByDisplayValue('Carla Gómez'));

    await user.type(screen.getByLabelText('Contraseña Actual'), 'usuario123');
    await user.type(screen.getByLabelText('Nueva Contraseña'), 'nuevaClave123');
    await user.click(screen.getByRole('button', { name: /Cambiar Contraseña/ }));

    await waitFor(() => {
      expect(localStorage.getItem('usuario')).toBeNull();
    });
  });

  it('muestra error si la contraseña actual es incorrecta', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PerfilPage />, { route: '/perfil' });
    await waitFor(() => screen.getByDisplayValue('Carla Gómez'));

    await user.type(screen.getByLabelText('Contraseña Actual'), 'incorrecta1');
    await user.type(screen.getByLabelText('Nueva Contraseña'), 'nuevaClave123');
    await user.click(screen.getByRole('button', { name: /Cambiar Contraseña/ }));

    expect(await screen.findByText('La contraseña actual es incorrecta.')).toBeInTheDocument();
  });
});