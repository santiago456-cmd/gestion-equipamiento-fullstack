import { BaseRepository } from './BaseRepository.js';
import { Equipo } from '../models/Equipo.js';
import { sequelize } from '../config/dataBase.js';

//forma real del resultado de countporcategoria (no es una instancia de equipo)
interface ConteoCategoria{
  categoria: string;
  total: string; //count en postgresql suele venir como string
}

export class EquipoRepository extends BaseRepository<Equipo> {
  constructor() {
    super(Equipo);
  }

  async findByCodigoInventario(codigoInventario: string): Promise<Equipo | null> {
    return this.model.findOne({
      where: { codigoInventario }
    });
  }

  async countDisponibles(): Promise<number> {
    return this.model.count({ where: { estado: 'disponible' } });
  }

  async countPorCategoria(): Promise<ConteoCategoria[]> {
    return this.model.findAll({
      attributes: [
        'categoria',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['categoria'],
      raw: true,
      order: [['categoria', 'ASC']]
    }) as unknown as Promise<ConteoCategoria[]>;
  }
}
