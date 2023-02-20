import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';

import { emrUrl } from 'src/app/config';
import {   Observable  } from 'rxjs';
import { IIGTCR } from '../inhouse/patientexcel/excel.model';

 
@Injectable({
  providedIn: 'root'
})
export class  IgTcrService {

  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient,
  ) { }


/***
 *
http://183.98.12.201:3000/igtcr/list post
parameter
{
    "specimenNo": "M20-999"
}

  */

  public igtcrListInfo(specimenNo: string): Observable<IIGTCR[]> {

    return this.http.post<IIGTCR[]>(`${this.apiUrl}/igtcr/list`, {specimenNo})

  }
}