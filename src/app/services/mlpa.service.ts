import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';

export interface IData {
  seq: string;
  site: string;
  result?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MlpaService {

  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public mlpaTempSave(specimenNo: string, comment: string, data: IData[],
    result: string, technique: string, title: string, type: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/mlpa/saveScreenMlpa`, { specimenNo, comment, data, result, technique, title, type });
  }

  public getMlpaData(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mlpa/mlpaData`, { type });
  }

  public getMlpaList(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mlpa/mlpaList`, { type });
  }

}
