import type { CookieOptions } from "express";
import { env } from "./env.js";

const isProduction = env.nodeEnv === 'production'

export const AUTH_COOKIE_NAME = 'accessToken'

export function buildAuthCookieOptions(maxAgeMs: number): CookieOptions {
    return {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: maxAgeMs,
        path:'/'
    }
}