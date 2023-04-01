import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Historial } from '../models/historial';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/Historial/';
  myCustomApiUrl = 'Lista';
  myCustomApiUrl2 = 'SumTotalxFechaxPlanilla?id=';
  myCustomApiUrl3 = '&&inicial=';
  myCustomApiUrl4 = '&&final=';
  myCustomApiUrl5 = 'Download/';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  //get
  getListHistory(): Observable<Historial[]> {
    return this.http.get<Historial[]>(this.myAppUrl + this.myApiUrl);
  }
  //get history w/planilla
  getListHistoryWPlanilla(): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      this.myAppUrl + this.myApiUrl + this.myCustomApiUrl
    );
  }
  //delete
  deleteHistory(id: number): Observable<Historial> {
    return this.http.delete<Historial>(this.myAppUrl + this.myApiUrl + id);
  }
  //post
  guardarHistory(history): Observable<Historial> {
    return this.http.post<Historial>(this.myAppUrl + this.myApiUrl, history);
  }
  //post totalPlanilla x fecha x planilla
  SumTotalxFechaxPlanilla(
    id: number,
    inicial: string,
    final: string
  ): Observable<Historial> {
    return this.http.get<Historial>(
      this.myAppUrl +
        this.myApiUrl +
        this.myCustomApiUrl2 +
        id +
        this.myCustomApiUrl3 +
        inicial +
        this.myCustomApiUrl4 +
        final
    );
  }
  //get id
  cargarHistory(id: number): Observable<Historial> {
    return this.http.get<Historial>(this.myAppUrl + this.myApiUrl + id);
  }
  //get id (download from dba)
  downloadFile(id: number): Observable<Blob> {
    return this.http
      .get(this.myAppUrl + this.myApiUrl + this.myCustomApiUrl5 + id, {
        responseType: 'blob',
      })
      .pipe(
        map((res: any) => {
          const blob = new Blob([res], { type: EXCEL_TYPE });
          return blob;
        })
      );
  }
  //put
  actualizarHistory(id: number, history: Historial): Observable<Historial> {
    return this.http.put<Historial>(
      this.myAppUrl + this.myApiUrl + id,
      history,
      this.httpOptions
    );
  }
}
