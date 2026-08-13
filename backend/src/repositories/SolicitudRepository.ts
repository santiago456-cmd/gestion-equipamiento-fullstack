import { Op, WhereOptions, Attributes, Order } from "sequelize";
import { Solicitud, type Estado } from "../models/Solicitud.js";
import { Equipo } from "../models/Equipo.js";
import { Usuario } from "../models/Usuario.js";
import { BaseRepository } from "./BaseRepository.js";

export interface FindAndCountAllPaginatedParams{
  estado?: Estado;
  equipoId?: number;
  categoria?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
}

export class SolicitudRepository extends BaseRepository<Solicitud> {
  constructor() {
    super(Solicitud);
  }
  // Para GET /api/solicitudes con filtros combinables, paginación y ordenamiento del lado del servidor
  async findAndCountAllPaginated({
    estado,
    equipoId,
    categoria,
    desde,
    hasta,
    page = 1,
    limit = 5,
    sortBy = "id",
    order = "DESC",
  }: FindAndCountAllPaginatedParams): Promise<{ count: number; rows: Solicitud[]}> {
    const offset = (page - 1) * limit;
    const whereClause: WhereOptions<Attributes<Solicitud>> = {};
    const equipoWhereClause: WhereOptions<Attributes<Equipo>> = {};

    // Filtros directos de la solicitud
    if (estado) whereClause.estado = estado;
    if (equipoId) whereClause.equipoId = equipoId;

    // Filtro por rango de fechas de retiro (desde / hasta)
    if (desde && hasta) {
      whereClause.fechaRetiro = { [Op.between]: [desde, hasta] };
    } else if (desde) {
      whereClause.fechaRetiro = { [Op.gte]: desde };
    } else if (hasta) {
      whereClause.fechaRetiro = { [Op.lte]: hasta };
    }

    // Filtro relacional cruzado por categoría del Equipo vinculado
    if (categoria) {
      equipoWhereClause.categoria = categoria;
    }

    // Usamos findAndCountAll para resolver la paginación mandando los metadatos al frontend
    return this.model.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, order]] as Order,
      include: [
        {
          model: Equipo,
          as: "equipo",
          where: equipoWhereClause,
          attributes: ["codigoInventario", "nombre", "categoria", "estado"], // Trae solo lo necesario
        },
        {
          model: Usuario,
          as: "solicitante",
          attributes: ["id", "nombre", "email"],
        },
      ],
    });
  }

  // Para GET /api/solicitudes/:id (Detalle expandido con datos de auditoría)
  async findDetailById(id: number): Promise<Solicitud | null> {
    return this.model.findByPk(id, {
      include: [
        { model: Equipo, as: "equipo" },
        {
          model: Usuario,
          as: "solicitante",
          attributes: ["id", "nombre", "email"],
        },
        {
          model: Usuario,
          as: "autorizador",
          attributes: ["id", "nombre", "email", "rol"],
        },
      ],
    });
  }

  // Regla Central del Dominio: Verifica si el equipo tiene un préstamo aprobado superpuesto en esas fechas
  async findAprobadasEnRango(
    equipoId: number,
    fechaRetiro: string,
    fechaDevolucion: string,
    solicitudIdIgnorar: number | null = null,
  ): Promise<Solicitud | null> {
    const whereClause: WhereOptions<Attributes<Solicitud>> = {
      equipoId,
      estado: "aprobada", // El enunciado dice: "Solo las solicitudes aprobadas bloquean disponibilidad"
      [Op.and]: [
        { fechaRetiro: { [Op.lte]: fechaDevolucion } },
        { fechaDevolucion: { [Op.gte]: fechaRetiro } },
      ],
      // si estamos editando (metodo PUT) ignoramos la propia solicitud para que no colisione con sigo misma
      ...(solicitudIdIgnorar ? {id: {[Op.ne]: solicitudIdIgnorar}} : {})
    };
    return this.model.findOne({where: whereClause})
  }

  // Consultas agregadas específicas para alimentar GET /api/solicitudes/resumen
  async countPendientes(): Promise<number> {
    return this.model.count({ where: { estado: "pendiente" } });
  }

  async countAprobadas(): Promise<number> {
    return this.model.count({ where: { estado: "aprobada" } });
  }

  async findVencidas(): Promise<Solicitud[]> {
    const hoy = new Date().toISOString().split("T")[0]; // Formato AAAA-MM-DD (2026-06-10)
    return this.model.findAll({
      where: {
        estado: "aprobada",
        fechaDevolucion: { [Op.lt]: hoy }, // fechaDevolucion menor a la fecha actual
      },
      include: [{ model: Equipo, as: "equipo" }],
    });
  }

  async findRecientes(limite: number = 5): Promise<Solicitud[]> {
    return this.model.findAll({
      order: [["id", "DESC"]],
      limit: limite,
      include: [
        { model: Equipo, as: "equipo", attributes: ["nombre", "categoria"] },
        { model: Usuario, as: "solicitante", attributes: ["id", "nombre", "email"] },
      ],
    });
  }
}
