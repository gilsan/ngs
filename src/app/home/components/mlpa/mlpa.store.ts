import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MlpaStroe {

  start = '';
  end = '';
  specimenNo = '';
  patientId = '';
  status = '';
  sheet = '';
  research = '';

  setStart(start: string): void {
    this.start = start;
  }

  getStart(): string {
    return this.start;
  }

  setEnd(end: string): void {
    this.end = end;
  }

  getEnd(): string {
    return this.end;
  }
  setSpecimenno(specimenNo: string): void {
    this.specimenNo = specimenNo;
  }

  getSpecimenno(): string {
    return this.specimenNo;
  }

  setPatientId(patientId: string): void {
    this.patientId = patientId;
  }

  getPatientId(): string {
    return this.patientId;
  }

  setSheet(sheet: string): void {
    this.sheet = sheet;
  }

  getSheet(): string {
    return this.status;
  }

  setStatus(status: string): void {
    this.status = status;
  }

  getStatus(status: string): string {
    return this.status;
  }

  setResearch(research: string): void {
    this.research = research;
  }

  getResearch(): string {
    return this.research;
  }







}
