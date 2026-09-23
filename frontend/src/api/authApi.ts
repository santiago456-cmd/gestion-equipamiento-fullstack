// src/api/authApi.ts
import { api } from './axiosClient';
import { UsuarioAutenticado } from '../types/auth';

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean
  message: string
  usuario: UsuarioAutenticado
}

export interface RegisterResponse {
  ok: boolean
  message: string
  data: UsuarioAutenticado
}

export interface LogoutResponse {
  ok: boolean
  message: string
}

export interface MeResponse {
  ok: boolean;
  usuario: UsuarioAutenticado;
}

export interface MensajeResponse {
  ok: boolean;
  mensaje?: string;
  message?: string;
}

export const authApi = {
  // POST /api/auth/register — ya no loguea: el usuario queda inactivo hasta confirmar el email
  register: (data: RegisterPayload): Promise<RegisterResponse> =>
    api.post<RegisterResponse>('/auth/register', data).then((res) => res.data),

  // POST /api/auth/login — el JWT viaja en una cookie httpOnly, no en el body
  login: (data: LoginPayload): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  // POST /api/auth/logout — invalida el JWT en el backend (blacklist) y limpia la cookie
  logout: (): Promise<LogoutResponse> =>
    api.post<LogoutResponse>('/auth/logout').then((res) => res.data),

  // GET /api/auth/me — verifica la cookie httpOnly y devuelve el usuario actual
  me: (): Promise<MeResponse> =>
    api.get<MeResponse>('/auth/me').then((res) => res.data),

  // GET /api/auth/confirmar/:token
  confirmarCuenta: (token: string): Promise<MensajeResponse> =>
    api.get<MensajeResponse>(`/auth/confirmar/${token}`).then((res) => res.data),

  // POST /api/auth/recuperar-contrasena
  solicitarRecuperacion: (email: string): Promise<MensajeResponse> =>
    api.post<MensajeResponse>('/auth/recuperar-contrasena', { email }).then((res) => res.data),

  // POST /api/auth/restablecer-contrasena
  restablecerContrasena: (token: string, nuevaContrasena: string): Promise<MensajeResponse> =>
    api
      .post<MensajeResponse>('/auth/restablecer-contrasena', { token, nuevaContrasena })
      .then((res) => res.data),

};