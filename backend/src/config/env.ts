import dotenv from 'dotenv'

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
dotenv.config({ path: envFile})

interface DbEnv {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
}

interface RedisEnv {
    host: string;
    port: number;
}

interface SmtpEnv {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
}

interface Env {
    port: number;
    appName: string;
    corsOrigin: string;
    db: DbEnv;
    redis: RedisEnv;
    smtp: SmtpEnv;
    jwtEmailSecret: string;
}

export const env: Env = {
    port: Number(process.env.PORT) || 3000,
    appName: process.env.APP_NAME || 'api-solicitudes-equipamientos',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    jwtEmailSecret: process.env.JWT_EMAIL_SECRET || 'secreto_email_para_pruebas_456',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || ''
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
    },
    smtp: {
        host: process.env.SMTP_HOST || '',
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || 'no-reply@gestion-equipamiento.local',
    }
}