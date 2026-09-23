// e2e/fixtures/mock-api.ts
import type { Page } from '@playwright/test';
import { mockSolicitudes, mockEquipos, mockHistorial, mockResumen } from '../../src/test/handlers';

const baseURL = 'http://localhost:3000/api';

export async function mockApi(page: Page) {
  await page.route(`${baseURL}/solicitudes?*`, async (route) => {
    await route.fulfill({
      json: { data: mockSolicitudes, totalItems: mockSolicitudes.length, page: 1, limit: 5 },
    });
  });

  await page.route(`${baseURL}/solicitudes/dashboard/resumen`, async (route) => {
    await route.fulfill({ json: { data: mockResumen } });
  });

  await page.route(`${baseURL}/solicitudes/*/historial`, async (route) => {
    await route.fulfill({ json: { data: mockHistorial } });
  });

  await page.route(`${baseURL}/equipos*`, async (route) => {
    await route.fulfill({ json: { data: mockEquipos } });
  });

  await page.route(`${baseURL}/solicitudes/1`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { data: mockSolicitudes[0] } });
    } else {
      await route.continue();
    }
  });

  await page.route(`${baseURL}/solicitudes/1/aprobar`, async (route) => {
    await route.fulfill({ json: { data: { ...mockSolicitudes[0], estado: 'aprobada' } } });
  });

  await page.route(`${baseURL}/solicitudes`, async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ json: { data: { id: 99, estado: 'pendiente', ...body } } });
    } else {
      await route.continue();
    }
  });

  await page.route(`${baseURL}/auth/login`, async (route) => {
    const body = route.request().postDataJSON() as { email: string; password: string };
    if (body.email === 'carla@dds.com' && body.password === 'usuario123') {
      await route.fulfill({
        json: {
          ok: true,
          token: 'fake-jwt-token',
          usuario: { id: 2, nombre: 'Carla Gómez', email: 'carla@dds.com', rol: 'usuario' },
        },
      });
    } else {
      await route.fulfill({ status: 401, json: { ok: false, error: 'Credenciales inválidas' } });
    }
  });
}