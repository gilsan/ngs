import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';

import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { IPatient } from 'src/app/home/models/patients';

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


  public igtcrListsSearch(start: string, end: string, testID: string = '',
  patientID: string = '', specimenNo: string = '', status: string ='',
  sheet: string = '', research: string = ''): Observable<IPatient[]> {
  return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listigtcr`,
  { start, end , patientID, specimenNo, status, sheet, research })
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



}
