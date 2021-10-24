import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { emrUrl } from '../config';
import { IMent } from '../inhouse/models/artifacts';
import { ICodement } from '../inhouse/models/comments';

@Injectable({
  providedIn: 'root',
})
export class CodeDefaultValue {

  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient,
  ) { }


  public getLists(): Observable<IMent[]> {
    return this.http.get<IMent[]>(`${this.apiUrl}/codedefault/lists`);
  }

  public getList(type: string): Observable<IMent[]> {
    return this.http.post<IMent[]>(`${this.apiUrl}/codedefault/list`, { type });
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
  public getCodeLists(): Observable<ICodement[]> {
    return this.http.get<ICodement[]>(`${this.apiUrl}/codedefault/codelists`);
  }

  public codeinsertItem(type: string, ment: ICodement): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/codeinsert`, { type, ...ment });
  }

  public codeupdateItem(type: string, ment: ICodement): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/codeupdate`, { type, ...ment });
  }

  public codedeleteItem(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/codedelete`, { type });
  }




}
