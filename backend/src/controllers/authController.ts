import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import type {
  RegisterInput, LoginInput, ConfirmarCuentaParams,
  RecuperarContrasenaInput, RestablecerContrasenaInput,
} from '../schemas/authSchemas.js';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.validated!.body as RegisterInput;
      const usuarioCreado = await authService.registrar(body);
      res.status(201).json({
        ok: true,
        message: 'Usuario registrado exitosamente. Revisá tu correo para confirmar la cuenta.',
        data: usuarioCreado,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.validated!.body as LoginInput;
      const dataSesion = await authService.login(email, password);

      res.status(200).json({
        ok: true,
        message: 'Inicio de sesión exitoso.',
        ...dataSesion,
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmarCuenta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.validated!.params as ConfirmarCuentaParams;
      const resultado = await authService.confirmarCuenta(token);
      res.status(200).json({ ok: true, ...resultado });
    } catch (error) {
      next(error);
    }
  }

  async solicitarRecuperacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.validated!.body as RecuperarContrasenaInput;
      await authService.solicitarRecuperacion(email);
      res.status(200).json({
        ok: true,
        message: 'Si el correo electrónico está registrado, vas a recibir un enlace para restablecer tu contraseña.',
      });
    } catch (error) {
      next(error);
    }
  }

  async restablecerContrasena(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, nuevaContrasena } = req.validated!.body as RestablecerContrasenaInput;
      await authService.restablecerContrasena(token, nuevaContrasena);
      res.status(200).json({ ok: true, message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
