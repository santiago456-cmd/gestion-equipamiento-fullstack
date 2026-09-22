import { AppError } from "./AppError.js";

export class TooManyRequestError extends AppError {
    constructor(message: string = 'Demasiadas solicitudes. Intenta nuevamente mas tarde.'){
        super(message, 429)
    }
}