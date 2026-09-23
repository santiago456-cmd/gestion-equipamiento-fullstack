// e2e/login.spec.ts
import { test, expect } from '@playwright/test';
import { mockApi } from './fixtures/mock-api';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test('muestra error con credenciales inválidas', async ({ page }) => {
    await mockApi(page);
    await page.goto('/login');
    await page.getByLabel('Correo Electrónico').fill('malo@dds.com');
    await page.getByLabel('Contraseña').fill('incorrecta');
    await page.getByRole('button', { name: /Iniciar Sesión/ }).click();
    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
  });

  test('inicia sesión y redirige a /solicitudes', async ({ page }) => {
    await mockApi(page);
    await page.goto('/login');
    await page.getByLabel('Correo Electrónico').fill('carla@dds.com');
    await page.getByLabel('Contraseña').fill('usuario123');
    await page.getByRole('button', { name: /Iniciar Sesión/ }).click();
    await expect(page).toHaveURL(/\/solicitudes$/);
    await expect(page.getByText('Gestión de Solicitudes')).toBeVisible();
  });
});