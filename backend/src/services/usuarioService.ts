import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { enqueueEmailChangeConfirmation } from "../queues/notificationsQueue.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import type { Attributes } from "sequelize";
import type { Usuario } from "../models/Usuario.js";

const usuarioRepository = new UsuarioRepository()

const EMAIL_CHANGE_TOKEN_EXPIRY = '2h'

type UsuarioSeguro = Omit<Attributes<Usuario>, "passwordHash">

interface EmailChangeTokenPayload {
  id: number;
  type: 'email-change';
  nuevoEmail: string
}

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

  // edicion de perfil (requiere sesion activa)
  async actualizarNombre(id: number, nombre: string): Promise<UsuarioSeguro>{
    const usuario = await usuarioRepository.findById(id)
    if (!usuario){
      throw new NotFoundError('Usuario no encontrado.')
    }

    await usuarioRepository.updateInstance(usuario, {nombre})

    const {passwordHash, ...usuarioSeguro} = usuario.get({plain: true})
    return usuarioSeguro
  }

  async solicitarCambioEmail(id: number, nuevoEmail: string): Promise<void>{
    const usuario = await usuarioRepository.findById(id)
    if (!usuario){
      throw new NotFoundError('Usuario no encontrado')
    }

    if (usuario.email === nuevoEmail){
      throw new ValidationError('El nuevo correo electronico debe ser distinto al actual.')
    }

    const yaExiste = await usuarioRepository.findByEmail(nuevoEmail)
    if (yaExiste){
      throw new ConflictError('Ese correo electronico ya esta en uso por otra cuenta.')
    }

    const token = jwt.sign(
      {id: usuario.id, type: 'email-change', nuevoEmail} satisfies EmailChangeTokenPayload,
      env.jwtEmailSecret,
      {expiresIn: EMAIL_CHANGE_TOKEN_EXPIRY}
    )

    try {
      await enqueueEmailChangeConfirmation({to: nuevoEmail, nombre: usuario.nombre, token})
    } catch (error) {
      logger.error({err: error}, 'No se pudo encolar el mail de confirmacion de cambio de email.')
    }
  }

  async confirmarCambioEmail(token: string): Promise<{mensaje: string}>{
    let payload: EmailChangeTokenPayload
    try {
      payload = jwt.verify(token, env.jwtEmailSecret) as EmailChangeTokenPayload;
    } catch (error) {
      throw new ValidationError('El enlace de confirmacion es invalido o expiro.')
    }

    if (payload.type !== 'email-change'){
      throw new ValidationError('El enlace de confirmacion es invalido')
    }

    const usuario = await usuarioRepository.findById(payload.id)
    if (!usuario){
      throw new NotFoundError('El usuario asociado a este enlace ya no existe.')
    }

    // recheckeamos unicidad, caso: pudo haberse ocupado ese email en las ultimas 2hs.
    const yaExiste = await usuarioRepository.findByEmail(payload.nuevoEmail)
    if (yaExiste && yaExiste.id !== usuario.id){
      throw new ConflictError('Ese correo electronico ya fue tomado por otra cuenta')
    }

    await usuarioRepository.updateInstance(usuario, {email: payload.nuevoEmail})

    return {mensaje: 'Correo electronico actualizado exitosamente.'}
  }

  async cambiarcontrasena(id: number, passwordActual: string, passwordNueva: string): Promise<void>{
    const usuario = await usuarioRepository.findById(id)
    if (!usuario){
      throw new NotFoundError('Usuario no encontrado.')
    }

    const esValida = await bcrypt.compare(passwordActual, usuario.passwordHash)
    if (!esValida){
      throw new UnauthorizedError('La contraseña actual es incorrecta.')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(passwordNueva, salt)
    await usuarioRepository.updateInstance(usuario, {passwordHash: hash})
  }
}

export const usuarioService = new UsuarioService();