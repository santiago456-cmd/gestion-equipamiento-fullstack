import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express'
import type { AuthUser } from '../types/express/index.js';
import { env } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../config/cookieConfig.js';
import { isTokenBlacklisted } from '../config/redisClient.js';

const JWT_SECRET = env.jwtSecret;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no esta definido en las variables de entorno")
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // cookie httonly
  const tokenFromCookie = req.cookies?.[AUTH_COOKIE_NAME]
  // 1. Capturar la cabecera de Autorización
  const authHeader = req.headers['authorization'];
  // El header viaja con el formato: "Bearer <token>"
  const tokenFromHeader = authHeader?.split(' ')[1];

  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    res.status(401).json({
      ok: false,
      error: 'Acceso denegado. No se proveyó un token de autenticación.'
    });
    return
  }

  try {
    // 2. Verificar autenticidad y vigencia del token
    const decoded = jwt.verify(token, env.jwtSecret) as AuthUser;
    
    if (decoded.jti) {
      const blacklisted = await isTokenBlacklisted(decoded.jti)
      if (blacklisted) {
        res.status(401).json({
          ok: false, 
          error: 'La sesion fue cerrada. Inicia sesion nuevamente.'
        })
        return
      }
    }
    
    // 3. Inyectar datos decodificados en el objeto Request de Express
    req.user = decoded; 
    
    next(); // Luz verde para pasar al controlador o siguiente filtro
  } catch (error) {
    res.status(401).json({
      ok: false,
      error: 'Token inválido o expirado.'
    });
  }
};