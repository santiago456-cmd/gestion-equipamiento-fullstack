import { JwtPayload } from "jsonwebtoken";
import { RolUsuario } from "../../models/Usuario.js";

export interface AuthUser extends JwtPayload {
    id: number;
    rol: RolUsuario;
    email?: string;
}

declare global {
    namespace Express{
        interface Request{
            user?: AuthUser;
        }
    }
}