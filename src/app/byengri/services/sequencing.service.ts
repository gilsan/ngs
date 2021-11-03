import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { emrUrl } from 'src/app/config';
import { Observable, Subject } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { IFilteredOriginData, IPatient, Ipolymorphism, IStateControl } from '../models/patients';


export interface ISequencing {
  nutation: string;
  reportDate: string;
  examiner: string;
  rechecker: string;
  paritienid?: string;
  title: string;
  descriptionCode: string;
  testCode: string;
  comments?: string;
  mutation?: string;
}




@Injectable({
  providedIn: 'root'
})
export class SequencingService {

  private listSubject$ = new Subject<string>();
  public listObservable$ = this.listSubject$.asObservable();

  private apiUrl = emrUrl;
  sequencing: ISequencing;
  constructor(
    private http: HttpClient
  ) { }

  //  filteredOriginData/list,  POST { pathologyNum: "123456" }
  insertSequencing(
    mutation: string,
    reportDate: string,
    examiner: string,
    rechecker: string,
    patientid: string,
    title: string,
    descriptionCode: string,
    testCode: string,
    comments: string,
    patientinfo: IPatient
  ): Observable<ISequencing> {
    return this.http.post<ISequencing>(`${this.apiUrl}/sequencingdiag/insert`,
      {
        mutation,
        reportDate,
        examiner,
        rechecker,
        patientid,
        title,
        descriptionCode,
        testCode,
        comments,
        patientinfo
      });
  }

  listSequencing(patientid: string): Observable<ISequencing[]> {
    return this.http.post<ISequencing[]>(`${this.apiUrl}/sequencingdiag/list`, { patientid });
  }

  getTitle(prescriptioncode: string): Observable<any> {
    return this.http.post<ISequencing[]>(`${this.apiUrl}/patients_path/testcode`, { prescription_code: prescriptioncode });
  }

  makeEvent(val: string): Observable<string> {
    this.listSubject$.next(val);
    return this.listSubject$;
  }







}
