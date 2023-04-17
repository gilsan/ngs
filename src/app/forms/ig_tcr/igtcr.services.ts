import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';

import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { IPatient } from 'src/app/home/models/patients';
import { IRESARCHLIST, ITcrData, ITYPE } from './igtcr.model';

@Injectable({
  providedIn: 'root'
})
export class  IgtcrService {

  private apiUrl = emrUrl;
  patientLists: IPatient[] = [];
  list: IRESARCHLIST = {
    name: '',
    age: '',
    gender: '',
    patientID: '',
    test_code: '',
    testname: '',
    reportTitle: '',
    specimenNo: ''
  };


  constructor(
    private http: HttpClient,
  ) { }

 

  getListsDig(type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resultmanager/list`, { type })
      .pipe(
        shareReplay()
      );
  }


  public igtcrListsSearch(start: string, end: string, specimenNo: string = '',
  patientID: string = '',  name: string = '', status: string ='',
  sheet: string = '', research1: string = ''): Observable<IPatient[]> {
  return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listigtcr`,
  { start ,
    end ,
    patientID,
    name,
    specimenNo,
    status ,
    sheet ,
    research1 })
  .pipe(
    tap(data => {
      this.patientLists = data
    })
  );
}

/*
http://183.98.12.201:3000/igtcr/list post
parameter
{
  "specimenNo": "M20-999"
}

*/

public igtcrListInfo(specimenNo: string): Observable<any> {

  return this.http.post(`${this.apiUrl}/igtcr/list`, {specimenNo})
}

public igtcrListTrbTrg(specimenNo: string, gene: string) {
  return this.http.post(`${this.apiUrl}/igtcr/list_557`, {specimenNo, gene})
}

// http://183.98.12.201:3000/igtcr/save
public igtSave(data: ITcrData): Observable<{message: string}>  {
  return this.http.post<{message: string}>(`${this.apiUrl}/igtcr/save`, data);
}

// pdf api
// post http://183.98.12.201:3000/igtcr/report
// {
//     "specimenNo": "M20-999"
// }
public igtcrReport1(specimenNo: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/igtcr/report`, {specimenNo});
}



// pdf api 2
// post http://183.98.12.201:3000/igtcr/report2
// {
//     "specimenNo": "M20-999"
// }

public igtcrReport2(specimenNo: string) {
  return this.http.post(`${this.apiUrl}/igtcr/report2`, {specimenNo});
}


///////////// 연구용 ////////////////////////////
//////// 연구용

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
public fakeEMRSend(specimenNo: string, type: string, userid: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/patients_diag/reset`, { specimenNo, type, userid });
}






}
