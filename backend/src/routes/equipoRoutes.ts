import { Router } from 'express';
import { equipoController } from '../controllers/equipoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { listarEquiposQuerySchema } from '../schemas/equipoSchemas.js';

const router = Router();

// GET /api/equipos
router.get('/', authMiddleware, validate({ query: listarEquiposQuerySchema }), equipoController.listarEquipos);

export const equipoRoutes = router;