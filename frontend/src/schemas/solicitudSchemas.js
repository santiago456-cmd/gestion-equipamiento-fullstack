// src/schemas/solicitudSchemas.js
import { z } from 'zod';

// Esquema para la creación de una nueva solicitud (NuevaSolicitudPage)
export const nuevaSolicitudSchema = z
  .object({
    equipoId: z
      .string({ required_error: 'Selecciona un equipo' })
      .min(1, 'Selecciona un equipo'),
    fechaRetiro: z
      .string({ required_error: 'La fecha de retiro es requerida' })
      .min(1, 'La fecha de retiro es requerida'),
    fechaDevolucion: z
      .string({ required_error: 'La fecha de devolución es requerida' })
      .min(1, 'La fecha de devolución es requerida'),
    motivo: z
      .string({ required_error: 'El motivo es requerido' })
      .trim()
      .min(10, 'Mínimo 10 caracteres requeridos')
      .max(500, 'Máximo 500 caracteres'),
  })
  .refine((data) => data.fechaDevolucion > data.fechaRetiro, {
    message: 'La fecha de devolución debe ser posterior al retiro',
    path: ['fechaDevolucion'],
  });

// Esquema para edición de una solicitud existente (EditarSolicitudPage)
export const editarSolicitudSchema = z
  .object({
    fechaRetiro: z
      .string({ required_error: 'La fecha de retiro es requerida' })
      .min(1, 'La fecha de retiro es requerida'),
    fechaDevolucion: z
      .string({ required_error: 'La fecha de devolución es requerida' })
      .min(1, 'La fecha de devolución es requerida'),
    motivo: z
      .string({ required_error: 'El motivo es requerido' })
      .trim()
      .min(1, 'El motivo es requerido'),
  })
  .refine((data) => data.fechaDevolucion > data.fechaRetiro, {
    message: 'La fecha de devolución debe ser posterior al retiro',
    path: ['fechaDevolucion'],
  });

// Esquema para el motivo de rechazo (modal en SolicitudDetailPage)
export const rechazoSchema = z.object({
  rejectMotivo: z
    .string({ required_error: 'El motivo del rechazo es requerido' })
    .trim()
    .min(1, 'El motivo del rechazo es requerido'),
});
