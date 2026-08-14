import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import type { RolUsuario } from '../models/Usuario.js';
import { ValidationError } from '../errors/ValidationError.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';

// 1. CREAMOS LA INSTANCIA (Soluciona el error "usuarioRepository is not defined")
const usuarioRepository = new UsuarioRepository();

// 2. LE ASIGNAMOS UN VALOR POR DEFECTO PARA LOS TESTS (Evita errores de firma de token)
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_para_pruebas_123'; 

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
      activo: true
    });

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
}

export const authService = new AuthService();