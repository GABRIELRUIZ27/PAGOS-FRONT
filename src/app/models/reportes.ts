import { Comunidad } from "./comunidad";

export interface Reporte {
    id: number;
    folio: string;
    comunidad: Comunidad;
    nombre?: string;
    telefono?: string;
    direccion: string;
    foto?: string;
    imagenBase64: string;
    latitud: number;
    longitud: number;
    fecha: string;
    atendida: boolean;
}
