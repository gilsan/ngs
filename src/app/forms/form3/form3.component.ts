import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { concatMap, filter, map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { SubSink } from 'subsink';

import { METHODS, METHODS516 } from 'src/app/home/models/bTypemodel';
import { UtilsService } from '../commons/utils.service';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { StoreService } from '../store.current';
import { AnalysisService } from '../commons/analysis.service';
import { IAFormVariant, IGeneList, IPatient, IProfile } from 'src/app/home/models/patients';

import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { makeCForm } from 'src/app/home/models/cTypemodel';

/**  profile
 *  ALL/AML   LYM           MDS
 * leukemia                 diagnosis
 * flt3itd    bonemarrow    genetictest
 * chron      chron         chron
 */

@Component({
  selector: 'app-form3',
  templateUrl: './form3.component.html',
  styleUrls: ['./form3.component.scss']
})
export class Form3Component implements OnInit, OnDestroy {

  @ViewChild('examine', { static: true }) examine: ElementRef;
  @ViewChild('rechecked', { static: true }) rechecked: ElementRef;


  form2TestedId: string;
  profile: IProfile = { leukemia: '', flt3itd: '', chron: '' };
  methods = METHODS;
  methods516 = METHODS516;
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
  lymphoma: IAFormVariant;
  examin = ''; // 검사자
  recheck = ''; // 확인자
  requestDate: string; // 검사의뢰일
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일
  reportType: string; //

  screenstatus: string;
  specimenMsg: string;
  specimenMessage = 'Genomic DNA isolated from peripheral blood';
  resultStatus = 'Detected';

  genelists: IGeneList[] = [];
  tsvVersion = '510'; // v5.16 버전확인

  technique = `The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.`;

  form: FormGroup;
  private subs = new SubSink();

  constructor(
    private patientsListService: PatientsListService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private store: StoreService,
    private utilsService: UtilsService,
    private analysisService: AnalysisService,
    private variantsService: DetectedVariantsService,
  ) { }

  ngOnInit(): void {
    this.findType();
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
      vafPercent: [''],
      references: [''],
      cosmicID: ['']
    });
  }


  findType(): void {
    this.route.paramMap.pipe(
      filter(data => data !== null || data !== undefined),
      map(route => route.get('type'))
    ).subscribe(data => {
      this.reportType = data;
      this.getGeneList('LYM'); // 진검 유전자 목록 가져옴.
    });
  }


  result(event): void {
    this.resultStatus = event.srcElement.defaultValue;
  }

  // 검체 체크상태 변경
  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
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
    console.log('[167] 환자정보: ', this.patientInfo);

    this.requestDate = this.patientInfo.accept_date;
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
    } else if (this.patientInfo.specimen === '004') {
      this.specimenMsg = 'EDTA blood';
      this.specimenMessage = 'Genomic DNA isolated from EDTA blood';
    }

    // 검체 감염유부 확인
    if (parseInt(this.patientInfo.detected, 10) === 0) {
      this.resultStatus = 'Detected';
    } else if (parseInt(this.patientInfo.detected, 10) === 1) {
      this.resultStatus = 'Not Detected';
    }

    // bone marrow/chronmosomal 가져오기
    this.getProfile();

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);

    this.screenstatus = this.patientInfo.screenstatus;
    // specimen 015 인경우 Bon marrow
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
      this.store.setSpecimenMsg(this.specimenMsg);
    }
    this.getClinical();
  }

  // 미리보기
  previewToggle(): void {
    this.isVisible = !this.isVisible;
    // lymphoma 값을 store에 저장
    this.lymphoma = this.form.getRawValue() as IAFormVariant;
  }

  // 미리보기 종료
  closeModal(): void {
    this.isVisible = !this.isVisible;
  }

  //  bone marrow/chronmosomal 가져오기
  getProfile(): void {
    this.analysisService.getAanlysisLYMInfo(this.form2TestedId)
      .subscribe(data => {
        if (data.length > 0) {
          this.profile.leukemia = '';
          this.profile.flt3itd = data[0].bonemarrow;
          this.profile.chron = data[0].chromosomalanalysis;
        } else {
          this.profile.leukemia = '';
          this.profile.chron = '';
          this.profile.flt3itd = '';
        }
        this.store.setProfile(this.profile); // profile 저장
      });
  }


  // Variants of unknown clinical significance 정보 가져오기
  getClinical(): void {

    // 디비에서 Detected variant_id   가져오기
    this.subs.sink = this.variantsService.screenSelect(this.form2TestedId).subscribe(data => {
      if (data.length > 0) {

        this.form.get('gene').setValue(data[0].gene);
        this.form.get('functionalImpact').setValue(data[0].functional_impact);
        this.form.get('transcript').setValue(data[0].transcript);
        this.form.get('exonIntro').setValue(data[0].exon);
        this.form.get('nucleotideChange').setValue(data[0].nucleotide_change);
        this.form.get('aminoAcidChange').setValue(data[0].amino_acid_change);
        this.form.get('zygosity').setValue(data[0].zygosity);
        this.form.get('vafPercent').setValue(data[0].vaf);
        this.form.get('references').setValue(data[0].reference);
        this.form.get('cosmicID').setValue(data[0].cosmic_id);
      }
    });

  }

  //  유전자 목록 가져오기
  getGeneList(type: string): any {
    this.utilsService.getGeneList('LYM').subscribe(data => {
      this.genelists = data;
    });
  }


  getPatientinfo(testid: string): any {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.specimenNo === testid)[0];
    }
    return;
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

    this.patientInfo.detected = this.resultStatus;
    this.lymphoma = this.form.getRawValue() as IAFormVariant;
    const formData: IAFormVariant[] = [];
    formData.push(this.lymphoma);
    this.patientInfo.recheck = this.recheck;
    this.patientInfo.examin = this.examin;

    this.analysisService.putAnalysisLYM(
      this.form2TestedId,
      this.profile.flt3itd,
      this.profile.chron).subscribe(data => console.log('LYM INSERT'));

    // tslint:disable-next-line:max-line-length
    this.subs.sink = this.variantsService.screenTempSave(this.form2TestedId, formData, [], this.profile, this.resultStatus, this.patientInfo)
      .subscribe(data => {
        alert('저장되었습니다.');
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
    const userid = localStorage.getItem('diaguser');
    this.lymphoma = this.form.getRawValue() as IAFormVariant;

    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
    }

    if (this.sendEMR >= 1) {
      this.lastReportDay = this.today().replace(/-/g, '.');
    }


    let tsvVersionContents;
    tsvVersionContents = this.methods;

    // console.log('[944][LYM EMR][comments] ', this.comments);
    const formData: IAFormVariant[] = [];
    formData.push(this.lymphoma);

    const makeForm = makeCForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.profile,
      this.patientInfo.accept_date, // 검사의뢰일
      this.specimenMessage,
      this.patientInfo,
      formData,
      this.firstReportDay,
      this.lastReportDay,
      this.genelists,
      tsvVersionContents
    );
    console.log('[1150][LYM XML] ', makeForm);

    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      makeForm)
      .pipe(
        concatMap(() => this.patientsListService.setEMRSendCount(this.form2TestedId, ++this.sendEMR)), // EMR 발송횟수 전송
      ).subscribe((msg: { screenstatus: string }) => {
        alert('EMR로 전송했습니다.');
        this.patientsListService.getPatientInfo(this.form2TestedId)
          .subscribe(patient => {
            console.log('[421][ALL EMR][검체정보]', this.sendEMR, patient);
          });
      });


  }











}

