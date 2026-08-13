import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express'
import type { AuthUser } from '../types/express/index.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no esta definido en las variables de entorno")
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Capturar la cabecera de Autorización
  const authHeader = req.headers['authorization'];
  
  // El header viaja con el formato: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      ok: false,
      error: 'Acceso denegado. No se proveyó un token de autenticación.'
    });
    return
  }

  try {
    // 2. Verificar autenticidad y vigencia del token
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
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