import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';

import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class  IgtcrService {

  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient,
  ) { }


  public igtcrListsSearch(start: string, end: string, testid: string, patientId: string, patientname: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/ngsartifacts/insert`, { start, end , testid, patientId });
  }




}
