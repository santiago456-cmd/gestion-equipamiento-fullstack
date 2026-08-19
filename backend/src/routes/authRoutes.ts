import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, confirmarCuentaParamsSchema, recuperarContrasenaSchema,
    restablecerContrasenaSchema
 } from '../schemas/authSchemas.js';

const router = Router();

// POST /api/auth/register
router.post('/register', validate({ body: registerSchema}), authController.register);

// POST /api/auth/login
router.post('/login', validate({body: loginSchema}),  authController.login);

router.get('/confirmar/:token', validate({params: confirmarCuentaParamsSchema}), authController.confirmarCuenta)
router.post('/recuperar-contrasena', validate({body: recuperarContrasenaSchema}) , authController.solicitarRecuperacion)
router.post('/restablecer-contrasena', validate({body: restablecerContrasenaSchema}) , authController.restablecerContrasena)

export const authRoutes = router;
