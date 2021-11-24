import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { emrUrl } from 'src/app/config';
import { Observable, Subject } from 'rxjs';
import { filter, shareReplay, tap } from 'rxjs/operators';
import { IESS, IFilteredOriginData, ILIST, IPatient, Ipolymorphism, IStateControl } from '../models/patients';
import { IITEM } from '../models/item-move.model';


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

  // Essentail 가져오기
  getEssTitle(): Observable<IESS[]> {
    return this.http.get<IESS[]>(`${this.apiUrl}/mutation/esslists`)
      .pipe(
        shareReplay()
      );
  }

  // Essential Title 만 가져오기
  getEssTitleOnly(): Observable<{ title: string }[]> {
    return this.http.get<{ title: string }[]>(`${this.apiUrl}/mutation/esstitleonly`)
      .pipe(
        shareReplay()
      );
  }



  // Essentail 입력
  getEssInsert(ess: IESS): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/essinsert`, ess);
  }
  // // Essentail 수정
  getEssUpdate(ess: IESS): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/essupdate`, ess);
  }

  // Essentail 삭제
  getEssDelete(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/essdelete`, { id });
  }

  ///// 자리이동 내역

  /// 목록
  listMoveHistory(pathologyNum: string): Observable<IITEM[]> {
    return this.http.post<IITEM[]>(`${this.apiUrl}/sequencingdiag/listMoveHistory`, { pathologyNum });
  }

  //// 입력
  insertMoveHistory(item: IITEM): Observable<any> {
    return this.http.post(`${this.apiUrl}/sequencingdiag/insertMoveHistory`, { ...item });
  }

  // 수정
  updateMoveHistory(item: IITEM): Observable<any> {
    return this.http.post(`${this.apiUrl}/sequencingdiag/updateMoveHistory`, { ...item });
  }

  /// 삭제
  deleteMoveHistory(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sequencingdiag/deleteMoveHistory`, { id });
  }





}
