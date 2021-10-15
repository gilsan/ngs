import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { emrUrl } from 'src/app/config';


@Injectable({
  providedIn: 'root',
})
export class ReportService {

  private apiUrl = emrUrl;
  constructor(private http: HttpClient) { }

  public getLists(type: string): Observable<any> {
    return of({ checker: '김지혜 M.T./이건동 M.T.', reader: '김명신 M.D./김용구 M.D.' })
    //  return this.http.post(`${this.apiUrl}/resultassign/list`, { type });
  }


  public getListInsert(type: string, checker: string, reader: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resultassign/insert`, { type });
  }

  public getListUpdate(type: string, checker: string, reader: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resultassign/update`, { type });
  }



}
