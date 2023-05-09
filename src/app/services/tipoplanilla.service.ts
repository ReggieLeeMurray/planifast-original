import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoPlanilla } from '../models/tipoplanilla';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TipoplanillaService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/TipoPlanilla/';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}
  //get
  getListTipoPlanilla(): Observable<TipoPlanilla[]> {
    return this.http.get<TipoPlanilla[]>(this.myAppUrl + this.myApiUrl);
  }
  //delete
  deleteTipoPlanilla(id: number): Observable<TipoPlanilla> {
    return this.http.delete<TipoPlanilla>(this.myAppUrl + this.myApiUrl + id);
  }
  //post
  guardarTipoPlanilla(tp: TipoPlanilla): Observable<TipoPlanilla> {
    return this.http.post<TipoPlanilla>(this.myAppUrl + this.myApiUrl, tp, this.httpOptions);
  }
  //get id
  cargarTipoPlanilla(id: number): Observable<TipoPlanilla> {
    return this.http.get<TipoPlanilla>(this.myAppUrl + this.myApiUrl + id);
  }
  //put
  actualizarTipoPlanilla(id: number, tp: TipoPlanilla): Observable<TipoPlanilla> {
    return this.http.put<TipoPlanilla>(this.myAppUrl + this.myApiUrl + id, tp, this.httpOptions);
  }
}
