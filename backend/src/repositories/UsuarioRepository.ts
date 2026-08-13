import { BaseRepository } from './BaseRepository.js';
import { Usuario } from '../models/Usuario.js';

export class UsuarioRepository extends BaseRepository<Usuario> {
  constructor() {
    super(Usuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.model.findOne({
      where: { email, activo: true }
    });
  }
}

