import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Info } from '../models/info';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Info/';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}

  //get
  getInfo(): Observable<Info[]> {
    return this.http.get<Info[]>(this.myAppUrl + this.myApiUrl);
  }
  //post
  guardarInfo(info: Info): Observable<Info> {
    return this.http.post<Info>(
      this.myAppUrl + this.myApiUrl,
      info,
      this.httpOptions
    );
  }
  //get id
  cargarInfo(id: number): Observable<Info> {
    return this.http.get<Info>(this.myAppUrl + this.myApiUrl + id);
  }
  //put
  actualizarInfo(id: number, info: Info): Observable<Info> {
    return this.http.put<Info>(
      this.myAppUrl + this.myApiUrl + id,
      info,
      this.httpOptions
    );
  }
}
