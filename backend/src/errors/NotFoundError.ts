import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
    constructor(message: string = "Recurso no encontrado."){
        super(message, 404)
    }
}