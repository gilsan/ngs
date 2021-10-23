import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { emrUrl } from '../config';
import { ICode, IMent } from '../inhouse/models/artifacts';

@Injectable({
  providedIn: 'root',
})
export class CodeDefaultValue {

  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient,
  ) { }


  public getLists(type: string): Observable<IMent[]> {
    return this.http.post<IMent[]>(`${this.apiUrl}/codedefault/lists`, { type });
  }

  public insertItem(type: string, ment: IMent): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/insert`, { type, ...ment });
  }

  public updateItem(type: string, ment: IMent): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/update`, { type, ...ment });
  }

  public deleteItem(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/delete`, { type });
  }

  //////////////
  public getCodeLists(): Observable<ICode[]> {
    return this.http.get<ICode[]>(`${this.apiUrl}/codedefault/codelists`);
  }


}
