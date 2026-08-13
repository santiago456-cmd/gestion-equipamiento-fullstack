// src/api/axiosClient.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adjunta el token JWT a cada request si existe en localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza errores de respuesta: el backend devuelve { ok: false, error: '...' }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Ocurrió un error inesperado. Intenta nuevamente.';

    // Si el token expiró o es inválido, limpiamos sesión
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      original: error,
    });
  },
);
