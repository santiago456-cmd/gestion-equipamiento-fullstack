import { Request, Response, NextFunction } from 'express';
import { equipoService } from '../services/equipoService.js';
import type { ListarEquiposQuery } from '../schemas/equipoSchemas.js';

class EquipoController {
  async listarEquipos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validated!.query as ListarEquiposQuery;
      const equipos = await equipoService.obtenerDisponibles(query);
      res.status(200).json({
        ok: true,
        data: equipos,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const equipoController = new EquipoController();