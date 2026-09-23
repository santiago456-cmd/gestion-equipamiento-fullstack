// src/api/axiosClient.test.ts
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { api } from './axiosClient';
import type { ApiError } from '../types/api';

const baseURL = 'http://localhost:3000/api';

describe('axiosClient', () => {
  it('envía las requests con withCredentials (para que viaje la cookie httpOnly)', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('normaliza el error de respuesta al formato ApiError', async () => {
    server.use(
      http.get(`${baseURL}/test/fail`, () =>
        HttpResponse.json({ error: 'Algo salió mal' }, { status: 500 }),
      ),
    );

    await expect(api.get('/test/fail')).rejects.toMatchObject({
      status: 500,
      message: 'Algo salió mal',
    } satisfies Partial<ApiError>);
  });

  it('dispara auth:session-expired ante un 401 fuera de /auth/login o /auth/register', async () => {
    server.use(
      http.get(`${baseURL}/test/unauthorized`, () =>
        HttpResponse.json({ error: 'Token inválido' }, { status: 401 }),
      ),
    );

    const handler = vi.fn();
    window.addEventListener('auth:session-expired', handler);

    await expect(api.get('/test/unauthorized')).rejects.toMatchObject({ status: 401 });

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('auth:session-expired', handler);
  });

  it('NO dispara auth:session-expired ante un 401 de /auth/login (credenciales inválidas)', async () => {
    server.use(
      http.post(`${baseURL}/auth/login`, () =>
        HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 }),
      ),
    );

    const handler = vi.fn();
    window.addEventListener('auth:session-expired', handler);

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ status: 401 });

    expect(handler).not.toHaveBeenCalled();
    window.removeEventListener('auth:session-expired', handler);
  });
});