import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../config/redisClient.js";
import { env } from "../config/env.js";
import { TooManyRequestError } from "../errors/TooManyRequestError.js";

const isTestEnv = env.nodeEnv === 'test'

function buildLimiter(options: {windowMs: number; max: number, keyPrefix: string}) {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        standardHeaders: true,
        legacyHeaders: false,
        skip: () => isTestEnv,
        store: isTestEnv
          ? undefined
          : new RedisStore({
                sendCommand: (command: string, ...args: string[]) =>
                    redisClient.call(command, ...args) as Promise<any>,
                prefix: `rl:${options.keyPrefix}:`,
            }),
        handler: (req, res, next) => {
            next(new TooManyRequestError())
        }
    })
}

//limite estricto para endpoints sensibles de autenticación
export const authLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: env.rateLimit.authMax, // 10 intentos por defecto
    keyPrefix: 'auth'
})

// limite general, mas permisivo, como defensa en profundidad para toda la API
export const apiLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: env.rateLimit.apiMax, // 300 request por defecto
    keyPrefix: 'api'
})