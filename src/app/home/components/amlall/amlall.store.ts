import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class AmlAllStore {

  testedID = ''; // 검체번호
  patient = '';  // 환자ID
  status = '';   // 상태
  sheet = '';  // AML ALL
  research = ''; // 연구용
  start = '';
  end = '';

  getTestedID(): string {
    console.log('[STORE][TestedID]', this.testedID);
    return this.testedID;
  }

  setTestedID(testedID: string): void {
    this.testedID = testedID;
  }

  getPatient(): string {
    console.log('[STORE][Patient]', this.patient);
    return this.patient;
  }

  setPatient(patient: string): void {
    this.patient = patient;
  }

  getStatus(): string {
    console.log('[STORE][Status]', this.status);
    return this.status;
  }

  setStatus(status): void {
    this.status = status;
  }

  getSheet(): string {
    console.log('[STORE][Sheet]', this.sheet);
    return this.sheet;
  }

  setSheet(sheet: string): void {
    this.sheet = sheet;
  }

  getResearch(): string {
    console.log('[STORE][Research]', this.research);
    return this.research;
  }

  setResearch(research: string): void {
    this.research = research;
  }

  getStart(): string {
    console.log('[STORE][Start]', this.start);
    return this.start;
  }

  setStart(start: string): void {
    this.start = start;
  }

  getEnd(): string {
    console.log('[STORE][End]', this.end);
    return this.end;
  }

  setEnd(end: string): void {
    this.end = end;
  }


}
