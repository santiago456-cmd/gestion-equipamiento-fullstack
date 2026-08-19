import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().toLowerCase().email('Debe ser un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  rol: z.enum(['usuario', 'encargado', 'admin']).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const confirmarCuentaParamsSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
});
export type ConfirmarCuentaParams = z.infer<typeof confirmarCuentaParamsSchema>;

export const recuperarContrasenaSchema = z.object({
  email: z.string().trim().toLowerCase().email('Debe ser un correo electrónico válido'),
});
export type RecuperarContrasenaInput = z.infer<typeof recuperarContrasenaSchema>;

export const restablecerContrasenaSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  nuevaContrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
});
export type RestablecerContrasenaInput = z.infer<typeof restablecerContrasenaSchema>;