import { Rol } from "./rol"

export interface Usuario {
    id: number;
    nombreCompleto: string;
    nombreComleto: string;
    correo: string;
    password: string;
    estatus: boolean;
    rol: Rol;
}
