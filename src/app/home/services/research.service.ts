import { Injectable } from '@angular/core';
import { IRESARCHLIST, ITYPE } from '../models/research.model';
import { emrUrl } from 'src/app/config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPatient } from '../models/patients';

export interface IDATA {
  name?: string;
  age?: string;
  gender?: string;
  type: string;
  patientid: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResearchService {

  private apiUrl = emrUrl;

  list: IRESARCHLIST;

  constructor(
    private http: HttpClient,
  ) { }




  setData(data: IRESARCHLIST): void {
    this.list = data;


  }

  getData(): IRESARCHLIST {
    return this.list;
  }

  // 목록 가져오기
  public getPatientLists(): Observable<IPatient[]> {
    return this.http.get<IPatient[]>(`${this.apiUrl}/patients_diag/getResearchLists`);
  }

  // 환자등록
  public insertNewPatient(info: IRESARCHLIST, type: string = ''): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/patients_diag/insertPatientinfo`, { ...info, type });
  }

  // Sepecimenno로 등록
  public insertPatientBySpecimenno(specimenNo: string, patientID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients_diag/insertPatientinfoBySepecimenno`, { specimenNo, patientID });
  }

  // Sepecimenno로 갱신
  public updatePatientBySpecimenno(info: IRESARCHLIST): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/patients_diag/updatePatientinfoBySepecimenno`, { ...info });
  }

  // 검체번호로 삭제
  public deletePatientBySpecimenno(specimenNo: string, patientID: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/patients_diag/deletePatientinfoBySepecimenno`, { specimenNo, patientID });
  }

  // type 별 testcode 가져오기
  public getTestcodeByType(type: string): Observable<ITYPE[]> {
    return this.http.post<ITYPE[]>(`${this.apiUrl}/patients_diag/typelists`, { type });
  }

  // FAKE EMR 전송
  public fakeEMRSend(): Observable<any> {
    return this.http.get(`${this.apiUrl}/screen/resetscreen`);
  }

}


