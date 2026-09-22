import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { registerSchema, loginSchema, confirmarCuentaParamsSchema, recuperarContrasenaSchema,
    restablecerContrasenaSchema
 } from '../schemas/authSchemas.js';
 import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register',authLimiter, validate({ body: registerSchema}), authController.register);

// POST /api/auth/login
router.post('/login',authLimiter, validate({body: loginSchema}),  authController.login);

router.post('/logout', authMiddleware, authController.logout)

router.get('/me', authMiddleware, authController.me)

router.get('/confirmar/:token', validate({params: confirmarCuentaParamsSchema}), authController.confirmarCuenta)
router.post('/recuperar-contrasena',authLimiter, validate({body: recuperarContrasenaSchema}) , authController.solicitarRecuperacion)
router.post('/restablecer-contrasena',authLimiter, validate({body: restablecerContrasenaSchema}) , authController.restablecerContrasena)



export const authRoutes = router;
