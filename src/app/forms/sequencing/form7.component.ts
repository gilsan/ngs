import { Component, OnInit, OnDestroy } from '@angular/core';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { UtilsService } from '../commons/utils.service';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IPatient, ISequence } from 'src/app/home/models/patients';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';
import { FindNgsTitleService } from '../commons/findngstitle.service';
import { sequencingForm } from 'src/app/home/models/sequencing.model';


@Component({
  selector: 'app-form7',
  templateUrl: './form7.component.html',
  styleUrls: ['./form7.component.scss']
})
export class Form7Component implements OnInit, OnDestroy {

  form2TestedId: string;
  sequence: ISequence;
  sendEMR = 0; // EMR 보낸 수

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

  isVisible = false;
  examin = ''; // 검사자
  recheck = ''; // 확인자
  requestDate: string; // 검사의뢰일
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일
  reportType: string; //

  resultStatus = 'Detected';

  screenstatus: string;
  form: FormGroup;
  ngsTitle: string;

  private subs = new SubSink();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private patientsListService: PatientsListService,
    private utilsService: UtilsService,
    private variantsService: DetectedVariantsService,
    private titleService: FindNgsTitleService,
  ) { }

  ngOnInit(): void {
    this.initLoad();
    this.loadForm();
    this.getSequencing();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadForm(): void {
    this.form = this.fb.group({
      type: [''],
      workNow: [''],
      diagnosis: [''],
      location: [''],
      nucleotideChange: [''],
      aminoAcidChange: [''],
      dbSNP: [''],
      cosmicID: ['']
    });
  }


  initLoad(): void {
    // 검진부서원 리스트 스토어에서 가져옴.
    this.form2TestedId = this.patientsListService.getTestedID();
    // 검사자 정보 가져오기
    if (this.form2TestedId === null || this.form2TestedId === undefined) {
      this.router.navigate(['/diag']);
      return;
    }

    this.patientInfo = this.getPatientinfo(this.form2TestedId);
    console.log('[85] 환자정보: ', this.patientInfo);

    // 검체 감염유부 확인
    if (parseInt(this.patientInfo.detected, 10) === 0) {
      this.resultStatus = 'Detected';
    } else if (parseInt(this.patientInfo.detected, 10) === 1) {
      this.resultStatus = 'Not Detected';
    }


    this.requestDate = this.patientInfo.accept_date;

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);

    this.screenstatus = this.patientInfo.screenstatus;

  }

  getPatientinfo(testid: string): any {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.specimenNo === testid)[0];
    }
    return;
  }

  // 내역 가져오기
  getSequencing(): void {
    this.ngsTitle = this.titleService.findSequencingTitle(this.patientInfo.test_code);
    this.subs.sink = this.variantsService.contentScreen7(this.form2TestedId)
      .subscribe(data => {
        console.log('[144]', data[0]);
        if (data.length > 0) {
          this.form.get('type').setValue(data[0].type);
          this.form.get('workNow').setValue(data[0].workNow);
          this.form.get('diagnosis').setValue(data[0].diagnosis);
          this.form.get('location').setValue(data[0].location);
          this.form.get('nucleotideChange').setValue(data[0].nucleotideChange);
          this.form.get('aminoAcidChange').setValue(data[0].aminoAcidChange);
          this.form.get('dbSNP').setValue(data[0].dbSNP);
          this.form.get('cosmicID').setValue(data[0].cosmicID);
        }
      });
  }

  // 미리보기
  previewToggle(): void {
    this.isVisible = !this.isVisible;
    this.sequence = this.form.getRawValue() as ISequence;
  }

  // 미리보기 종료
  closeModal(): void {
    this.isVisible = !this.isVisible;
  }

  // 검사일/검사보고일/수정보고일 관리
  setReportdaymgn(patientInfo: IPatient): void {
    // 전송횟수, 검사보고일, 수정보고일  저장
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

  tempSave(): void {
    this.sequence = this.form.getRawValue() as ISequence;
    const formData: ISequence[] = [];
    formData.push(this.sequence);
    console.log('[226]', this.sequence);
    this.subs.sink = this.variantsService.saveScreen7(this.form2TestedId, formData, this.patientInfo)
      .subscribe(data => {
        console.log(data);
      });
  }

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

  gotoEMR(): void {
    // const control = this.form.get('tableRows');
    // this.immundefi = control.getRawValue();


    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
    }

    if (this.sendEMR >= 1) {
      this.lastReportDay = this.today().replace(/-/g, '.');
    }

    // console.log('[EMR]', this.target, this.formTitle);
    const makeForm = sequencingForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.ngsTitle, // 제목,
      this.patientInfo.accept_date, // 검사의뢰일
      this.firstReportDay,
      this.lastReportDay,
      this.patientInfo,
      // this.immundefi,
      // this.comments,
      // this.methods,
      // this.technique,
      // this.genelists
    );

    console.log('[335] ', makeForm);


  }

  // tslint:disable-next-line:typedef
  result(event) {
    console.log(event);
    this.resultStatus = event.srcElement.defaultValue;
    // console.log('[556][라디오 검체]', this.resultStatus);
  }


  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }





}
