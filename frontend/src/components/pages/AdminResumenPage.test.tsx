// src/components/pages/AdminResumenPage.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import AdminResumenPage from './AdminResumenPage';

describe('AdminResumenPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra los KPIs, la distribución por categoría y las solicitudes recientes', async () => {
    renderWithProviders(<AdminResumenPage />, { route: '/resumen' });

    expect(screen.getByText('Cargando resumen...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Solicitudes Pendientes')).toBeInTheDocument();
    });

    expect(screen.getByText('3')).toBeInTheDocument(); // pendientes
    expect(screen.getByText('Hardware Computacional')).toBeInTheDocument();
    expect(screen.getByText('Notebook Dell')).toBeInTheDocument();
  });
});