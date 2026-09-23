// src/components/pages/RestablecerContrasenaPage.test.tsx
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoute } from '../../test/test-utils';
import RestablecerContrasenaPage from './RestablecerContrasenaPage';

describe('RestablecerContrasenaPage', () => {
  it('muestra error si no hay token en la URL', () => {
    renderWithRoute(<RestablecerContrasenaPage />, {
      route: '/restablecer-contrasena',
      path: '/restablecer-contrasena',
    });
    expect(screen.getByText('Enlace inválido')).toBeInTheDocument();
  });

  it('restablece la contraseña con un token válido', async () => {
    const user = userEvent.setup();
    renderWithRoute(<RestablecerContrasenaPage />, {
      route: '/restablecer-contrasena?token=token-valido',
      path: '/restablecer-contrasena',
    });

    await user.type(screen.getByLabelText('Nueva Contraseña'), 'nuevaClave123');
    await user.type(screen.getByLabelText('Confirmar Contraseña'), 'nuevaClave123');
    await user.click(screen.getByRole('button', { name: /Restablecer contraseña/ }));

    await waitFor(() => {
      expect(screen.getByText('Contraseña actualizada')).toBeInTheDocument();
    });
  });
});