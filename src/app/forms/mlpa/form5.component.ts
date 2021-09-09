import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { IPatient } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { MLPATLIST } from '../commons/mlpa.data';
import { UtilsService } from '../commons/utils.service';

export interface IData {
  idx: string;
  site: string;
  result?: string;
  deletion?: string;
  methylation?: string;
}
export interface IMlpa {
  type: string;
  title: string;
  data: IData[];
  result: string;
  conclusion: string;
  technique: string;
  comment?: string;
}


@Component({
  selector: 'app-form5',
  templateUrl: './form5.component.html',
  styleUrls: ['./form5.component.scss']
})
export class Form5Component implements OnInit, OnDestroy, AfterViewInit {

  mlpaData: IMlpa = {
    type: '',
    title: '',
    data: [],
    result: '',
    conclusion: '',
    technique: '',
    comment: '',
  };
  mlpaLists: IMlpa[] = [];
  mlpaData1: IData[] = [];
  mlpaData2: IData[] = [];
  requestDate: string; // 검사의뢰일
  form2TestedId: string;
  patientInfo: IPatient = {
    name: '',
    patientID: '',
    age: '',
    gender: '',
    testedNum: '',
    leukemiaAssociatedFusion: '',
    leukemiaassociatedfusion: '',
    IKZK1Deletion: '',
    FLT3ITD: '',
    bonemarrow: '',
    diagnosis: '',
    genetictest: '',
    chromosomalAnalysis: '',
    chromosomalanalysis: '',
    targetDisease: '',
    method: '',
    accept_date: '',
    specimen: '',
    detected: '',
    request: '',
    tsvFilteredFilename: '',
    path: '',
    tsvFilteredStatus: '',
    bamFilename: '',
    sendEMRDate: '',
    report_date: '',
    specimenNo: '',
    test_code: '',
    screenstatus: '',
    recheck: '',
    examin: '',
  };

  method: string;
  testcode: string;
  resultStatus = 'Detected';
  showtable3 = true;
  showtable4 = false;
  type: string;

  examin = ''; // 검사자
  recheck = ''; // 확인자
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일
  reportType: string; //
  sendEMR = 0; // EMR 보낸 수

  isVisible = false;

  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private utilsService: UtilsService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.initLoad();

  }

  ngOnDestroy(): void { }

  ngAfterViewInit(): void { }

  initLoad(): void {
    this.form2TestedId = this.patientsListService.getTestedID();

    // 검사자 정보 가져오기
    if (this.form2TestedId === null || this.form2TestedId === undefined) {
      this.router.navigate(['/diag']);
      return;
    }

    this.patientInfo = this.getPatientinfo(this.form2TestedId);
    console.log('[76][환자정보]', this.patientInfo);
    this.testcode = this.patientInfo.test_code;
    this.getTitle(this.testcode);
    // this.showTable(this.testcode);
    // this.method = this.patientInfo.method.replace(/"/g, '');

    this.requestDate = this.patientInfo.accept_date;


    // 검체 감염유부 확인
    if (parseInt(this.patientInfo.detected, 10) === 0) {
      this.resultStatus = 'Detected';
    } else if (parseInt(this.patientInfo.detected, 10) === 1) {
      this.resultStatus = 'Not Detected';
    }

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);
  }

  // test code 로 제목 찿기
  getTitle(testcode: string): void {
    MLPATLIST.forEach((item) => {
      this.mlpaLists.push(item as IMlpa);
    });

    const index = this.mlpaLists.findIndex(item => item.type === testcode);
    this.mlpaData = this.mlpaLists[index];
    const len = this.mlpaData.data.length; // 데이터 길이
    const firstHalf = Math.floor(this.mlpaData.data.length / 2);
    this.method = this.mlpaData.title;
    // MLPA 데이터 2개로 나누기
    for (let i = 0; i < firstHalf; i++) {
      this.mlpaData1.push(this.mlpaData.data[i] as IData);
    }

    for (let i = firstHalf; i < len; i++) {
      this.mlpaData2.push(this.mlpaData.data[i] as IData);
    }

    // console.log(this.mlpaData1);
    // console.log(this.mlpaData2);
  }

  // 검사자 정보 가져오기
  // tslint:disable-next-line: typedef
  getPatientinfo(testid: string) {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.specimenNo === testid)[0];
    }
    return;
  }

  // 검사일/검사보고일/수정보고일 관리
  setReportdaymgn(patientInfo: IPatient): void {
    // 전송횟수, 검사보고일, 수정보고일  저장
    // console.log('[487][검사일/검사보고일/수정보고일 관리]', patientInfo);
    this.sendEMR = Number(patientInfo.sendEMR);
    if (patientInfo.sendEMRDate.length) {
      this.firstReportDay = patientInfo.sendEMRDate.replace(/-/g, '.').slice(0, 10);
    }
    if (this.sendEMR > 1) {
      this.lastReportDay = patientInfo.report_date.replace(/-/g, '.').slice(0, 10);
    } else if (this.sendEMR === 0) {
      this.firstReportDay = '-';
    }

    // 판독자 , 검사자
    if (patientInfo.examin.length) {
      this.examin = patientInfo.examin;
    }

    if (patientInfo.recheck.length) {
      this.recheck = patientInfo.recheck;
    }
    if (patientInfo.examin.length === 0 && patientInfo.recheck.length === 0) {

      const lists$ = this.utilsService.getDiagList()
        .pipe(shareReplay());

      lists$.pipe(
        map(lists => lists.filter(list => list.part === 'D'))
      ).subscribe(data => {
        const len = data.length - 1;
        data.forEach((list, index) => {
          if (index === len) {
            this.recheck = this.recheck + list.user_nm + ' M.D.';
          } else {
            this.recheck = this.recheck + list.user_nm + ' M.D./';
          }
        });
      });

      lists$.pipe(
        map(lists => lists.filter(list => list.part === 'T'))
      ).subscribe(data => {
        const len = data.length - 1;
        data.forEach((list, index) => {
          if (index === len) {
            this.examin = this.examin + list.user_nm + ' M.T.';
          } else {
            this.examin = this.examin + list.user_nm + ' M.T./';
          }
        });
      });
    }

  }


  // tslint:disable-next-line:typedef
  result(event) {
    console.log(event);
    this.resultStatus = event.srcElement.defaultValue;
  }


  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }

  showTable(type: string): void {
    if (this.testcode === 'LPE294') {
      this.showtable3 = false;
      this.showtable4 = true;
      this.type = 'type4';
    } else {
      this.showtable3 = true;
      this.showtable4 = false;
      this.type = 'type3';
    }

  }

  previewToggle(): void {
    this.isVisible = !this.isVisible;
  }

  // 미리보기 종료
  closeModal(): void {
    this.isVisible = !this.isVisible;
  }


  mlpa1Site(i: number, val: string, side: string): void {
    if (side === 'L') {
      this.mlpaData1[0].site = val;
    } else if (side === 'R') {
      this.mlpaData2[0].site = val;
    }
  }

  mlpa1Result(i: number, val: string, side: string): void {
    if (side === 'L') {
      this.mlpaData1[i].result = val;
    } else if (side === 'R') {
      this.mlpaData2[i].result = val;
    }
  }

  mlpa2Site(i: number, val: string, side: string): void {
    if (side === 'L') {
      this.mlpaData1[i].site = val;
    } else if (side === 'R') {
      this.mlpaData2[i].site = val;
    }
  }

  mlpa2Deletion(i: number, val: string, side: string): void {
    if (side === 'L') {
      this.mlpaData1[i].deletion = val;
    } else if (side === 'R') {
      this.mlpaData2[i].deletion = val;
    }
  }

  mlpa2Methylation(i: number, val: string, side: string): void {
    if (side === 'L') {
      this.mlpaData1[i].methylation = val;
    } else if (side === 'R') {
      this.mlpaData2[i].methylation = val;
    }
  }

  conclusion(conclusion: string): void {
    this.mlpaData.conclusion = conclusion;
  }

  comment(comment: string): void { }

  save(): void {
    const data = [...this.mlpaData1, ...this.mlpaData2];
    this.mlpaData.data = data;
    console.log(this.mlpaData);
  }

}

