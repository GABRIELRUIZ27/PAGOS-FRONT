import { Agua } from "./agua";

export interface ControlAgua {
    id: number;
    fecha: string;
    importe: string;
    descripcion: string;
    agua: Agua;
    servicio: string;
    alcantarillado: string;
    periodo: string;
    inapam: boolean;
    pago: boolean;
    folio: string;
    recargo: string;
}

  
