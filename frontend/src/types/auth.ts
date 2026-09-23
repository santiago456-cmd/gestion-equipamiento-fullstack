
export type RolUsuario = 'usuario' | 'encargado' | 'admin'

export interface UsuarioAutenticado {
    id: number | string
    nombre: string
    email: string
    rol: RolUsuario
}