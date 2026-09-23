// src/context/AuthContext.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { AuthProvider, useAuth } from './AuthContext';
import { server } from '../test/server';

const baseURL = 'http://localhost:3000/api';

function mockMeUnauthenticated() {
  server.use(http.get(`${baseURL}/auth/me`, () => HttpResponse.json({ ok: false }, { status: 401 })));
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('arranca sin sesión cuando localStorage está vacío', async () => {
    mockMeUnauthenticated();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.usuario).toBeNull();
  });

  it('login exitoso actualiza el estado y persiste en localStorage', async () => {
    // Neutralizamos el bootstrap automático de /me para aislar el efecto de login()
    mockMeUnauthenticated();

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false); // confirma el punto de partida real

    await act(async () => {
      await result.current.login({ email: 'carla@dds.com', password: 'usuario123' });
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.usuario?.nombre).toBe('Carla Gómez');
    expect(localStorage.getItem('usuario')).not.toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('login con credenciales inválidas rechaza y no persiste sesión', async () => {
    mockMeUnauthenticated();

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.login({ email: 'malo@dds.com', password: 'incorrecta' });
      }),
    ).rejects.toBeTruthy();

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('register llama a la API y no modifica el estado de sesión', async () => {
    mockMeUnauthenticated();

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const response = await act(async () =>
      result.current.register({ nombre: 'Nuevo', email: 'nuevo@dds.com', password: '12345678' }),
    );

    expect(response.message).toContain('registrado');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout limpia el estado y localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: 'carla@dds.com', password: 'usuario123' });
    });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('el evento auth:session-expired limpia la sesión', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: 'carla@dds.com', password: 'usuario123' });
    });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
  });
});