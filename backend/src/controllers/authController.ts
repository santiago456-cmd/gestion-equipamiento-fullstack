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

interface RecuperarBody{
  email: string;
}

interface RestablecerBody{
  token: string;
  nuevaContrasena: string;
}

class AuthController {
  async register(req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioCreado = await authService.registrar(req.body);
      res.status(201).json({
        ok: true,
        message: 'Usuario registrado exitosamente. Revisa tu correo para confirmar la cuenta.',
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

  async confirmarCuenta(req: Request<{token:string}>, res: Response, next: NextFunction): Promise<void>{
    try {
      const {token} = req.params;
      const resultado = await authService.confirmarCuenta(token)
      res.status(200).json({
        ok: true, ...resultado
      })
    } catch (error) {
      next(error)
    }
  }

  async solicitarRecuperacion(req: Request<{}, {}, RecuperarBody>, res: Response, next: NextFunction): Promise<void>{
    try {
      await authService.solicitarRecuperacion(req.body.email);
      res.status(200).json({
        ok: true, 
        message: 'Si el correo electronico esta registrado, vas a recibir un enlace para restablecer tu contraseña.'
      })
    } catch (error) {
      next(error)
    }
  }

  async restablecerContrasena(req: Request<{}, {}, RestablecerBody>, res: Response, next: NextFunction): Promise<void>{
    try {
      await authService.restablecerContrasena(req.body.token, req.body.nuevaContrasena);
      res.status(200).json({
        ok: true, 
        message: 'Contraseña actualizada exitosamente.'
      })
    } catch (error) {
      next(error)
    }
  }
}

export const authController = new AuthController();
