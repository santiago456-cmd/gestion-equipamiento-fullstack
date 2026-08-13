import { Request, Response, NextFunction } from "express";
import { ValidationError as SequelizeValidationError } from "sequelize";

interface HttpError extends Error {
    status?: number
}

export function errorMiddleware(
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    console.error(`❌ Error capturado en el flujo: ${err.message}`);

    if (err instanceof SequelizeValidationError) {
        res.status(400).json({
            ok: false,
            error: err.errors.map((e) => e.message).join(', '),
        })
        return
    }

    const status = err.status || 500

    res.status(status).json({
        ok: false,
        error: err.message || 'Ocurrio un error inesperado en el servidor'
    })
}
