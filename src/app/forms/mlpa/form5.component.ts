import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, map, shareReplay, take, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { IPatient } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { MLPATLIST } from '../commons/mlpa.data';
import { UtilsService } from '../commons/utils.service';
import { MlpaService } from 'src/app/services/mlpa.service';
import { mlpaForm } from 'src/app/home/models/mlpa';

export interface IData {
  seq: string;
  site: string;
  result?: string;
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
  screenstatus: string;


  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private utilsService: UtilsService,
    public dialog: MatDialog,
    public mlpaService: MlpaService
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

    this.getMLPAData();

    this.requestDate = this.patientInfo.accept_date;


    // 검체 감염유부 확인
    if (parseInt(this.patientInfo.detected, 10) === 0) {
      this.resultStatus = 'Detected';
    } else if (parseInt(this.patientInfo.detected, 10) === 1) {
      this.resultStatus = 'Not Detected';
    }

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);
    this.screenstatus = this.patientInfo.screenstatus;
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

  }

  // DB에서 MLPA 데이터 가져오기
  getMLPAData(): void {
    const testCode = this.patientInfo.test_code;

    this.mlpaService.getMlpaList(testCode)
      .pipe(
        tap(data => {
          if (data.length > 0) {
            this.mlpaData.title = data[0].title;
            this.mlpaData.result = data[0].result;
            this.mlpaData.comment = data[0].comment;
            this.mlpaData.technique = data[0].technique;
            this.mlpaData.conclusion = data[0].conclusion;
            this.mlpaData.type = testCode;
          }
        }),
        concatMap(() => this.mlpaService.getMlpaData(testCode)),
        tap(data => {
          if (data.length > 0) {
            this.mlpaData.data = data;
          } else {
            this.getTitle(this.testcode);
          }

        })
      )
      .subscribe(data => {
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
      });
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
      this.mlpaData.data[i].site = val;
      this.mlpaData1[i].site = val;
    } else if (side === 'R') {
      this.mlpaData.data[i].site = val;
      this.mlpaData2[i].site = val;
    }
  }

  mlpa1Result(i: number, val: string, side: string): void {
    if (side === 'L') {
      this.mlpaData.data[i].result = val;
      this.mlpaData1[i].result = val;
    } else if (side === 'R') {
      this.mlpaData.data[i].result = val;
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



  conclusion(conclusion: string): void {
    this.mlpaData.conclusion = conclusion;
  }

  comment(comment: string): void { }

  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '.' + newmon + '.' + newday;

    return now;
  }


  tempSave(): void {
    const userid = localStorage.getItem('diaguser');
    const data = [...this.mlpaData1, ...this.mlpaData2];
    // this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
    // this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);
    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
      this.lastReportDay = this.today().replace(/-/g, '.');
    }

    // specimenNo, comment, data, result, technique, title, type
    this.mlpaData.data = data;
    // console.log('[396][저장]', this.mlpaData);
    this.mlpaService.mlpaTempSave(
      this.patientInfo.specimenNo,
      this.mlpaData.comment,
      this.mlpaData.data,
      this.mlpaData.result,
      this.mlpaData.technique,
      this.mlpaData.title,
      this.mlpaData.type
    ).subscribe(result => {
      console.log(result);
      this.patientsListService.resetscreenstatus(this.form2TestedId, '2', userid, 'MLPA').subscribe();
    });
  }

  gotoEMR(): void {
    const userid = localStorage.getItem('diaguser');

    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
    }

    if (this.sendEMR >= 1) {
      this.lastReportDay = this.today().replace(/-/g, '.');
    }

    // console.log('[EMR]', this.target, this.formTitle);
    const makeForm = mlpaForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.method, // 제목,
      this.patientInfo.accept_date, // 검사의뢰일
      this.firstReportDay,
      this.lastReportDay,
      this.patientInfo,
      this.mlpaData
    );

    console.log('[437] ', makeForm);
    const examcode = this.patientInfo.test_code;
    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      examcode,
      makeForm)
      .pipe(
        concatMap(() => this.patientsListService.resetscreenstatus(this.form2TestedId, '3', userid, 'MLPA')),
        concatMap(() => this.patientsListService.setEMRSendCount(this.form2TestedId, ++this.sendEMR)), // EMR 발송횟수 전송
      ).subscribe((msg: { screenstatus: string }) => {
        this.screenstatus = '3';
        alert('EMR로 전송했습니다.');
        // 환자정보 가져오기
        this.patientsListService.getPatientInfo(this.form2TestedId)
          .subscribe(patient => {
            // console.log('[307][Sequencing EMR][검체정보]', this.sendEMR, patient);
            // this.setReportdaymgn(patient);
          });
      });

  }

}

