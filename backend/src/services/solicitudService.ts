import { SolicitudRepository } from "../repositories/SolicitudRepository.js";
import { EquipoRepository } from "../repositories/EquipoRepository.js";
import { HistorialSolicitudRepository } from "../repositories/HistorialSolicitudRepository.js";
import { AppError } from "../errors/AppError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import type { Solicitud } from "../models/Solicitud.js";
import type { RolUsuario } from "../models/Usuario.js";
import type { FindAndCountAllPaginatedParams } from "../repositories/SolicitudRepository.js";
import { HistorialSolicitud } from "../models/HistorialSolicitudes.js";

interface CrearSolicitudInput {
  equipoId: number;
  fechaRetiro: string;
  fechaDevolucion: string;
  motivo: string;
}

interface EditarSolicitudInput {
  fechaRetiro?: string;
  fechaDevolucion?: string;
  motivo?: string;
}

class SolicitudService {
  private solicitudRepo: SolicitudRepository;
  private equipoRepo: EquipoRepository;
  private historialRepo: HistorialSolicitudRepository;

  constructor() {
    this.solicitudRepo = new SolicitudRepository();
    this.equipoRepo = new EquipoRepository();
    this.historialRepo = new HistorialSolicitudRepository();
  }

  async crear(datos: CrearSolicitudInput, usuarioId: number): Promise<Solicitud> {
    const { equipoId, fechaRetiro, fechaDevolucion, motivo } = datos;

    if (new Date(fechaRetiro) >= new Date(fechaDevolucion)) {
      throw new ValidationError(
        "Fechas inválidas. La fecha de retiro debe ser estrictamente anterior a la fecha de devolución."
      );
    }

    const equipo = await this.equipoRepo.findById(equipoId);
    if (!equipo) {
      throw new ValidationError(
        "Equipo inexistente. El ID provisto no corresponde a ninguno."
      );
    }

    if (equipo.estado !== "disponible") {
      throw new ValidationError(
        `Equipo no disponible. El equipo se encuentra actualmente en estado: ${equipo.estado}.`
      );
    }

    const conflicto = await this.solicitudRepo.findAprobadasEnRango(
      equipoId,
      fechaRetiro,
      fechaDevolucion,
    );
    if (conflicto) {
      throw new ValidationError(
        "Superposición de fechas. Ya existe una solicitud aprobada para ese equipo en el período seleccionado."
      );
    }

    const nuevaSolicitud = await this.solicitudRepo.create({
      fechaRetiro,
      fechaDevolucion,
      motivo,
      estado: "pendiente",
      equipoId,
      usuarioId,
      autorizadoPor: null,
    });

    // NOTA: no cambiamos el estado del equipo aquí. Solo las solicitudes
    // "aprobada" deben bloquear la disponibilidad física/cronológica.
    // El cambio a `prestado` ocurre en el flujo de aprobación.

    await this.historialRepo.create({
      solicitudId: nuevaSolicitud.id,
      usuarioId,
      accion: "creacion",
      fechaHora: new Date(),
      valorAnterior: null,
      valorNuevo: "pendiente",
    });

    return nuevaSolicitud;
  }

  async editar(id: number, datosNuevos: EditarSolicitudInput, usuarioId:number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new NotFoundError("Solicitud no encontrada.");
    }

    if (solicitud.estado !== "pendiente") {
      throw new ValidationError(
        "Falta de permisos. No se puede editar una solicitud que ya no esté pendiente."
      );
    }

    const { fechaRetiro, fechaDevolucion, motivo } = datosNuevos;
    const nuevaFechaRetiro = fechaRetiro ?? solicitud.fechaRetiro;
    const nuevaFechaDevolucion = fechaDevolucion ?? solicitud.fechaDevolucion;

    if (new Date(nuevaFechaRetiro) >= new Date(nuevaFechaDevolucion)) {
      throw new ValidationError(
        "Fechas inválidas. La fecha de retiro debe ser anterior a la de devolución."
      );
    }

    const conflicto = await this.solicitudRepo.findAprobadasEnRango(
      solicitud.equipoId,
      nuevaFechaRetiro,
      nuevaFechaDevolucion,
      solicitud.id,
    );
    if (conflicto) {
      throw new ValidationError(
        "Superposición de fechas. El nuevo rango colisiona con una reserva aprobada."
      );
    }

    const valoresAnteriores = JSON.stringify({
      fechaRetiro: solicitud.fechaRetiro,
      fechaDevolucion: solicitud.fechaDevolucion,
      motivo: solicitud.motivo,
    });

    await this.solicitudRepo.updateInstance(solicitud, {
      fechaRetiro,
      fechaDevolucion,
      motivo,
    });

    const valoresNuevosString = JSON.stringify({
      fechaRetiro: solicitud.fechaRetiro,
      fechaDevolucion: solicitud.fechaDevolucion,
      motivo: solicitud.motivo,
    });

    await this.historialRepo.create({
      solicitudId: solicitud.id,
      usuarioId,
      accion: "edicion",
      fechaHora: new Date(),
      valorAnterior: valoresAnteriores,
      valorNuevo: valoresNuevosString,
    });

    return solicitud;
  }

  async aprobar(id: number, operadorId: number, operadorRol: RolUsuario): Promise<Solicitud> {
    const solicitud = await this.solicitudRepo.findDetailById(id);
    if (!solicitud) {
      throw new NotFoundError("Solicitud no encontrada.");
    }

    if (solicitud.estado !== "pendiente") {
      throw new ValidationError(
        `Transición inválida. No se puede aprobar en estado: ${solicitud.estado}`
      );
    }

    if (
      solicitud.equipo!.requiereAutorizacion &&
      !["admin", "encargado"].includes(operadorRol)
    ) {
      throw new ForbiddenError(
        "Falta de permisos. Este equipo requiere la autorización de un administrador o encargado."
      );
    }

    const conflicto = await this.solicitudRepo.findAprobadasEnRango(
      solicitud.equipoId,
      solicitud.fechaRetiro,
      solicitud.fechaDevolucion,
    );
    if (conflicto) {
      throw new ValidationError(
        "Equipo no disponible. Se aprobó otra reserva para las mismas fechas primero."
      );
    }

    const estadoAnterior = solicitud.estado;
    await this.solicitudRepo.updateInstance(solicitud, {
      estado: "aprobada",
      autorizadoPor: operadorId,
    });

    const equipo = await this.equipoRepo.findById(solicitud.equipoId);
    if (!equipo){
      throw new AppError("Inconsistencia de datos: el equipo asociado a la solicitud no existe.", 500, false);
    }

    await this.equipoRepo.updateInstance(equipo, { estado: "prestado" });

    await this.historialRepo.create({
      solicitudId: solicitud.id,
      usuarioId: operadorId,
      accion: "aprobacion",
      fechaHora: new Date(),
      valorAnterior: estadoAnterior,
      valorNuevo: "aprobada",
    });

    return solicitud;
  }

  async obtenerTodas(query: FindAndCountAllPaginatedParams): Promise<{ count: number; rows: Solicitud[]}> {
    return this.solicitudRepo.findAndCountAllPaginated(query);
  }

  async obtenerPorId(id: number): Promise<Solicitud | null> {
    return this.solicitudRepo.findDetailById(id);
  }

  async cancelar(id: number, operadorId: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new NotFoundError("Solicitud no encontrada.");
    }

    if (["rechazada", "cancelada", "devuelta"].includes(solicitud.estado)) {
      throw new ValidationError("Flujo inválido. No se puede cancelar.");
    }

    const estadoAnterior = solicitud.estado;
    await this.solicitudRepo.updateInstance(solicitud, { estado: "cancelada" });
    if (estadoAnterior === "aprobada" || estadoAnterior === "pendiente") {
      const equipo = await this.equipoRepo.findById(solicitud.equipoId);
      if (!equipo) {
        throw new AppError("Inconsistencia de datos: el equipo asociado a la solicitud no existe.", 500, false)
      }
      await this.equipoRepo.updateInstance(equipo, { estado: "disponible" });
    }
    await this.historialRepo.create({
      solicitudId: solicitud.id,
      usuarioId: operadorId,
      accion: "cancelacion",
      fechaHora: new Date(),
      valorAnterior: estadoAnterior,
      valorNuevo: "cancelada",
    });
    return solicitud;
  }

  async devolver(id: number, operadorId: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new NotFoundError("Solicitud no encontrada.");
    }
    if (solicitud.estado !== "aprobada") {
      throw new ValidationError("No permitir devolver solicitudes no aprobadas.");
    }

    const estadoAnterior = solicitud.estado;
    await this.solicitudRepo.updateInstance(solicitud, { estado: "devuelta" });
    const equipo = await this.equipoRepo.findById(solicitud.equipoId);
    if (!equipo) {
      throw new AppError("Inconsistencia de datos: el equipo asociado a la solicitud no existe.", 500, false)
    }

    await this.equipoRepo.updateInstance(equipo, { estado: "disponible" });
    await this.historialRepo.create({
      solicitudId: solicitud.id,
      usuarioId: operadorId,
      accion: "devolucion",
      fechaHora: new Date(),
      valorAnterior: estadoAnterior,
      valorNuevo: "devuelta",
    });
    return solicitud;
  }

  async rechazar(id: number, operadorId: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new NotFoundError("Solicitud no encontrada.");
    }
    if (solicitud.estado !== "pendiente") {
      throw new ValidationError(
        "Solo se pueden rechazar solicitudes pendientes."
      );
    }
    const estadoAnterior = solicitud.estado;
    await this.solicitudRepo.updateInstance(solicitud, {
      estado: "rechazada",
      autorizadoPor: operadorId,
    });
    const equipo = await this.equipoRepo.findById(solicitud.equipoId);
    if (equipo && equipo.estado === "prestado") {
      await this.equipoRepo.updateInstance(equipo, { estado: "disponible" });
    }
    await this.historialRepo.create({
      solicitudId: solicitud.id,
      usuarioId: operadorId,
      accion: "rechazo",
      fechaHora: new Date(),
      valorAnterior: estadoAnterior,
      valorNuevo: "rechazada",
    });
    return solicitud;
  }

  async obtenerResumenDashboard() {
    const pendientes = await this.solicitudRepo.countPendientes();
    const aprobadas = await this.solicitudRepo.countAprobadas();
    const vencidas = await this.solicitudRepo.findVencidas();
    const equiposDisponibles = await this.equipoRepo.countDisponibles();
    const equiposPorCategoria = await this.equipoRepo.countPorCategoria();
    const solicitudesRecientes = await this.solicitudRepo.findRecientes();

    return {
      pendientes,
      aprobadas,
      vencidas: vencidas.length,
      equiposDisponibles,
      equiposPorCategoria,
      solicitudesRecientes,
      listadoVencidas: vencidas,
    };
  }

  async obtenerHistorial(solicitudId: number): Promise<HistorialSolicitud[]> {
    const solicitud = await this.solicitudRepo.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError("Solicitud no encontrada.");
    }

    return this.historialRepo.findAll({
      where: { solicitudId },
      order: [["fechaHora", "ASC"]],
      include: [{association: "operador"}],
    });
  }
}

export const solicitudService = new SolicitudService();
