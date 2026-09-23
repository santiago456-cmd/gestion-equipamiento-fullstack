// src/components/pages/RegisterPage.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra error de validación si las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/registro' });

    await user.type(screen.getByLabelText('Nombre Completo'), 'Nuevo Usuario');
    await user.type(screen.getByLabelText('Correo Electrónico'), 'nuevo@dds.com');
    await user.type(screen.getByLabelText('Contraseña'), 'abcdef');
    await user.type(screen.getByLabelText('Confirmar Contraseña'), 'distinta');
    await user.click(screen.getByRole('button', { name: /Crear Cuenta/ }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('registra exitosamente y muestra el mensaje de éxito', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/registro' });

    await user.type(screen.getByLabelText('Nombre Completo'), 'Nuevo Usuario');
    await user.type(screen.getByLabelText('Correo Electrónico'), 'nuevo@dds.com');
    await user.type(screen.getByLabelText('Contraseña'), 'abcdef');
    await user.type(screen.getByLabelText('Confirmar Contraseña'), 'abcdef');
    await user.click(screen.getByRole('button', { name: /Crear Cuenta/ }));

    await waitFor(() => {
      expect(screen.getByText('Usuario registrado exitosamente.')).toBeInTheDocument();
    });
  });
});