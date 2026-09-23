// src/api/axiosClient.ts
import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types/api';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Forma esperada del cuerpo de error que devuelve el backend: { ok: false, error: '...' }
interface BackendErrorBody {
  ok?: boolean;
  error?: string;
  message?: string;
}

// Endpoints donde un 401 es un intento de login fallido (credenciales incorrectas),
// no una sesión vencida — acá NO corresponde disparar el logout global.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Normaliza errores de respuesta: el backend devuelve { ok: false, error: '...' }
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorBody>) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Ocurrió un error inesperado. Intenta nuevamente.';

    const status = error.response?.status

    // 401 en un endpoint autenticado = la cookie expirto o es invalida
    // avisamos globalmente para que authcontext limpie la sesion y las rutas
    // protegidas redirijan solas a /login
    if(status === 401 && !isAuthEndpoint(error.config?.url)){
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }

    const apiError: ApiError = {
      status: error.response?.status,
      message,
      original: error,
    };

    return Promise.reject(apiError);
  },
);