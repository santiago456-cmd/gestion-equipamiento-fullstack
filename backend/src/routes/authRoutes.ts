import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

router.get('/confirmar/:token', authController.confirmarCuenta)
router.post('/recuperar-contrasena', authController.solicitarRecuperacion)
router.post('/restablecer-contrasena', authController.restablecerContrasena)

export const authRoutes = router;
