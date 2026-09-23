// e2e/solicitudes-list.spec.ts
import { test, expect } from '@playwright/test';
import { mockApi } from './fixtures/mock-api';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('lista solicitudes y navega al detalle', async ({ page }) => {
  await page.goto('/solicitudes');
  await expect(page.getByText('Notebook Dell')).toBeVisible();

  await page.getByRole('button', { name: /Ver/ }).click();

  await expect(page).toHaveURL(/\/solicitudes\/1$/);
  await expect(page.getByText(/Detalle de Solicitud/)).toBeVisible();
});

test('filtra por estado y refleja el filtro en la URL', async ({ page }) => {
  await page.goto('/solicitudes');
  await page.getByLabel('Estado').selectOption('aprobada');
  await page.getByRole('button', { name: /Filtrar/ }).click();

  await expect(page).toHaveURL(/estado=aprobada/);
});