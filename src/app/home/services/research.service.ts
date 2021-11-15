import { Injectable } from '@angular/core';

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
  list: IDATA = { name: '', age: '', gender: '', type: '', patientid: '' };

  setData(name: string, age: string, gender: string, type: string, patientid: string): void {
    console.log('[setData]', name, age, gender, type, patientid);
    this.list.name = name;
    this.list.age = age;
    this.list.gender = gender;
    this.list.type = type;
    this.list.patientid = patientid;

  }

  getData(): IDATA {
    return this.list;
  }



}
