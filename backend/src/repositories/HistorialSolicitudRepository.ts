import {BaseRepository} from "./BaseRepository.js";
import { HistorialSolicitud } from "../models/HistorialSolicitudes.js";
import { Usuario } from "../models/Usuario.js";

export class HistorialSolicitudRepository extends BaseRepository<HistorialSolicitud>{
  constructor() {
    super(HistorialSolicitud);
  }

  // Específico para GET /api/solicitudes/:id/historial
  async findBySolicitudId(solicitudId: number): Promise<HistorialSolicitud[]> {
    return this.model.findAll({
      where: { solicitudId },
      order: [['fechaHora', 'ASC']], 
      include: [
        { 
          model: Usuario, 
          as: 'operador', 
          attributes: ['id', 'nombre', 'rol'] 
        }
      ]
    });
  }
}