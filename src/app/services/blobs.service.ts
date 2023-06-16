import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BlobsService {
  myAppUrl = environment.myAppUrl;
  myApiUrl = 'api/upload';

  constructor(private http: HttpClient) {}

  upload(archivo: Blob) {
    return this.http.post<{ path: string }>(this.myAppUrl + this.myApiUrl, archivo);
  }
}
