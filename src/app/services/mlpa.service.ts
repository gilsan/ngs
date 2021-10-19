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

  public mlpaTempSave(specimenNo: string, conclusion: string, comment: string, data: IData[],
    result: string, technique: string, title: string, type: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/mlpa/saveScreenMlpa`,
      { specimenNo, conclusion, comment, data, result, technique, title, type });
  }

  public getMlpaData(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mlpa/mlpaData`, { type });
  }

  public getMlpaList(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mlpa/mlpaList`, { type });
  }


  // MLPA 임시저장
  public saveMlpaSave(resultStatus: string, specimenNo: string, conclusion: string, comment: string, data: IData[],
    result: string, technique: string, title: string, type: string,
    target: string, testmethod: string, analyzedgene: string, specimen: string): Observable<any> {
    let detectedType: string;
    if (resultStatus === 'Detected') {
      detectedType = 'detected';
    } else if (resultStatus === 'Not Detected') {
      detectedType = 'notdetected';
    }

    return this.http.post(`${this.apiUrl}/screen/tempsave_mlpa`,
      {
        resultStatus: detectedType, specimenNo, conclusion, comment, data, result,
        technique, title, type, target, testmethod, analyzedgene, specimen
      });
  }

  // MLPA 내역
  public getMlpaLists(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/screen/listMlpa`, { specimenNo });
  }

  // MLPA 내역
  public getMlpReportMLPA(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/screen/listReportMLPA`, { specimenNo });
  }


}
