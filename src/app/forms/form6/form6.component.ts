import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';
import { IImmundefi, IPatient } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { UtilsService } from '../commons/utils.service';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { SubSink } from 'subsink';
import { geneTitles } from '../commons/geneList';

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

  screenstatus: string;
  mockData: IImmundefi[] = [];
  control: FormArray;
  form: FormGroup;
  private subs = new SubSink();

  technique = `본 검사는 massively parallel sequencing 방법을 이용하여 연관된 유전자의 모든 coding exon과 인접 intron 부위를 분석하는 검사법입니다.  본 검사실은 2015 ACMG 지침의 분류에 따른  Pathogenic, Likely Pathogenic, Uncertain significance  변이에 대하여 Sanger sequencing으로 확인 후 보고하며 Likely benign, Benign 변이는 보고하지 않습니다(Genet Med. 2015 May;17(5):405-24.). `;
  methods = `Total genomic DNA was extracted from the each sample.  The TruSeq DNA Sample Preparation kit of Illumina was used to make the library. The Agilent SureSelect Target enrichment kit was used for in-solution enrichment of target regions. The enriched fragments were then amplified and sequenced on the HiSeq2000 system (illumina). After demultiplexing, the reads were aligned to the human reference genome hg19 (GRCh37) using BWA (0.7.12). Duplicate reads were removed with Picard MarkDuplicates (1.130), local realignment around indels was performed with GATK RealignerTargetCreator (3.4.0), base scores were recalibrated with GATK BaseRecalibrator (3.4.0), and then variants were called with GATK HaplotypeCaller (3.4.0). Variants were annotated using SnpEff (4.1g).`;


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
        console.log('[192][조회]', data);
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
    const control = this.form.get('tableRows') as FormArray;
    this.immundefi = control.getRawValue() as IImmundefi[];
    // this.immundefi = this.form.getRawValue() as IImmundefi;

    // if (this.firstReportDay === '-') {
    //   this.firstReportDay = this.today().replace(/-/g, '.');
    // }

    // if (this.sendEMR >= 1) {
    //   this.lastReportDay = this.today().replace(/-/g, '.');
    // }

  }








}
