// src/api/usuarioApi.ts
import { api } from './axiosClient';
import type { UsuarioAutenticado } from '../types/auth';

export interface ActualizarPerfilResponse {
  ok: boolean;
  message: string;
  data: UsuarioAutenticado;
}

export interface MensajeResponse {
  ok: boolean;
  mensaje?: string;
  message?: string;
}

export const usuarioApi = {
  // PATCH /api/usuarios/me
  actualizarPerfil: (nombre: string): Promise<ActualizarPerfilResponse> =>
    api.patch<ActualizarPerfilResponse>('/usuarios/me', { nombre }).then((res) => res.data),

  // POST /api/usuarios/me/email
  solicitarCambioEmail: (nuevoEmail: string): Promise<MensajeResponse> =>
    api.post<MensajeResponse>('/usuarios/me/email', { nuevoEmail }).then((res) => res.data),

  // GET /api/usuarios/confirmar-cambio-email/:token (pública)
  confirmarCambioEmail: (token: string): Promise<MensajeResponse> =>
    api.get<MensajeResponse>(`/usuarios/confirmar-cambio-email/${token}`).then((res) => res.data),

  // POST /api/usuarios/me/password — el backend invalida la sesión actual al confirmar
  cambiarContrasena: (passwordActual: string, passwordNueva: string): Promise<MensajeResponse> =>
    api
      .post<MensajeResponse>('/usuarios/me/password', { passwordActual, passwordNueva })
      .then((res) => res.data),
};