import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmpleadoInactivo } from '../models/empleadoinactivo';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoinactivoService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/EmpleadoInactivo/';
  myCustomApiUrl = 'Activos';
  myCustomApiUrl2 = 'Inactivos';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}

  //get
  getListEmpleadosInactivos(): Observable<EmpleadoInactivo[]> {
    return this.http.get<EmpleadoInactivo[]>(this.myAppUrl + this.myApiUrl);
  }

  //get query activos
  getListEmpleadosActivos(): Observable<EmpleadoInactivo[]> {
    return this.http.get<EmpleadoInactivo[]>(
      this.myAppUrl + this.myApiUrl + this.myCustomApiUrl
    );
  }
  //get query inactivos
  getListEmpleadosNoActivos(): Observable<EmpleadoInactivo[]> {
    return this.http.get<EmpleadoInactivo[]>(
      this.myAppUrl + this.myApiUrl + this.myCustomApiUrl2
    );
  }
  //delete
  deleteEmpleadosInactivos(id: number): Observable<EmpleadoInactivo> {
    return this.http.delete<EmpleadoInactivo>(
      this.myAppUrl + this.myApiUrl + id
    );
  }
  //post
  guardarEmpleadosInactivos(
    empleado: EmpleadoInactivo
  ): Observable<EmpleadoInactivo> {
    return this.http.post<EmpleadoInactivo>(
      this.myAppUrl + this.myApiUrl,
      empleado,
      this.httpOptions
    );
  }
  //get id
  cargarEmpleadosInactivos(id: number): Observable<EmpleadoInactivo> {
    return this.http.get<EmpleadoInactivo>(this.myAppUrl + this.myApiUrl + id);
  }
  //put
  actualizarEmpleadosInactivos(
    id: number,
    empleado: EmpleadoInactivo
  ): Observable<EmpleadoInactivo> {
    return this.http.put<EmpleadoInactivo>(
      this.myAppUrl + this.myApiUrl + id,
      empleado,
      this.httpOptions
    );
  }
}
