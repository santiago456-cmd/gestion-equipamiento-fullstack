import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";

export interface RequestContextStore {
    requestId: string
}

export const requestContext = new AsyncLocalStorage<RequestContextStore>()

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
    const incomingId = req.headers["x-request-id"]

    // el header puede venir como string, array de strings (si se repitio) o ausente.
    const requestId = 
        typeof incomingId === "string" && incomingId.trim() !== "" ? incomingId : randomUUID()

    res.setHeader("x-request-id", requestId)

    requestContext.run({requestId}, () => {
        next()
    })
}