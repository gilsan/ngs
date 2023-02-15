import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';

import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { IPatient } from 'src/app/home/models/patients';
import { ITcrData } from './igtcr.model';

@Injectable({
  providedIn: 'root'
})
export class  IgtcrService {

  private apiUrl = emrUrl;
  patientLists: IPatient[] = [];

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

// http://183.98.12.201:3000/igtcr/save
public igtSave(data: ITcrData) {
  return this.http.post(`${this.apiUrl}/igtcr/save`, data);
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



}
