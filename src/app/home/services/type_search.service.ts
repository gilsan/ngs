import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { IPatient } from '../models/patients';
import { Observable, Subject, } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';


@Injectable({
  providedIn: 'root',
})
export class TypeSearchService {

  private apiUrl = emrUrl;

  private listSubject$ = new Subject<string>();
  public listObservable$ = this.listSubject$.asObservable();
  public patientInfo: IPatient[];
  testCode: string;

  constructor(
    private http: HttpClient
  ) { }

  // AML/ALL
  // 날자별 환자ID, 검사ID 검사인 찿기
  public amlallSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listAml`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  // lymphoma: http
  public lymphomaSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listLymphoma`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  // MDS/MPN
  public mdsmpnSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listMdsMpn`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }



  // genetic 유전성 유전성
  public hereditarySearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listGenetic`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  // sequencing
  public sequencingSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listSequencing`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  // mlpa
  public mlpaSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listMlpa`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }


}
