import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { emrUrl } from 'src/app/config';
import { IExcelData } from '../models/patients';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelAddListService {


  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }


  public excelTest(excelData: IExcelData[]): Observable<any> {
    console.log('ExcelData:', excelData);
    return of();
  }

  public excelInsert(excelData: IExcelData[], specimentNo: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/excelDV/insert`, { data: excelData, specimentNo });
  }


  public excelList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/excelDV/list`);
  }

  public patientExcelList(start: string, end: string, type: string): Observable<IExcelData[]> {
    return this.http.post<IExcelData[]>(`${this.apiUrl}/excelDv/lists`, { start, end, type, gubun: 'diag' });
  }




}
