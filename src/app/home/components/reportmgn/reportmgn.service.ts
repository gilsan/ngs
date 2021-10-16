import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { IDList } from '../../models/patients';


@Injectable({
  providedIn: 'root',
})
export class ReportService {

  private apiUrl = emrUrl;
  constructor(private http: HttpClient) { }

  public getList(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resultmanager/list`, { type });
  }

  public getLists(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resultmanager/lists`);
  }


  public getListInsert(type: string, checker: string, reader: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resultmanager/insert`, { type });
  }

  public getListUpdate(type: string, checker: string, reader: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resultmanager/update`, { type, checker, reader });
  }

  // 검진 사용자 목록 가져오기
  getDiagList(): Observable<IDList[]> {
    return this.http.post<IDList[]>(`${this.apiUrl}/loginDiag/listDiag`, { dept: 'D' })
      .pipe(
        shareReplay()
      );
  }



}
