import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Evento } from '../models/evento';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Evento/';
  myCustomApiUrl = 'Eventos';
  myCustomApiUrl2 = 'CountEventosByTipo';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}

  //get
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl);
  }
  //delete
  deleteEventos(id: number): Observable<Evento> {
    return this.http.delete<Evento>(this.myAppUrl + this.myApiUrl + id);
  }
  //post
  guardarEventos(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.myAppUrl + this.myApiUrl, evento, this.httpOptions);
  }
  //get id
  cargarEventos(id: number): Observable<Evento> {
    return this.http.get<Evento>(this.myAppUrl + this.myApiUrl + id);
  }
  //get
  getListEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.myAppUrl + this.myApiUrl);
  }
  //get eventos by tipo
  getEventosByTipo(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl2);
  }
  //put
  actualizarEventos(id: number, eventos: Evento): Observable<Evento> {
    return this.http.put<Evento>(this.myAppUrl + this.myApiUrl + id, eventos, this.httpOptions);
  }
}
