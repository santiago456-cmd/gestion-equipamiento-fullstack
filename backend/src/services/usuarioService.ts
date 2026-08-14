import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { Attributes } from "sequelize";
import type { Usuario } from "../models/Usuario.js";

const usuarioRepository = new UsuarioRepository()

type UsuarioSeguro = Omit<Attributes<Usuario>, "passwordHash">

class UsuarioService {

  async obtenerPorId(id: number): Promise<UsuarioSeguro> {
    const usuario = await usuarioRepository.findById(id);
    
    if (!usuario) {
      throw new NotFoundError('El usuario solicitado no existe en el sistema.');
    }

    
    const { passwordHash, ...usuarioSeguro } = usuario.get({ plain: true });
    return usuarioSeguro;
  }

  async obtenerTodos(): Promise<UsuarioSeguro[]> {
    const usuarios = await usuarioRepository.findAll({
      order: [['nombre', 'ASC']] 
    });

    return usuarios.map((u) => {
      const { passwordHash, ...usuarioSeguro } = u.get({ plain: true });
      return usuarioSeguro;
    });
  }

  async cambiarEstadoActivo(id: number, nuevoEstado: boolean): Promise<UsuarioSeguro> {
    const usuario = await usuarioRepository.findById(id);
    
    if (!usuario) {
      throw new NotFoundError('No se encontró el usuario para modificar su estado.');
    }
    
    await usuarioRepository.updateInstance(usuario, { activo: nuevoEstado });

    const { passwordHash, ...usuarioSeguro } = usuario.get({ plain: true });
    return usuarioSeguro;
  }
}

export const usuarioService = new UsuarioService();