import { Request, Response, NextFunction } from "express";
import { solicitudService } from "../services/solicitudService.js";
import type {
  IdParam, ListarSolicitudesQuery, CrearSolicitudInput, EditarSolicitudInput,
} from "../schemas/solicitudSchemas.js";

class SolicitudController {
  async listarPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validated!.query as ListarSolicitudesQuery;
      const resultado = await solicitudService.obtenerTodas(query);

      res.status(200).json({
        ok: true,
        data: resultado.rows,
        totalItems: resultado.count,
        page: query.page ?? 1,
        limit: query.limit ?? 5,
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerDetalle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated!.params as IdParam;
      const solicitud = await solicitudService.obtenerPorId(id);
      if (!solicitud) {
        res.status(404).json({ ok: false, message: "Solicitud no encontrada" });
        return;
      }
      res.status(200).json({ ok: true, data: solicitud });
    } catch (error) {
      next(error);
    }
  }

  async crearSolicitud(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user!.id;
      const body = req.validated!.body as CrearSolicitudInput;
      const nuevaSolicitud = await solicitudService.crear(body, usuarioId);

      res.status(201).json({
        ok: true,
        message: "Solicitud de préstamo creada exitosamente.",
        data: nuevaSolicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  async editarSolicitud(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated!.params as IdParam;
      const body = req.validated!.body as EditarSolicitudInput;
      const usuarioId = req.user!.id;

      const solicitudEditada = await solicitudService.editar(id, body, usuarioId);

      res.status(200).json({
        ok: true,
        message: "Solicitud actualizada de manera correcta.",
        data: solicitudEditada,
      });
    } catch (error) {
      next(error);
    }
  }

  async aprobarSolicitud(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated!.params as IdParam;
      const operadorId = req.user!.id;
      const operadorRol = req.user!.rol;

      const solicitudAprobada = await solicitudService.aprobar(id, operadorId, operadorRol);

      res.status(200).json({
        ok: true,
        message: "La solicitud fue aprobada. El equipo asignado pasó a estado PRESTADO.",
        data: solicitudAprobada,
      });
    } catch (error) {
      next(error);
    }
  }

  async rechazarSolicitud(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated!.params as IdParam;
      const operadorId = req.user!.id;
      const solicitudRechazada = await solicitudService.rechazar(id, operadorId);

      res.status(200).json({
        ok: true,
        message: "La solicitud fue rechazada formalmente.",
        data: solicitudRechazada,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelarSolicitud(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated!.params as IdParam;
      const operadorId = req.user!.id;
      const solicitudCancelada = await solicitudService.cancelar(id, operadorId);

      res.status(200).json({
        ok: true,
        message: "Solicitud cancelada correctamente por el usuario.",
        data: solicitudCancelada,
      });
    } catch (error) {
      next(error);
    }
  }

  async procesarDevolucion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated!.params as IdParam;
      const operadorId = req.user!.id;
      const solicitudDevuelta = await solicitudService.devolver(id, operadorId);

      if (!solicitudDevuelta) {
        res.status(404).json({ ok: false, message: "Solicitud no encontrada" });
        return;
      }

      res.status(200).json({
        ok: true,
        message: "Devolución asentada de forma exitosa. El equipo vuelve a estar DISPONIBLE.",
        data: solicitudDevuelta,
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerResumenDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resumen = await solicitudService.obtenerResumenDashboard();
      res.status(200).json({ ok: true, data: resumen });
    } catch (error) {
      next(error);
    }
  }

  async obtenerHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validated!.params as IdParam;
      const historial = await solicitudService.obtenerHistorial(id);
      res.status(200).json({ ok: true, data: historial });
    } catch (error) {
      next(error);
    }
  }
}

export const solicitudController = new SolicitudController();
