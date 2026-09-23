import "./instrumentation.js"
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
import { apiLimiter } from "./middlewares/rateLimiter.js";
import cookieParser from 'cookie-parser'
import { logger } from "./config/logger.js";
import { usuarioRoutes } from "./routes/usuarioRoutes.js";
import { scheduleMonthlyReports } from "./queues/reportsQueue.js";


export function createApp(): Express {
    const app = express();

    if (env.nodeEnv === "production") {
        app.set("trust proxy", 1);
    }

    app.use(express.json());
    app.use(cookieParser())
    app.use(corsMiddleware);
    app.use(requestContextMiddleware)
    app.use(apiLimiter); // defensa en profundidad para TODA la API

    app.get("/", (req: Request, res: Response) => {
        res.json({
            ok: true,
            mensaje: "API de gestión de equipamiento funcionando",
            app: env.appName,
        });
    });

    app.get("/api/health", (req: Request, res: Response) => {
        res.json({
            ok: true,
            status: "ok",
            app: env.appName,
        });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/solicitudes", solicitudRoutes);
    app.use("/api/equipos", equipoRoutes);
    app.use("/api/usuarios", usuarioRoutes)

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

    scheduleMonthlyReports().catch((err) => {
        console.error('No se pudo programar el scheduler de reportes mensuales:', err);
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}