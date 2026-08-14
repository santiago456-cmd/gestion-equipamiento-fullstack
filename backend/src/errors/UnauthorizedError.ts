import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
    constructor(message: string = "Credenciales invalidas o ausentes."){
        super(message, 401)
    }
}