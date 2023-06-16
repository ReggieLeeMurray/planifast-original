import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Resultado } from '../models/resultado';

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Resultado/';
  myCustomApiUrl = 'CargaMasiva';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  //get
  getResultados(): Observable<Resultado[]> {
    return this.http.get<Resultado[]>(this.myAppUrl + this.myApiUrl);
  }
  //post all
  guardarContenidoCompleto(resultado: Resultado[]): Observable<Resultado[]> {
    return this.http.post<Resultado[]>(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl, resultado, this.httpOptions);
  }
}
