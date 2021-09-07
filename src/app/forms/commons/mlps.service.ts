import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  getMLPStype3(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mlps/lists`);
  }

  getMLPStype4(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mlps/lists`);
  }


}
