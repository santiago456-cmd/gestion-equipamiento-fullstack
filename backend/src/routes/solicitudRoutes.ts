import { Router } from "express";
import { solicitudController } from "../controllers/solicitudController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/verifRolMiddleware.js";

const router = Router();

router.use(authMiddleware);

// GET /api/solicitudes?estado=&equipoId=&categoria=&desde=&hasta=
router.get("/", solicitudController.listarPaginado);

// GET /api/solicitudes/:id
router.get("/:id", solicitudController.obtenerDetalle);

// POST /api/solicitudes
router.post("/", solicitudController.crearSolicitud);

// PUT /api/solicitudes/:id
router.put("/:id", solicitudController.editarSolicitud);

// GET /api/solicitudes/resumen
router.get(
  "/dashboard/resumen",
  checkRole(["admin"]),
  solicitudController.obtenerResumenDashboard,
);

// PATCH /api/solicitudes/:id/cancelar
router.patch("/:id/cancelar", solicitudController.cancelarSolicitud);

// PATCH /api/solicitudes/:id/aprobar
router.patch(
  "/:id/aprobar",
  checkRole(["admin", "encargado"]),
  solicitudController.aprobarSolicitud,
);

// PATCH /api/solicitudes/:id/rechazar
router.patch(
  "/:id/rechazar",
  checkRole(["admin"]),
  solicitudController.rechazarSolicitud,
);

// PATCH /api/solicitudes/:id/devolver
router.patch("/:id/devolver", solicitudController.procesarDevolucion);

// GET /api/solicitudes/:id/historial
router.get("/:id/historial", solicitudController.obtenerHistorial);

export const solicitudRoutes = router;
