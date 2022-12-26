import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento } from '../models/departamento';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DepartamentosService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Departamento/';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}
  //get
  getListDeptos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(this.myAppUrl + this.myApiUrl);
  }
  //delete
  deleteDeptos(id: number): Observable<Departamento> {
    return this.http.delete<Departamento>(this.myAppUrl + this.myApiUrl + id);
  }
  //post
  guardarDeptos(depto: Departamento): Observable<Departamento> {
    return this.http.post<Departamento>(
      this.myAppUrl + this.myApiUrl,
      depto,
      this.httpOptions
    );
  }
  //get id
  cargarDeptos(id: number): Observable<Departamento> {
    return this.http.get<Departamento>(this.myAppUrl + this.myApiUrl + id);
  }
  //put
  actualizarDepto(id: number, depto: Departamento): Observable<Departamento> {
    return this.http.put<Departamento>(
      this.myAppUrl + this.myApiUrl + id,
      depto,
      this.httpOptions
    );
  }
}
