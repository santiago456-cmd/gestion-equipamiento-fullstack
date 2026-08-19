import { Router } from "express";
import { solicitudController } from "../controllers/solicitudController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/verifRolMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  idParamSchema, listarSolicitudesQuerySchema,
  crearSolicitudSchema, editarSolicitudSchema,
} from "../schemas/solicitudSchemas.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validate({ query: listarSolicitudesQuerySchema }), solicitudController.listarPaginado);
router.get("/:id", validate({ params: idParamSchema }), solicitudController.obtenerDetalle);
router.post("/", validate({ body: crearSolicitudSchema }), solicitudController.crearSolicitud);
router.put("/:id", validate({ params: idParamSchema, body: editarSolicitudSchema }), solicitudController.editarSolicitud);

router.get("/dashboard/resumen", checkRole(["admin"]), solicitudController.obtenerResumenDashboard);

router.patch("/:id/cancelar", validate({ params: idParamSchema }), solicitudController.cancelarSolicitud);
router.patch("/:id/aprobar", checkRole(["admin", "encargado"]), validate({ params: idParamSchema }), solicitudController.aprobarSolicitud);
router.patch("/:id/rechazar", checkRole(["admin"]), validate({ params: idParamSchema }), solicitudController.rechazarSolicitud);
router.patch("/:id/devolver", validate({ params: idParamSchema }), solicitudController.procesarDevolucion);
router.get("/:id/historial", validate({ params: idParamSchema }), solicitudController.obtenerHistorial);

export const solicitudRoutes = router;