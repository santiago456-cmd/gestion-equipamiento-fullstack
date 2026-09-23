// e2e/auth.setup.ts
import { test as setup } from '@playwright/test';
import { mockApi } from './fixtures/mock-api';

const authFile = 'e2e/.auth/user.json';

setup('autenticar como usuario', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill('carla@dds.com');
  await page.getByLabel('Contraseña').fill('usuario123');
  await page.getByRole('button', { name: /Iniciar Sesión/ }).click();
  await page.waitForURL('**/solicitudes');
  await page.context().storageState({ path: authFile });
});