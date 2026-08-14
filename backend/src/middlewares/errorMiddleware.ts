import { Request, Response, NextFunction } from "express";
import { ValidationError as SequelizeValidationError } from "sequelize";
import { AppError } from "../errors/AppError.js";
import { logger } from "../config/logger.js";


export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    
    // errores de validacion de sequelize (incluye UniqueConstraintError, que hereda de este)
    if (err instanceof SequelizeValidationError) {
        const message = err.errors.map((e) => e.message).join(", ");
        logger.warn({err}, message)
        res.status(400).json({
            ok: false,
            error: message
        })
        return
    }

    // errores de negocio conocidos (AppError y subclases)
    if (err instanceof AppError && err.isOperational) {
        logger.warn({statusCode: err.statusCode}, err.message)
        res.status(err.statusCode).json({ok: false, error: err.message})
        return
    }

    // cualquier otra cosa: error no esperado, no confiamos en su mensaje para el cliente
    logger.error({err}, "Error no controlado")
    res.status(500).json({
        ok: false,
        error: "Ocurrio un error inesperado en el servidor"
    })
}
