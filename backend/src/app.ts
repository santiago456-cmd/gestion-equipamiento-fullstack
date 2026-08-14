import express, {Express, Request, Response} from "express";
import { env } from "./config/env.js";
import { corsMiddleware } from "./middlewares/corsMiddleware.js";
import { solicitudRoutes } from "./routes/solicitudRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { equipoRoutes } from "./routes/equipoRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { setupAssociations } from "./models/associations.js";
import { fileURLToPath } from "node:url";
import { requestContextMiddleware } from "./middlewares/requestContext.js";
import { logger } from "./config/logger.js";


export function createApp(): Express {
    const app = express();

    app.use(express.json());
    app.use(corsMiddleware);
    app.use(requestContextMiddleware)

    app.get("/", (req: Request, res: Response) => {
        res.json({
            ok: true,
            mensaje: "API de gestión de equipamiento funcionando",
            app: env.appName,
        });
    });

    app.get("/api/health", (req: Request, res: Response) => {
        logger.info("health check solicitado")
        res.json({
            ok: true,
            status: "ok",
            app: env.appName,
        });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/solicitudes", solicitudRoutes);
    app.use("/api/equipos", equipoRoutes);

    app.use((req: Request, res: Response) => {
        res.status(404).json({
            ok: false,
            error: "Ruta no encontrada",
            path: req.originalUrl,
        });
    });

    app.use(errorMiddleware);

    return app;
}

function main(): void {
    // Configurar las asociaciones de Sequelize ANTES de iniciar el servidor
    setupAssociations();

    const app = createApp();

    app.listen(env.port, () => {
        console.log(`🚀 ${env.appName} escuchando en http://localhost:${env.port}`);
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}