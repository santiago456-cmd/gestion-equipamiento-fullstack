import { Request, Response, NextFunction } from "express";
import { RolUsuario } from "../models/Usuario.js";

export const checkRole = (rolesPermitidos: RolUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(500).json({
        ok: false,
        error: 'Error de configuración de seguridad del servidor.'
      });
      return 
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({
        ok: false,
        error: `Acceso denegado. Privilegios insuficientes para realizar esta acción.`
      });
      return
    }

    next();
  };
};