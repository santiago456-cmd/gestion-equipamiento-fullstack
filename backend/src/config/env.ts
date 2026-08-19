import dotenv from 'dotenv'
import z from 'zod';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
dotenv.config({ path: envFile})

const optionalPort = (defaultValue: number) =>
  z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.coerce.number().int().positive().default(defaultValue),
  );

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'produccion']).default('development'),
    PORT: optionalPort(3000),
    APP_NAME: z.string().default('api-solicitudes-equipamientos'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),

    JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
    JWT_EMAIL_SECRET: z.string().min(16, 'JWT_EMAIL_SECRET debe tener al menos 16 caracteres'),

    DB_HOST: z.string().min(1),
    DB_PORT: optionalPort(5432),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),

    SMTP_HOST: z.string().default(''),
    SMTP_PORT: optionalPort(587),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    SMTP_FROM: z.string().default('no-reply@gestion-equipamiento.local'),

    LOG_LEVEL: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success){
    console.error('Variables de entorno invalidas o faltantes')
    for (const issue of parsed.error.issues){
        console.error(`    - ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
}

const rawEnv = parsed.data

export const env = {
    port: rawEnv.PORT,
    appName: rawEnv.APP_NAME,
    corsOrigin: rawEnv.CORS_ORIGIN,
    jwtSecret: rawEnv.JWT_SECRET,
    jwtEmailSecret: rawEnv.JWT_EMAIL_SECRET,
    db: {
        host: rawEnv.DB_HOST,
        port: rawEnv.DB_PORT,
        user: rawEnv.DB_USER,
        password: rawEnv.DB_PASSWORD,
        name: rawEnv.DB_NAME,
    },
    redis: {
        host: rawEnv.REDIS_HOST,
        port: rawEnv.REDIS_PORT,
    },
    smtp: {
        host: rawEnv.SMTP_HOST,
        port: rawEnv.SMTP_PORT,
        user: rawEnv.SMTP_USER,
        pass: rawEnv.SMTP_PASS,
        from: rawEnv.SMTP_FROM,
    }
}