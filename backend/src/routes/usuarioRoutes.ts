import { Router } from "express";
import { usuarioController } from "../controllers/usuarioController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router()

// publica: se accede desde el link del mail, sin sesion activa
router.get('/confirmar-cambio-email/:token', usuarioController.ConfirmarCambioEmail)

// requiere sesion activa
router.patch('/me', authMiddleware, usuarioController.actualizarPerfil)
router.post('/me/email', authMiddleware, usuarioController.solicitarCambioEmail)
router.post('/me/password', authMiddleware, usuarioController.cambiarContrasena)

export const usuarioRoutes = router