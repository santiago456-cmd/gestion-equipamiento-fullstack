import { Redis } from 'ioredis'
import { env } from './env.js'
import { logger } from './logger.js'

export const redisClient = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    lazyConnect: true,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    maxRetriesPerRequest: 1,
})

redisClient.on('error', (err) => {
    logger.warn({err}, 'Error de conexion con Redis (rate limiting / sesion)')
})

// blacklist de jwt 
const BLACKLIST_PREFIX = "blacklist:jti:"

export async function blacklistToken(jti: string, expiresAt:number): Promise<void> {
    const ttlSeconds = expiresAt - Math.floor(Date.now() / 1000)
    if (ttlSeconds <= 0) return

    try {
        await redisClient.set(`${BLACKLIST_PREFIX}${jti}`, '1', 'EX', ttlSeconds)
    } catch (error) {
        logger.warn({error}, 'No se pudo generar el token a la blacklist en Redis')
    }
}

export async function isTokenBlacklisted(jti:string): Promise<boolean> {
    try {
        const result = await redisClient.exists(`${BLACKLIST_PREFIX}${jti}`)
        return result === 1
    } catch (error) {
        logger.warn({error}, 'No se pudo verificar la blacklist en Redis')
        return false
    }
}