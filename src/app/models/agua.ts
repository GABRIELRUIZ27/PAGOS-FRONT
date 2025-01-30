import { Comunidad } from "./comunidad";
import { TiposDeServicio } from "./tiposDeServicio";

export interface Agua {
    id: number;
    domicilio: string;
    folio: string;
    contrato: string;
    comunidad: Comunidad;
    nombre: string;
    periodo: string;
    tipoServicio: TiposDeServicio;
}
