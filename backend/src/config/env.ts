import 'dotenv/config';

interface DbEnv {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string
}

interface Env {
    port: number;
    appName: string;
    corsOrigin: string;
    db: DbEnv;
}

export const env: Env = {
    port: Number(process.env.PORT) || 3000,
    appName: process.env.APP_NAME || 'api-solicitudes-equipamientos',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || ''
    }

}