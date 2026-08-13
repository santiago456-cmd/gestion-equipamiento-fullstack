import { Request, Response, NextFunction } from 'express';
import { equipoService } from '../services/equipoService.js';

class EquipoController {
  
  // GET /api/equipos
  async listarEquipos(req:Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const equipos = await equipoService.obtenerDisponibles(req.query);
      res.status(200).json({
        ok: true,
        data: equipos
      });
    } catch (error) {
      next(error);
    }
  }
}

export const equipoController = new EquipoController();