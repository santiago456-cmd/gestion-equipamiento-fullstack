import { Request, Response, NextFunction } from 'express';
import { usuarioService } from '../services/usuarioService.js';
import type {
  ActualizarPerfilInput, SolicitarCambioEmailInput,
  ConfirmarCambioEmailParams, CambiarContrasenaInput,
} from '../schemas/usuarioSchemas.js';
import { blacklistToken } from '../config/redisClient.js';
import { AUTH_COOKIE_NAME, buildAuthCookieOptions } from '../config/cookieConfig.js';

class UsuarioController {
  async actualizarPerfil(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nombre } = req.validated!.body as ActualizarPerfilInput;
      const usuarioActualizado = await usuarioService.actualizarNombre(req.user!.id, nombre);
      res.status(200).json({
        ok: true,
        message: 'Perfil actualizado exitosamente.',
        data: usuarioActualizado,
      });
    } catch (error) {
      next(error);
    }
  }

  async solicitarCambioEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nuevoEmail } = req.validated!.body as SolicitarCambioEmailInput;
      await usuarioService.solicitarCambioEmail(req.user!.id, nuevoEmail);
      res.status(200).json({
        ok: true,
        message: 'Revisá tu nuevo correo electrónico para confirmar el cambio. El enlace es válido por 2 horas.',
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmarCambioEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.validated!.params as ConfirmarCambioEmailParams;
      const resultado = await usuarioService.confirmarCambioEmail(token);
      res.status(200).json({ ok: true, ...resultado });
    } catch (error) {
      next(error);
    }
  }

  async cambiarContrasena(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { passwordActual, passwordNueva } = req.validated!.body as CambiarContrasenaInput;
      await usuarioService.cambiarcontrasena(req.user!.id, passwordActual, passwordNueva);

      // invalida la sesion actual - fuerza a loguearse de nuevo con la nueva contraseña
      if (req.user!.jti && req.user!.exp){
        await blacklistToken(req.user!.jti, req.user!.exp)
      }
      res.clearCookie(AUTH_COOKIE_NAME, buildAuthCookieOptions(0))
      res.status(200).json({ ok: true, message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
      next(error);
    }
  }
}

export const usuarioController = new UsuarioController();