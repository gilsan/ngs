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
    nutation: string,
    reportDate: string,
    examiner: string,
    rechecker: string,
    paritienid: string,
    title: string,
    descriptionCode: string,
    testCode: string,
    comments: string
  ): Observable<ISequencing> {
    return this.http.post<ISequencing>(`${this.apiUrl}/sequencingdiag/insert`,
      {
        nutation,
        reportDate,
        examiner,
        rechecker,
        paritienid,
        title,
        descriptionCode,
        testCode,
        comments
      });
  }

  listSequencing(): Observable<ISequencing[]> {
    return this.http.get<ISequencing[]>(`${this.apiUrl}/sequencingdiag/list`);
  }





}
