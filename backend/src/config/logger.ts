import pino from "pino";
import { requestContext } from "../middlewares/requestContext.js";

const isProduction = process.env.NODE_ENV === "production"

export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    transport: isProduction
        ? undefined
        : {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:HH:MM:ss",
                ignore: "pid,hostname",
        }
    },
    mixin(){
        const store = requestContext.getStore()
        return store?.requestId ? {requestId: store.requestId} : {}
    }
})