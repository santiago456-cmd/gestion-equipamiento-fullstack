import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
    constructor(message: string = "No tienes permiso para realizar esta accion."){
        super(message, 403)
    }
}