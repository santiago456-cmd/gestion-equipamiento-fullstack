// src/schemas/usuarioSchemas.ts
import { z } from 'zod';

export const actualizarPerfilSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100),
});

export const solicitarCambioEmailSchema = z.object({
  nuevoEmail: z
    .string({ required_error: 'El correo es requerido' })
    .trim()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo válido'),
});

export const cambiarContrasenaSchema = z
  .object({
    passwordActual: z
      .string({ required_error: 'La contraseña actual es requerida' })
      .min(1, 'La contraseña actual es requerida'),
    passwordNueva: z
      .string({ required_error: 'La nueva contraseña es requerida' })
      .min(8, 'Mínimo 8 caracteres'),
  })
  .refine((data) => data.passwordActual !== data.passwordNueva, {
    message: 'La nueva contraseña debe ser distinta a la actual',
    path: ['passwordNueva'],
  });