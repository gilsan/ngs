import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { IFilteredOriginData, Ipolymorphism, IStateControl } from '../models/patients';


export interface ISequencing {
  nutation: string;
  reportDate: string;
  examiner: string;
  rechecker: string;
  paritienid?: string;
  title: string;
  descriptionCode: string;
  testCode: string;
}


@Injectable({
  providedIn: 'root'
})
export class SequencingService {

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
    comments: string
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
        comments
      });
  }

  listSequencing(patientid: string): Observable<ISequencing[]> {
    return this.http.post<ISequencing[]>(`${this.apiUrl}/sequencingdiag/list`, { patientid });
  }





}