import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { filter, map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { SubSink } from 'subsink';

import { METHODS, METHODS516 } from 'src/app/home/models/bTypemodel';
import { UtilsService } from '../commons/utils.service';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { StoreService } from '../store.current';
import { AnalysisService } from '../commons/analysis.service';
import { IGeneList, Ilymphoma, IPatient, IProfile } from 'src/app/home/models/patients';
import { MutationService } from 'src/app/services/mutation.service';

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
  lymphoma: Ilymphoma;
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
    private mutationService: MutationService,
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
      exonIntron: [''],
      nucleotideChange: [''],
      aminoAcidChange: [''],
      zygosity: [''],
      vaf: [''],
      reference: [''],
      cosmicId: ['']
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

  //
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
    // console.log('[159][환자정보]', this.patientInfo);
    this.store.setPatientInfo(this.patientInfo); // 환자정보 저장

    this.requestDate = this.patientInfo.accept_date;
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
    } else if (this.patientInfo.specimen === '004') {
      this.specimenMsg = 'EDTA blood';
      this.specimenMessage = 'Genomic DNA isolated from EDTA blood';
      this.store.setSpecimenMsg(this.specimenMsg);
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
    this.lymphoma = this.form.getRawValue() as Ilymphoma;
    // this.store.setLymphoma(lymphoma);
  }

  //  bone marrow/chronmosomal 가져오기
  getProfile(): void {
    this.analysisService.getAanlysisLYMInfo(this.form2TestedId)
      .subscribe(data => {
        //  console.log('[182][profile] ', data);
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
  // InHouse 에 mutation 저장된것 가져오기
  getClinical(): void {
    this.subs.sink = this.mutationService.getLymphoma(this.patientInfo.patientID)
      .subscribe(data => {
        // console.log('[225] ==> ', data);
        this.form.get('gene').setValue(data.gene);
        this.form.get('functionalImpact').setValue(data.functionalImpact);
        this.form.get('transcript').setValue(data.transcript);
        this.form.get('exonIntron').setValue(data.exonIntro);
        this.form.get('nucleotideChange').setValue(data.nucleotideChange);
        this.form.get('aminoAcidChange').setValue(data.aminoAcidChange);
        this.form.get('zygosity').setValue(data.zygosity);
        this.form.get('vaf').setValue(data.vaf);
        this.form.get('reference').setValue(data.reference);
        this.form.get('cosmicId').setValue(data.cosmicId);
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
    // console.log('[187][검사일/검사보고일/수정보고일 관리]', patientInfo);
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

















}

