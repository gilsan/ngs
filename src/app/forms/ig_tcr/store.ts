import { Injectable } from '@angular/core';
import { ISearch } from './igtcr.model';
 

@Injectable({
  providedIn: 'root'
})
export class IGTStoreService {
  start = '';
  end = '';
  specimenNo = '';
  patientid = '';
  patientname = '';
  status = '';
  sheet = '';
  research1 ='';
  isearch: ISearch[] = [];

  mainListSearchSet(start: string, end: string, specimenNo: string='', patientid: string='', patientname: string = '',
  status: string = '', sheet: string = '', research1: string = '') {
    const receivedData = {
        start,
        end,
        specimenNo,
        patientid,
        patientname,
        status,
        sheet,
        research1
       }
       this.isearch[0]= receivedData;

  }

  mainListSearchGet(): ISearch[] {

    return this.isearch;
  }



}