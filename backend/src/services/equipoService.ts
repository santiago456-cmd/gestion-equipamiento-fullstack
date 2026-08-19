import { EquipoRepository } from "../repositories/EquipoRepository.js";
import type { Equipo } from "../models/Equipo.js";
import type { WhereOptions, Attributes } from "sequelize";
import type { ListarEquiposQuery } from "../schemas/equipoSchemas.js";

interface ObtenerDisponiblesQuery{
  categoria?: string
}

class EquipoService {
  private equipoRepo: EquipoRepository

  constructor() {
    this.equipoRepo = new EquipoRepository();
  }

  async obtenerDisponibles(query: ListarEquiposQuery): Promise<Equipo[]> {
    const { categoria } = query;
    const filtros: WhereOptions<Attributes<Equipo>> = { estado: 'disponible' };
    
    if (categoria) {
      filtros.categoria = categoria;
    }

    return this.equipoRepo.findAll({ where: filtros, order: [['nombre', 'ASC']] });
  }
}

export const equipoService = new EquipoService();