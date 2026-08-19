import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import type { RolUsuario } from '../models/Usuario.js';
import { ValidationError } from '../errors/ValidationError.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { enqueueWelcomeEmail, enqueueConfirmationEmail, enqueuePasswordResetEmail } from '../queues/notificationsQueue.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

// 1. CREAMOS LA INSTANCIA (Soluciona el error "usuarioRepository is not defined")
const usuarioRepository = new UsuarioRepository();

// 2. LE ASIGNAMOS UN VALOR POR DEFECTO PARA LOS TESTS (Evita errores de firma de token)
const JWT_SECRET = env.jwtSecret; 
const CONFIRMATION_TOKEN_EXPIRY= '24h';
const RESET_TOKEN_EXPIRY= '30m';

interface RegistrarInput{
  nombre: string;
  email: string;
  password: string;
  rol?: RolUsuario;
}

interface JwtPayloadData{
  id: number;
  nombre: string;
  rol: RolUsuario;
}

interface EmailTokenPayload {
  id: number;
  type: 'email-confirmation' | 'password-reset'
}

class AuthService {
  async registrar(datosRegistro: RegistrarInput) {
    // 1. Validar unicidad del correo electrónico
    const existeUsuario = await usuarioRepository.findByEmail(datosRegistro.email);
    if (existeUsuario) {
      throw new ValidationError('El correo electrónico ya se encuentra registrado.');
    }

    // 2. Aplicar función Hash a la contraseña plana
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(datosRegistro.password, salt);

    // 3. Persistir entidad con el passwordHash mapeado
    const nuevoUsuario = await usuarioRepository.create({
      nombre: datosRegistro.nombre,
      email: datosRegistro.email,
      passwordHash: hash,
      rol: datosRegistro.rol || 'usuario', // 'usuario' por defecto si viene vacío
      activo: true,
      emailVerificado: false
    });

    const confirmationToken = jwt.sign(
      { id: nuevoUsuario.id, type: 'email-confirmation' } satisfies EmailTokenPayload,
      env.jwtEmailSecret,
      { expiresIn: CONFIRMATION_TOKEN_EXPIRY},
    )

    try {
      await enqueueConfirmationEmail({
        to: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        token: confirmationToken,
      })
    } catch (error) {
      logger.error({ err: error}, 'No se pudo encolar el mail de confirmacion de cuenta')
    }

    // 4. Retornar objeto seguro sin exponer el Hash
    const { passwordHash, ...usuarioSeguro } = nuevoUsuario.get({ plain: true });
    return usuarioSeguro;
  }

  async login(email: string, password: string) {
    // 1. Buscar usuario activo por email
    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas.'); // Mensaje genérico por seguridad
    }

    // 2. Validar firma Hash de la contraseña ingresada
    const esClaveValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!esClaveValida) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    if (!usuario.emailVerificado) {
      throw new ForbiddenError('Debes confirmar tu cuenta antes de iniciar seccion. Revisa tu correo electronico.')
    }

    // 3. Generar Payload del JWT (Guardamos datos no sensibles para el contexto)
    const payload: JwtPayloadData = {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol
    };

    // 4. Firmar Token digital con expiración (ej: 2 horas)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    // 5. Retornar datos de sesión limpios
    const { passwordHash, ...usuarioSeguro } = usuario.get({ plain: true });
    return {
      usuario: usuarioSeguro,
      token
    };
  }

  async confirmarCuenta(token: string): Promise<{mensaje: string}> {
    let payload: EmailTokenPayload
    try {
      payload = jwt.verify(token, env.jwtEmailSecret) as EmailTokenPayload
    } catch (error) {
      throw new ValidationError('El enlace de confirmacion es invalido o expiro.')
    }

    if (payload.type !== 'email-confirmation') {
      throw new ValidationError('El enlace de confirmacion es invalido.')
    }

    const usuario = await usuarioRepository.findById(payload.id);
    if (!usuario){
      throw new NotFoundError('El usuario asociado a este enlace ya no existe.')
    }

    if (!usuario.emailVerificado){
      await usuarioRepository.updateInstance(usuario, {emailVerificado: true})

      try {
        await enqueueWelcomeEmail({
          to: usuario.email,
          nombre: usuario.nombre
        })
      } catch (error) {
        logger.error({err: error}, 'No se pudo encolar el mail de bienvenida')
      }
    }

    return { mensaje: 'Cuenta confirmada exitosamente. Ya podes iniciar sesion.'}
  }

  async solicitarRecuperacion(email: string): Promise<void>{
    const usuario = await usuarioRepository.findByEmail(email)
    if (!usuario){
      return // no filtramos si el mail existe o no. el controller responde siempre el mismo mensaje
    }

    const resetToken = jwt.sign(
      { id: usuario.id, type: 'password-reset' } satisfies EmailTokenPayload,
      env.jwtEmailSecret,
      { expiresIn: RESET_TOKEN_EXPIRY}
    )

    try {
      await enqueuePasswordResetEmail({
        to: usuario.email,
        nombre: usuario.nombre,
        token: resetToken,
      })
    } catch (error) {
      logger.error({err: error}, 'No se pudo encolar el mail de recuperacion de contraseña')
    }
  }

  async restablecerContrasena(token: string, nuevaContrasena: string): Promise<void>{
    let payload: EmailTokenPayload;
    try {
      payload = jwt.verify(token, env.jwtEmailSecret) as EmailTokenPayload
    } catch (error) {
      throw new ValidationError('El enlace de recuperacion es invalido o expiro.')
    }

    if (payload.type !== 'password-reset'){
      throw new ValidationError('El enlace de recuperacion es invalido.')
    }

    const usuario = await usuarioRepository.findById(payload.id)
    if (!usuario){
      throw new ValidationError('El enlace de recuperacion es invalido o expiro.')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(nuevaContrasena, salt)
    await usuarioRepository.updateInstance(usuario, {passwordHash: hash})
  }
}

export const authService = new AuthService();