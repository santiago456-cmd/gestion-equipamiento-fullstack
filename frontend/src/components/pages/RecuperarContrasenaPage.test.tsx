// src/components/pages/RecuperarContrasenaPage.test.tsx
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import RecuperarContrasenaPage from './RecuperarContrasenaPage';

describe('RecuperarContrasenaPage', () => {
  it('envía el email y muestra el mensaje genérico de confirmación', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RecuperarContrasenaPage />, { route: '/recuperar-contrasena' });

    await user.type(screen.getByLabelText('Correo Electrónico'), 'carla@dds.com');
    await user.click(screen.getByRole('button', { name: /Enviar enlace/ }));

    expect(await screen.findByText(/vas a recibir un enlace/)).toBeInTheDocument();
  });
});