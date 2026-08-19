import { z } from 'zod';

export const actualizarPerfilSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
});
export type ActualizarPerfilInput = z.infer<typeof actualizarPerfilSchema>;

export const solicitarCambioEmailSchema = z.object({
  nuevoEmail: z.string().trim().toLowerCase().email('Debe ser un correo electrónico válido'),
});
export type SolicitarCambioEmailInput = z.infer<typeof solicitarCambioEmailSchema>;

export const confirmarCambioEmailParamsSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
});
export type ConfirmarCambioEmailParams = z.infer<typeof confirmarCambioEmailParamsSchema>;

export const cambiarContrasenaSchema = z
  .object({
    passwordActual: z.string().min(1, 'La contraseña actual es requerida'),
    passwordNueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').max(72),
  })
  .refine((data) => data.passwordActual !== data.passwordNueva, {
    message: 'La nueva contraseña debe ser distinta a la actual',
    path: ['passwordNueva'],
  });
export type CambiarContrasenaInput = z.infer<typeof cambiarContrasenaSchema>;