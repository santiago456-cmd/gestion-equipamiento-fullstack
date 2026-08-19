import { z } from 'zod';

const ESTADOS = ['pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta'] as const;
const fechaISOSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD');

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un número entero positivo'),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const listarSolicitudesQuerySchema = z.object({
  estado: z.enum(ESTADOS).optional(),
  equipoId: z.coerce.number().int().positive().optional(),
  categoria: z.string().trim().min(1).optional(),
  desde: fechaISOSchema.optional(),
  hasta: fechaISOSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.string().trim().min(1).optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
});
export type ListarSolicitudesQuery = z.infer<typeof listarSolicitudesQuerySchema>;

export const crearSolicitudSchema = z.object({
  equipoId: z.coerce.number().int().positive('equipoId debe ser un número entero positivo'),
  fechaRetiro: fechaISOSchema,
  fechaDevolucion: fechaISOSchema,
  motivo: z.string().trim().min(3, 'El motivo debe tener al menos 3 caracteres').max(255),
});
export type CrearSolicitudInput = z.infer<typeof crearSolicitudSchema>;

export const editarSolicitudSchema = z.object({
  fechaRetiro: fechaISOSchema.optional(),
  fechaDevolucion: fechaISOSchema.optional(),
  motivo: z.string().trim().min(3).max(255).optional(),
});
export type EditarSolicitudInput = z.infer<typeof editarSolicitudSchema>;