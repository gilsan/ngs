import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';
import { IImmundefi, IPatient } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { UtilsService } from '../commons/utils.service';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubSink } from 'subsink';
import { geneTitles } from '../commons/geneList';

@Component({
  selector: 'app-form6',
  templateUrl: './form6.component.html',
  styleUrls: ['./form6.component.scss']
})
export class Form6Component implements OnInit, OnDestroy {

  form2TestedId: string;
  immundefi: IImmundefi;
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

  screenstatus: string;
  form: FormGroup;
  private subs = new SubSink();

  technique = `The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.`;

  formTitle: string;
  formGeneLists: string[][10];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private patientsListService: PatientsListService,
    private utilsService: UtilsService,
    private variantsService: DetectedVariantsService,
  ) { }

  ngOnInit(): void {
    this.initLoad();
    this.loadForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadForm(): void {
    this.form = this.fb.group({
      gene: [''],
      functionalImpact: [''],
      transcript: [''],
      exonIntro: [''],
      nucleotideChange: [''],
      aminoAcidChange: [''],
      zygosity: [''],
      dbSNPHGMD: [''],
      gnomADEAS: [''],
      OMIM: [''],
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
    console.log('[115] 환자정보: ', this.patientInfo);
    this.findTitle(this.patientInfo.test_code);
    this.requestDate = this.patientInfo.accept_date;

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);

    this.screenstatus = this.patientInfo.screenstatus;

    this.getimmundefi();
  }

  // test_code로 제목찿기
  findTitle(testCode: string): void {
    let geneLists: string[];
    geneTitles.forEach(item => {
      if (item.gene === testCode) {
        this.formTitle = item.title;
        geneLists = item.lists.split(',');
      }
    });
    this.formGeneLists = this.makeGeneList(geneLists);
    // console.log(this.makeGeneList(geneLists));
  }

  makeGeneList(lists: string[]): any {
    let len: number;
    let count = 0;
    const listgenes = [[]];
    let listgene = [];
    len = lists.length - 1;
    for (let index = 0; index < lists.length; index++) {
      const i = index % 10;
      if (i === 0) {
        listgene[i] = lists[index];
      } else if (i === 1) {
        listgene[i] = lists[index];
      } else if (i === 2) {
        listgene[i] = lists[index];
      } else if (i === 3) {
        listgene[i] = lists[index];
      } else if (i === 4) {
        listgene[i] = lists[index];
      } else if (i === 5) {
        listgene[i] = lists[index];
      } else if (i === 6) {
        listgene[i] = lists[index];
      } else if (i === 7) {
        listgene[i] = lists[index];
      } else if (i === 8) {
        listgene[i] = lists[index];
      } else if (i === 9) {
        listgene[i] = lists[index];
      }

      if (i === 9) {
        listgenes[count] = listgene;
        listgene = [];
        count++;
      } else if (len === index) {
        listgenes[count] = listgene;
      }
    } // End of for loop
    return listgenes;
  }

  getPatientinfo(testid: string): any {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.specimenNo === testid)[0];
    }
    return;
  }

  // 내역 가져오기
  getimmundefi(): void {
    this.subs.sink = this.variantsService.contentScreen6(this.form2TestedId)
      .subscribe(data => {
        if (data.length > 0) {

          this.form.get('gene').setValue(data[0].gene);
          this.form.get('functionalImpact').setValue(data[0].functionalImpact);
          this.form.get('transcript').setValue(data[0].transcript);
          this.form.get('exonIntro').setValue(data[0].exonIntro);
          this.form.get('nucleotideChange').setValue(data[0].nucleotideChange);
          this.form.get('aminoAcidChange').setValue(data[0].aminoAcidChange);
          this.form.get('zygosity').setValue(data[0].zygosity);
          this.form.get('dbSNPHGMD').setValue(data[0].dbSNPHGMD);
          this.form.get('gnomADEAS').setValue(data[0].gnomADEAS);
          this.form.get('OMIM').setValue(data[0].OMIM);
        }
      });
  }




  // 미리보기
  previewToggle(): void {
    this.isVisible = !this.isVisible;
    // lymphoma 값을 store에 저장
    this.immundefi = this.form.getRawValue() as IImmundefi;
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
    this.immundefi = this.form.getRawValue() as IImmundefi;
    const formData: IImmundefi[] = [];
    formData.push(this.immundefi);
    console.log('[186]', this.immundefi);
    this.subs.sink = this.variantsService.saveScreen6(this.form2TestedId, formData, this.patientInfo)
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

    this.immundefi = this.form.getRawValue() as IImmundefi;

    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
    }

    if (this.sendEMR >= 1) {
      this.lastReportDay = this.today().replace(/-/g, '.');
    }







  }








}
