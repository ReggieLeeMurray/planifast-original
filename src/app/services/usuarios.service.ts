import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Usuario/';
  myCustomApiUrl = 'UsuariosConRoles';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  //get
  getListUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.myAppUrl + this.myApiUrl);
  }
  //delete
  deleteUsuarios(id: number): Observable<Usuario> {
    return this.http.delete<Usuario>(this.myAppUrl + this.myApiUrl + id);
  }
  //post
  guardarUsuarios(usuarios: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.myAppUrl + this.myApiUrl, usuarios, this.httpOptions);
  }
  //get id
  cargarUsuarios(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(this.myAppUrl + this.myApiUrl + id);
  }
  //get usuarios con rol
  getListUsuariosConRol(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl);
  }
  //put
  actualizarUsuarios(id: number, usuarios: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.myAppUrl + this.myApiUrl + id, usuarios, this.httpOptions);
  }
}
