import { Injectable } from '@angular/core';
import { IAFormVariant, IComment, IDList, IExamPart, Ilymphoma, IPatient, IProfile } from '../home/models/patients';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  amlStartDay = '';
  amlEndDay = '';
  amlPatientID = '';
  amlSpecimenID = '';

  detactedVariants: IAFormVariant[];
  specimenMsg: string;
  comments: IComment[]; // 코멘트
  patientInfo: IPatient; // 환자정보
  profile: IProfile; //  { leukemia: '', flt3itd: '', chron: '' };
  vusstatus: boolean;

  specimenNo = 'none';  // 검체번호
  patientID = ''; // 환자 ID

  examiner = 'none';    // 검사자
  rechecker = 'none'; // 확인자

  ExamPart: IExamPart[];

  DLists: IDList[];
  Lymphoma: Ilymphoma;

  screenstatue = 'N';

  status = '';  // 시작, 스크린판독, 판독완료, EMR전송
  sheet = '';    // AML ALL LYN MDS
  whichstate = 'mainscreen'; // mainscreen, searchscreen

  scrolly = 0;
  scrollyLYM = 0;
  scrollyMDS = 0;
  scrollyGEN = 0;
  scrollySEQ = 0;
  scrollyMLPA = 0;

  constructor() { }
  // mainscreen의 검색항목 저장
  // 시작날자, 종료날자, 검체번호, 환자번호
  public setSearchStartDay(day: string): void {
    this.amlStartDay = day;
    // console.log('[AMLALL store][setSearchStartDay]', this.amlStartDay);
  }

  public getSearchStartDay(): string {
    // console.log('[store][getSearchStartDay]', this.amlEndDay);
    return this.amlStartDay;
  }
  public setSearchEndDay(day: string): void {
    this.amlEndDay = day;
    // console.log('[store][setSearchEndDay]', this.amlEndDay);
  }

  public getSearchEndDay(): string {
    // console.log('[store][getSearchEndDay]', this.amlEndDay);
    return this.amlEndDay;
  }

  public setamlPatientID(id: string): void {
    this.amlPatientID = id;
  }

  public getamlPatientID(): string {
    return this.amlPatientID;
  }

  public setamlSpecimenID(id: string): void {
    this.amlSpecimenID = id;
  }

  public getamlSpecimenID(): string {
    return this.amlSpecimenID;
  }
  // 검사자 정보
  public setPatientInfo(patientInfo: IPatient): void {
    this.patientInfo = patientInfo;
  }

  public getPatientInfo(): IPatient {
    return this.patientInfo;
  }

  // 검진 detected Variants
  public setDetactedVariants(detactedVariants: IAFormVariant[]): void {
    // console.log('[54][service][setDetactedVariants]', detactedVariants);
    this.detactedVariants = detactedVariants;
  }

  public getDetactedVariants(): IAFormVariant[] {
    return this.detactedVariants;
  }
  // 검진 검사체 메세지
  public setSpecimenMsg(msg: string): void {
    this.specimenMsg = msg;
  }
  // 검진 검사체 번호
  public getSpecimenMsg(): string {
    return this.specimenMsg;
  }
  // Comments 저장
  public setComments(comments: IComment[]): void {
    this.comments = comments;
  }

  public getComments(): IComment[] {
    return this.comments;
  }

  // Profile  { leukemia: '', flt3itd: '', chron: '' }; 저장
  public setProfile(profile: IProfile): void {
    this.profile = profile;
  }

  public getProfile(): IProfile {
    return this.profile;
  }

  // vusstatus VUS 상태정보
  public setVUSStatus(vusstatus: boolean): void {
    this.vusstatus = vusstatus;
    // console.log('[106][store][setVUSStatus]:', this.vusstatus);
  }

  public getVUSstatus(): boolean {
    return this.vusstatus;
  }

  // 검체번호 저장
  public setSpecimentNo(specimenNo: string): void {
    this.specimenNo = specimenNo;
  }

  public getSpecimenNo(): string {
    return this.specimenNo;
  }

  // 환자 id 저장
  public setPatientID(patientid: string): void {
    this.patientID = patientid;
  }

  public getPatineID(): string {
    return this.patientID;
  }

  // 검사자 정보 저장
  public setExamin(examinerName: string): void {
    this.examiner = examinerName;
  }

  public getExamin(): string {
    return this.examiner;
  }

  // 확인자 정보 저장
  public setRechecker(rechecker: string): void {
    this.rechecker = rechecker;
  }

  public getRechecker(): string {
    return this.rechecker;
  }

  // 검사자 정보 저장
  public setExaminpart(part: string, examin: string): void {
    this.examiner = examin;
  }

  public getExaminpart(): string {
    return this.examiner;
  }

  // 확인자 정보 저장
  public setRecheckerpart(part: string, rechecker: string): void {
    this.rechecker = rechecker;
  }

  public getRecheckerpart(): string {
    return this.rechecker;
  }


  // 검진 부서 리스트
  public setDiagList(lists: IDList[]): void {
    this.DLists = lists;
  }

  public getDiagList(): IDList[] {
    return this.DLists;
  }

  // 리스트 화면
  public setScreenstatus(status: string): void {
    this.screenstatue = status;
  }

  public getScreenstatus(): string {
    return this.screenstatue;
  }

  // status 상태관리  시작, 스크린판독, 판독완료, EMR전송
  setStatus(status: string): void {
    this.status = status;
  }

  getStatus(): string {
    return this.status;
  }

  // 결과지 AML ALL LYN MDS 관리
  setSheet(sheet: string): void {
    this.sheet = sheet;
  }

  getSheet(): string {
    return this.sheet;
  }

  // 조회상태에서 검색인지, 주화면에서 선택했는지 확인
  setWhichstate(state: string): void {
    this.whichstate = state;
  }

  getWhichstate(): string {
    return this.whichstate;
  }

  // scroll 위치 저장
  setScrollyPosition(position: number): void {
    this.scrolly = position;
  }

  getScrollyPosition(): number {
    return this.scrolly;
  }

  // LYM scroll 위치 저장
  setLYMScrollyPosition(position: number): void {
    this.scrollyLYM = position;
  }

  getLYMScrollyPosition(): number {
    return this.scrollyLYM;
  }

  // MDS  scroll 위치 저장
  setMDSScrollyPosition(position: number): void {
    this.scrollyMDS = position;
  }

  getMDSScrollyPosition(): number {
    return this.scrollyMDS;
  }

  // 유전성  scroll 위치 저장
  setGENScrollyPosition(position: number): void {
    this.scrollyGEN = position;
  }

  getGENScrollyPosition(): number {
    return this.scrollyGEN;
  }

  // Sequencing  scroll 위치 저장
  setSEQScrollyPosition(position: number): void {
    this.scrollySEQ = position;
  }

  getSEQScrollyPosition(): number {
    return this.scrollySEQ;
  }

  // MLPA  scroll 위치 저장
  setMLPAScrollyPosition(position: number): void {
    this.scrollyMLPA = position;
  }

  getMLPAScrollyPosition(): number {
    return this.scrollyMLPA;
  }




  // Ilymphoma 값 저장
  setLymphoma(lymphoma: Ilymphoma): void {
    this.Lymphoma = lymphoma;
  }

  getLymphoma(): Ilymphoma {
    return this.Lymphoma;
  }


}
