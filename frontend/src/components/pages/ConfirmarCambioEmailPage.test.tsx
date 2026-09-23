// src/components/pages/ConfirmarCambioEmailPage.test.tsx
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRoute } from '../../test/test-utils';
import ConfirmarCambioEmailPage from './ConfirmarCambioEmailPage';

describe('ConfirmarCambioEmailPage', () => {
  it('muestra éxito con un token válido', async () => {
    renderWithRoute(<ConfirmarCambioEmailPage />, {
      route: '/confirmar-cambio-email/token-valido',
      path: '/confirmar-cambio-email/:token',
    });

    await waitFor(() => {
      expect(screen.getByText('¡Correo actualizado!')).toBeInTheDocument();
    });
  });

  it('muestra error con un token inválido', async () => {
    renderWithRoute(<ConfirmarCambioEmailPage />, {
      route: '/confirmar-cambio-email/token-malo',
      path: '/confirmar-cambio-email/:token',
    });

    await waitFor(() => {
      expect(screen.getByText('No pudimos confirmar el cambio')).toBeInTheDocument();
    });
  });
});