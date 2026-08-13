import { Request, Response, NextFunction } from "express";
import { solicitudService } from "../services/solicitudService.js";

class SolicitudController {

  // GET /api/solicitudes
  async listarPaginado(req: Request, res:Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await solicitudService.obtenerTodas(req.query);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5

      res.status(200).json({
        ok: true,
        data: resultado.rows,
        totalItems: resultado.count,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/solicitudes/:id
  async obtenerDetalle(req: Request<{id: string}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const solicitud = await solicitudService.obtenerPorId(Number(id));
      if (!solicitud) {
        res.status(404).json({ ok: false, message: "Solicitud no encontrada" });
        return
      }

      res.status(200).json({ ok: true, data: solicitud });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/solicitudes
  async crearSolicitud(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user!.id;

      const nuevaSolicitud = await solicitudService.crear(req.body, usuarioId);

      res.status(201).json({
        ok: true,
        message: "Solicitud de préstamo creada exitosamente.",
        data: nuevaSolicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/solicitudes/:id
  async editarSolicitud(req: Request<{id: string}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      const solicitudEditada = await solicitudService.editar(
        (Number(id)),
        req.body,
        usuarioId,
      );

      res.status(200).json({
        ok: true,
        message: "Solicitud actualizada de manera correcta.",
        data: solicitudEditada,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/solicitudes/:id/aprobar
  async aprobarSolicitud(req: Request<{id: string}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const operadorId = req.user!.id;
      const operadorRol = req.user!.rol;

      const solicitudAprobada = await solicitudService.aprobar(
        (Number(id)),
        operadorId,
        operadorRol,
      );

      res.status(200).json({
        ok: true,
        message:
          "La solicitud fue aprobada. El equipo asignado pasó a estado PRESTADO.",
        data: solicitudAprobada,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/solicitudes/:id/rechazar
  async rechazarSolicitud(req: Request<{id: string}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const operadorId = req.user!.id;

      const solicitudRechazada = await solicitudService.rechazar(
        (Number(id)),
        operadorId,
      );

      res.status(200).json({
        ok: true,
        message: "La solicitud fue rechazada formalmente.",
        data: solicitudRechazada,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/solicitudes/:id/cancelar

  async cancelarSolicitud(req: Request<{id: string}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const operadorId = req.user!.id;

      const solicitudCancelada = await solicitudService.cancelar(
        (Number(id)),
        operadorId,
      );

      res.status(200).json({
        ok: true,
        message: "Solicitud cancelada correctamente por el usuario.",
        data: solicitudCancelada,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/solicitudes/:id/devolver
  async procesarDevolucion(req: Request<{id: string}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const operadorId = req.user!.id;

      const solicitudDevuelta = await solicitudService.devolver(
        (Number(id)),
         operadorId
        );
      if (!solicitudDevuelta) {
        res.status(404).json({ ok: false, message: "Solicitud no encontrada" });
        return
      }

      res.status(200).json({
        ok: true,
        message:
          "Devolución asentada de forma exitosa. El equipo vuelve a estar DISPONIBLE.",
        data: solicitudDevuelta,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/solicitudes/resumen
  async obtenerResumenDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resumen = await solicitudService.obtenerResumenDashboard();

      res.status(200).json({
        ok: true,
        data: resumen,
      });
    } catch (error) {
      next(error);
    }
  }
  // GET /api/solicitudes/:id/historial
  async obtenerHistorial(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const historial = await solicitudService.obtenerHistorial(Number(id));

      res.status(200).json({
        ok: true,
        data: historial,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const solicitudController = new SolicitudController();
