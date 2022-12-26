import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Rol/';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  //get
  getListRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.myAppUrl + this.myApiUrl);
  }
  //delete
  deleteRoles(id: number): Observable<Rol> {
    return this.http.delete<Rol>(this.myAppUrl + this.myApiUrl + id);
  }
  //post
  guardarRoles(roles: Rol): Observable<Rol> {
    return this.http.post<Rol>(
      this.myAppUrl + this.myApiUrl,
      roles,
      this.httpOptions
    );
  }
  //get id
  cargarRoles(id: number): Observable<Rol> {
    return this.http.get<Rol>(this.myAppUrl + this.myApiUrl + id);
  }
  //put
  actualizarRoles(id: number, roles: Rol): Observable<Rol> {
    return this.http.put<Rol>(
      this.myAppUrl + this.myApiUrl + id,
      roles,
      this.httpOptions
    );
  }
}
