import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { emrUrl } from '../config';
import { IMent } from '../inhouse/models/artifacts';
import { ICodecomment, ICodement } from '../inhouse/models/comments';

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

  public insertBatch(ment: IMent): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/insert`, { ...ment });
  }

  public insertItem(type: string, ment: IMent): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/insert`, { type, ...ment });
  }

  public updateItem(type: string, ment: IMent): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/update`, { type, ...ment });
  }

  public deleteItem(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/delete`, { id });
  }

  //////////////  testcodelists
  public getCodeLists(): Observable<ICodement[]> {
    return this.http.get<ICodement[]>(`${this.apiUrl}/codedefault/codelists`);
  }

  public codeinsertItem(type: string, ment: ICodement): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/codeinsert`, { type, ...ment });
  }

  public codeupdateItem(type: string, ment: ICodement): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/codeupdate`, { type, ...ment });
  }

  public codedeleteItem(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/codedelete`, { id });
  }

  ///////////// 코멘트 관리 readingcomment
  public getCommentLists(type: string, code: string): Observable<ICodecomment[]> {
    return this.http.post<ICodecomment[]>(`${this.apiUrl}/codedefault/commentlists`, { type, code });
  }

  public commentinsertItem(ment: ICodecomment[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/commentinsert`, { reading: ment });
  }

  public commentupdateItem(ment: ICodecomment): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/commentupdate`, { ...ment });
  }

  public commentdeleteItem(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/codedefault/commentdelete`, { id });
  }




}
