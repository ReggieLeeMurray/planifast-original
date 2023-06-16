import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empleado } from '../models/empleado';

@Injectable({
  providedIn: 'root',
})
export class EmpleadosService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Empleado/';
  myCustomApiUrl = 'CountEmpleadobyDepto';
  myCustomApiUrl2 = 'CountEmpleadobyPlanilla';
  myCustomApiUrl3 = 'CountEmpleadoActivo';
  myCustomApiUrl4 = 'CountEmpleadoInactivo';
  myCustomApiUrl5 = 'byPlanilla?id=';
  myCustomApiUrl6 = 'CargaMasiva';
  myCustomApiUrl7 = 'PersonalByFechaIngreso';
  myCustomApiUrl8 = 'PersonalByFechaSalida';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  //get
  getListEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.myAppUrl + this.myApiUrl);
  }
  //delete
  deleteEmpleados(id: number): Observable<Empleado> {
    return this.http.delete<Empleado>(this.myAppUrl + this.myApiUrl + id);
  }
  //post
  guardarEmpleados(empleado: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.myAppUrl + this.myApiUrl, empleado, this.httpOptions);
  }
  //post masivo
  guardarMuchosEmpleados(empleado: Empleado[]): Observable<Empleado[]> {
    return this.http.post<Empleado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl6, empleado, this.httpOptions);
  }
  //get id
  cargarEmpleados(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(this.myAppUrl + this.myApiUrl + id);
  }
  //get id planilla
  cargarEmpleadosByPlanillaId(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl5 + id);
  }
  //get empleado by depto
  getEmpleadoByDepto(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl);
  }
  //get empleado by planilla
  getEmpleadoByPlanilla(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl2);
  }
  //get count activos
  getCountActivo(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl3);
  }
  //get count inactivos
  getCountInactivo(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl4);
  }
  //get count personal contratado por fecha
  getCountPersonalByFechaIngreso(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl7);
  }
  //get count personal despedido por fecha
  getCountPersonalByFechaSalida(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl8);
  }
  //put
  actualizarEmpleado(id: number, empleado: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(this.myAppUrl + this.myApiUrl + id, empleado, this.httpOptions);
  }
}
