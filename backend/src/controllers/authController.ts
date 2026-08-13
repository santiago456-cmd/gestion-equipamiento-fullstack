import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

interface RegisterBody{
  nombre: string;
  email: string;
  password: string
}

interface LoginBody{
  email: string;
  password: string;
}

class AuthController {
  async register(req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioCreado = await authService.registrar(req.body);
      res.status(201).json({
        ok: true,
        message: 'Usuario registrado exitosamente.',
        data: usuarioCreado
      });
    } catch (error) {
      next(error); // Delega el fallo al middleware de errores centralizado
    }
  }

  async login(req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction): Promise<void>{
    try {
      const { email, password } = req.body;
      const dataSesion = await authService.login(email, password);
      
      res.status(200).json({
        ok: true,
        message: 'Inicio de sesión exitoso.',
        ...dataSesion
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
