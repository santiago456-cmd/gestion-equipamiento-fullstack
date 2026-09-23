// e2e/nueva-solicitud.spec.ts
import { test, expect } from '@playwright/test';
import { mockApi } from './fixtures/mock-api';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('crea una solicitud completando los tres pasos del formulario', async ({ page }) => {
  await page.goto('/solicitudes/nueva');

  await expect(page.getByText('Notebook Dell')).toBeVisible();
  await page.getByText('Notebook Dell').click();

  await page.getByLabel('Fecha de Retiro').fill('2026-09-01');
  await page.getByLabel('Fecha de Devolución Estimada').fill('2026-09-05');

  await page
    .getByLabel('Motivo de la Solicitud')
    .fill('Necesito el equipo para una capacitación externa.');

  await page.getByRole('button', { name: /Enviar Solicitud/ }).click();

  await expect(page).toHaveURL(/\/solicitudes$/);
});