import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { concatMap, map, shareReplay, take, tap } from 'rxjs/operators';
import { IComment, IGeneList, IImmundefi, IPatient, IProfile } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { UtilsService } from '../commons/utils.service';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { SubSink } from 'subsink';
import { geneTitles } from '../commons/geneList';
import { hereditaryForm } from 'src/app/home/models/hereditary';


@Component({
  selector: 'app-form6',
  templateUrl: './form6.component.html',
  styleUrls: ['./form6.component.scss']
})
export class Form6Component implements OnInit, OnDestroy {

  form2TestedId: string;
  immundefi: IImmundefi[];
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

  checkboxStatus = []; // 체크박스 on 인것

  screenstatus: string;
  mockData: IImmundefi[] = [];
  control: FormArray;
  form: FormGroup;
  private subs = new SubSink();
  target: string;
  resultStatus = 'Detected';
  vusmsg = '';
  comments = '';
  technique = `본 검사는 massively parallel sequencing 방법을 이용하여 연관된 유전자의 모든 coding exon과 인접 intron 부위를 분석하는 검사법입니다.  본 검사실은 2015 ACMG 지침의 분류에 따른  Pathogenic, Likely Pathogenic, Uncertain significance  변이에 대하여 Sanger sequencing으로 확인 후 보고하며 Likely benign, Benign 변이는 보고하지 않습니다(Genet Med. 2015 May;17(5):405-24.). `;
  methods = `Total genomic DNA was extracted from the each sample.  The TruSeq DNA Sample Preparation kit of Illumina was used to make the library. The Agilent SureSelect Target enrichment kit was used for in-solution enrichment of target regions. The enriched fragments were then amplified and sequenced on the HiSeq2000 system (illumina). After demultiplexing, the reads were aligned to the human reference genome hg19 (GRCh37) using BWA (0.7.12). Duplicate reads were removed with Picard MarkDuplicates (1.130), local realignment around indels was performed with GATK RealignerTargetCreator (3.4.0), base scores were recalibrated with GATK BaseRecalibrator (3.4.0), and then variants were called with GATK HaplotypeCaller (3.4.0). Variants were annotated using SnpEff (4.1g).`;

  genelists: IGeneList[] = [];
  formTitle: string;
  formGeneLists: string[][10];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private patientsListService: PatientsListService,
    private utilsService: UtilsService,
    private variantsService: DetectedVariantsService,

  ) {

  }

  ngOnInit(): void {
    this.initLoad();
    this.loadForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadForm(): void {
    this.form = this.fb.group({
      tableRows: this.fb.array([]),
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
    // console.log('[115] 환자정보: ', this.patientInfo);
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
        this.target = item.target;
        // console.log('[135][gene 정보]', item);
      }
    });

    this.getGeneList();
  }

  //  유전자 목록 가져오기
  getGeneList(): void {
    console.log('[115] 환자정보: ', this.patientInfo);
    this.utilsService.getGeneTestCodeList(this.patientInfo.test_code).subscribe(data => {
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

  // 내역 가져오기
  getimmundefi(): void {
    this.subs.sink = this.variantsService.contentScreen6(this.form2TestedId)
      .subscribe(data => {
        console.log('[164][내역 가져오기]', data);
        if (data.length > 0) {

          data.forEach(item => {
            let temp: IImmundefi;
            temp = {
              gene: item.gene,
              functionalImpact: item.functional_impact,
              transcript: item.transcript,
              exonIntro: item.exon,
              nucleotideChange: item.nucleotide_change,
              aminoAcidChange: item.amino_acid_change,
              zygosity: item.zygosity,
              dbSNPHGMD: item.dbSNPHGMD,
              gnomADEAS: item.gnomADEAS,
              OMIM: item.OMIM,
              age: this.patientInfo.age,
              name: this.patientInfo.name,
              patientID: this.patientInfo.patientID,
              gender: this.patientInfo.gender,
            };
            this.addNewRow(temp);

          });
        }
      });
  }

  ////
  createRow(data: IImmundefi): FormGroup {

    return this.fb.group({
      gene: [data.gene],
      functionalImpact: [data.functionalImpact],
      transcript: [data.transcript],
      exonIntro: [data.exonIntro],
      nucleotideChange: [data.nucleotideChange],
      aminoAcidChange: [data.aminoAcidChange],
      zygosity: [data.zygosity],
      dbSNPHGMD: [data.dbSNPHGMD],
      gnomADEAS: [data.gnomADEAS],
      OMIM: [data.OMIM],
      age: [data.age],
      name: [data.name],
      patientID: [data.patientID],
      gender: [data.gender],
    });
  }

  get getFormControls(): any {
    const control = this.form.get('tableRows') as FormArray;
    return control;
  }

  addNewRow(row: IImmundefi): void {
    const control = this.form.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }


  // 미리보기
  previewToggle(): void {
    this.isVisible = !this.isVisible;
    const control = this.form.get('tableRows') as FormArray;
    this.immundefi = control.getRawValue() as IImmundefi[];

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
    const control = this.form.get('tableRows') as FormArray;
    this.immundefi = control.getRawValue() as IImmundefi[];
    // const formData: IImmundefi[] = [];
    // formData.push(this.immundefi);
    console.log('[328]', this.immundefi);
    this.subs.sink = this.variantsService.saveScreen6(this.form2TestedId, this.immundefi, this.patientInfo)
      .subscribe(data => {
        console.log(data);
      });
  }

  reset(): void {
    const control = this.form.get('tableRows') as FormArray;
    const temp = control.getRawValue();
    this.checkboxStatus = [];
    for (let i = 0; i < temp.length; i++) {
      if (String(temp[i].checked) === 'true') {
        this.checkboxStatus.push(i);
      }
    }

    const tempUserid: any = localStorage.getItem('diaguser');
    const tempuser: any = JSON.parse(tempUserid);
    const userid = tempuser.userid;

    this.patientsListService.resetscreenstatus(this.form2TestedId, '2', userid, this.reportType)
      .subscribe(data => {
        this.screenstatus = '2';
        this.patientInfo.screenstatus = '2';

      });
  }



  // 스크린 판독
  screenRead(): void {
    const userid = localStorage.getItem('diaguser');
    const control = this.form.get('tableRows') as FormArray;
    this.immundefi = control.getRawValue() as IImmundefi[];

    const result = confirm('스크린 판독 전송하시겠습니까?');
    if (result) {
      const profile: IProfile = { chron: '', };
      const comments: IComment[] = [];
      this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
      this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);

      this.patientInfo.vusmsg = this.vusmsg;

      this.subs.sink = this.variantsService.saveScreen6(this.form2TestedId, this.immundefi, this.patientInfo)
        .pipe(
          tap(data => {
            alert('저장되었습니다.');
          }),
          concatMap(() => this.patientsListService.resetscreenstatus(this.form2TestedId, '1', userid, 'HRDT')),
        )
        .subscribe(msg => {
          this.screenstatus = '1';
        });

    }

  }


  screenReadFinish(): void {
    const userid = localStorage.getItem('diaguser');
    const control = this.form.get('tableRows') as FormArray;
    this.immundefi = control.getRawValue() as IImmundefi[];

    const result = confirm('판독완료 전송하시겠습니까?');
    if (result) {
      const profile: IProfile = { chron: '', };
      const comments: IComment[] = [];
      this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
      this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);

      this.patientInfo.vusmsg = this.vusmsg;

      this.subs.sink = this.variantsService.saveScreen6(this.form2TestedId, this.immundefi, this.patientInfo)
        .pipe(
          tap(data => {
            alert('저장되었습니다.');
          }),
          concatMap(() => this.patientsListService.resetscreenstatus(this.form2TestedId, '3', userid, 'HRDT')),
        )
        .subscribe(msg => {
          this.screenstatus = '3';
        });

    }

  }

  getStatus(index): boolean {
    // console.log('[834][getStatus]', index, this.screenstatus);
    if (index === 1) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }

    } else if (index === 2) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    } else if (index === 3) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    } else if (index === 4) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return false;
      }
    }

  }



  gotoEMR(): void {
    const userid = localStorage.getItem('diaguser');
    const control = this.form.get('tableRows') as FormArray;
    this.immundefi = control.getRawValue() as IImmundefi[];
    console.log(this.immundefi);

    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
    }

    if (this.sendEMR >= 1) {
      this.lastReportDay = this.today().replace(/-/g, '.');
    }

    console.log('[EMR]', this.target, this.formTitle);
    const makeForm = hereditaryForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.target,
      this.vusmsg,
      this.formTitle, // 제목,
      this.patientInfo.accept_date, // 검사의뢰일
      this.firstReportDay,
      this.lastReportDay,
      this.patientInfo,
      this.immundefi,
      this.comments,
      this.methods,
      this.technique,
      this.genelists
    );

    console.log('[335] ', makeForm);

    const examcode = this.patientInfo.test_code;
    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      examcode,
      makeForm)
      .pipe(
        concatMap(() => this.patientsListService.resetscreenstatus(this.form2TestedId, '3', userid, 'HRDT')),
        concatMap(() => this.patientsListService.setEMRSendCount(this.form2TestedId, ++this.sendEMR)), // EMR 발송횟수 전송
        concatMap(() => this.patientsListService.getScreenStatus(this.form2TestedId))
      ).subscribe((msg: { screenstatus: string }) => {
        this.screenstatus = '3';
        alert('EMR로 전송했습니다.');
        // 환자정보 가져오기
        this.patientsListService.getPatientInfo(this.form2TestedId)
          .subscribe(patient => {
            console.log('[515][유전성유전][검체정보]', this.sendEMR, patient);
            // this.setReportdaymgn(patient);
          });
      });


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
