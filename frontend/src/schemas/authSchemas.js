// src/schemas/authSchemas.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es requerido' })
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo válido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida'),
});

export const registerSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre es requerido' })
      .trim()
      .min(1, 'El nombre es requerido'),
    email: z
      .string({ required_error: 'El correo es requerido' })
      .min(1, 'El correo es requerido')
      .email('Formato de correo inválido'),
    password: z
      .string({ required_error: 'La contraseña es requerida' })
      .min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z
      .string({ required_error: 'Confirma tu contraseña' })
      .min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
