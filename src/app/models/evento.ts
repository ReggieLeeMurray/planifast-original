import { Empleado } from './empleado';

export class Evento {
  id?: number;
  tipo: string;
  comentario: string;
  fechaInicio: Date;
  fechaFinal: Date;
  color: string;
  empleadosID: number;
  nombres: Empleado;
  apellidos: Empleado;
}
