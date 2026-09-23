// e2e/solicitud-detail.spec.ts
import { test, expect } from '@playwright/test';
import { mockApi } from './fixtures/mock-api';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'usuario',
      JSON.stringify({ id: 1, nombre: 'Admin General', email: 'admin@dds.com', rol: 'admin' }),
    );
  });
  await mockApi(page);
});

test('un admin puede aprobar una solicitud pendiente', async ({ page }) => {
  await page.goto('/solicitudes/1');

  await expect(page.getByText(/Detalle de Solicitud/)).toBeVisible();

  await page.getByRole('button', { name: /Aprobar/ }).click();

  await expect(page.getByText('Aprobada')).toBeVisible();
});