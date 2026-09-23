import type { CookieOptions } from "express";
import { env } from "./env.js";

const isProduction = env.nodeEnv === 'production'

// En test, Supertest pega por HTTP plano sin la excepción de "localhost seguro"
// que sí tiene Chrome — una cookie Secure nunca se reenviaría y todo daría 401.
const isTest = env.nodeEnv === 'test';


export const AUTH_COOKIE_NAME = 'accessToken'

export function buildAuthCookieOptions(maxAgeMs: number): CookieOptions {
    return {
        httpOnly: true,
        secure: !isTest,
        sameSite: isTest ? 'lax' : 'none',
        maxAge: maxAgeMs,
        path:'/'
    }
}