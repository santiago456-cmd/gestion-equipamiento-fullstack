import { Router } from 'express';
import { equipoController } from '../controllers/equipoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/equipos
router.get('/', authMiddleware, equipoController.listarEquipos);

export const equipoRoutes = router;