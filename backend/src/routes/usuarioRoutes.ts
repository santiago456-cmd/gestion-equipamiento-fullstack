import { Router } from "express";
import { usuarioController } from "../controllers/usuarioController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  actualizarPerfilSchema, solicitarCambioEmailSchema,
  confirmarCambioEmailParamsSchema, cambiarContrasenaSchema,
} from '../schemas/usuarioSchemas.js';

const router = Router()

// publica: se accede desde el link del mail, sin sesion activa
router.get('/confirmar-cambio-email/:token', validate({ params: confirmarCambioEmailParamsSchema }), usuarioController.confirmarCambioEmail)

// requiere sesion activa
router.patch('/me' , validate({ body: actualizarPerfilSchema }), authMiddleware, usuarioController.actualizarPerfil)
router.post('/me/email',validate({ body: solicitarCambioEmailSchema }), authMiddleware, usuarioController.solicitarCambioEmail)
router.post('/me/password',validate({ body: cambiarContrasenaSchema }), authMiddleware, usuarioController.cambiarContrasena)

export const usuarioRoutes = router