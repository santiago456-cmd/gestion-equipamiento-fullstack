import { Request, Response, NextFunction } from "express";
import { usuarioService } from "../services/usuarioService.js";
import { Token } from "nodemailer/lib/xoauth2/index.js";

interface ActualizarPerfilBody{
    nombre: string
}

interface SolicitarCambioEmailBody{
    nuevoEmail: string
}

interface CambiarContrasenaBody{
    passwordActual: string
    passwordNueva: string
}

class UsuarioController{
    async actualizarPerfil(req: Request<{}, {}, ActualizarPerfilBody>, res: Response, next: NextFunction): Promise<void>{
        try {
            const usuarioActualizado = await usuarioService.actualizarNombre(req.user!.id, req.body.nombre)
            res.status(200).json({
                ok: true, 
                message: 'Perfil actualizado exitosamente.',
                data: usuarioActualizado
            })
        } catch (error) {
            next(error)
        }
    }

    async solicitarCambioEmail(req: Request<{}, {}, SolicitarCambioEmailBody>, res: Response, next: NextFunction): Promise<void>{
        try {
            await usuarioService.solicitarCambioEmail(req.user!.id, req.body.nuevoEmail)
            res.status(200).json({
                ok: true, 
                message: 'Revisa tu correo electronico para confirmar el cambio. El enlace es valido por 2 horas.'
            })
        } catch (error) {
            next(error)
        }
    }

    async ConfirmarCambioEmail(req: Request<{token: string}>, res: Response, next: NextFunction): Promise<void>{
        try {
            const resultado = await usuarioService.confirmarCambioEmail(req.params.token)
            res.status(200).json({
                ok: true, 
                ...resultado
            })
        } catch (error) {
            next(error)
        }
    }

    async cambiarContrasena(req: Request<{}, {}, CambiarContrasenaBody>, res: Response, next: NextFunction): Promise<void>{
        try {
            await usuarioService.cambiarcontrasena(req.user!.id, req.body.passwordActual, req.body.passwordNueva)
            res.status(200).json({
                ok: true, 
                message: 'Contraseña actualizada exitosamente.'
            })
        } catch (error) {
            next(error)
        }
    }
}

export const usuarioController = new UsuarioController()