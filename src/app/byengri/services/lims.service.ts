import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { emrUrl } from 'src/app/config';
import { ILIMS } from '../models/lims.model';
import { shareReplay } from 'rxjs/operators';

import * as FileSaver from 'file-saver';
import * as XLSX from 'sheetjs-style';
// import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Injectable({
  providedIn: 'root'
})
export class LimsService {

  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient
  ) { }

  search(start: string, end: string): Observable<ILIMS[]> {
    return this.http.post<ILIMS[]>(`${this.apiUrl}/lims/lists`, { start, end })
      .pipe(
        // shareReplay()
      );
  }

  testSearch(start: string, examin: string, recheck: string): Observable<ILIMS[]> {
    return this.http.post<ILIMS[]>(`${this.apiUrl}/lims/limslists`, { start, examin, recheck })
      .pipe(
        shareReplay()
      );
  }

  save(lims: ILIMS[], examin: string, recheck: string): Observable<any> {
    // return of({ message: 'SUCCESS' });
    return this.http.post(`${this.apiUrl}/lims/save`, { lims, examin, recheck });
  }

  public exportAsExcelFile(jsonData: any[], excelFileName: string, width: any[]): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData, { skipHeader: true });
    worksheet['!cols'] = width;
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  // tslint:disable-next-line:variable-name
  public updateTumoretype(test_code: string, tumor_type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/lims/tumorTypeSave`, { test_code, tumor_type });
  }

  // tslint:disable-next-line:variable-name
  public updateTumorcellper(test_code: string, tumor_cell_per: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/lims/tmorCellSave`, { test_code, tumor_cell_per });
  }







}
