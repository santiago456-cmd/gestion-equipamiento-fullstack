import { z } from 'zod';

export const listarEquiposQuerySchema = z.object({
  categoria: z.string().trim().min(1).optional(),
});
export type ListarEquiposQuery = z.infer<typeof listarEquiposQuerySchema>;