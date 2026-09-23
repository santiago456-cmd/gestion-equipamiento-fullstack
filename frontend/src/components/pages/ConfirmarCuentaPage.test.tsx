// src/components/pages/ConfirmarCuentaPage.test.tsx
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRoute } from '../../test/test-utils';
import ConfirmarCuentaPage from './ConfirmarCuentaPage';

describe('ConfirmarCuentaPage', () => {
  it('muestra éxito con un token válido', async () => {
    renderWithRoute(<ConfirmarCuentaPage />, {
      route: '/confirmar/token-valido',
      path: '/confirmar/:token',
    });

    await waitFor(() => {
      expect(screen.getByText('¡Cuenta confirmada!')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Ir a iniciar sesión/ })).toHaveAttribute('href', '/login');
  });

  it('muestra error con un token inválido', async () => {
    renderWithRoute(<ConfirmarCuentaPage />, {
      route: '/confirmar/token-malo',
      path: '/confirmar/:token',
    });

    await waitFor(() => {
      expect(screen.getByText('No pudimos confirmar tu cuenta')).toBeInTheDocument();
    });
  });
});