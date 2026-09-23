// src/components/pages/LoginPage.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra errores de validación si se envía el formulario vacío', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(screen.getByRole('button', { name: /Iniciar Sesión/ }));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Correo Electrónico')).toHaveAttribute('aria-invalid', 'true');
  });

  it('muestra un error cuando las credenciales son inválidas', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.type(screen.getByLabelText('Correo Electrónico'), 'incorrecto@dds.com');
    await user.type(screen.getByLabelText('Contraseña'), 'claveMala');
    await user.click(screen.getByRole('button', { name: /Iniciar Sesión/ }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('inicia sesión y persiste el usuario en localStorage con credenciales válidas', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.type(screen.getByLabelText('Correo Electrónico'), 'carla@dds.com');
    await user.type(screen.getByLabelText('Contraseña'), 'usuario123');
    await user.click(screen.getByRole('button', { name: /Iniciar Sesión/ }));

    await waitFor(() => {
      expect(localStorage.getItem('usuario')).not.toBeNull()
    });

    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') ?? '{}');
    expect(usuarioGuardado.nombre).toBe('Carla Gómez');
  });
});