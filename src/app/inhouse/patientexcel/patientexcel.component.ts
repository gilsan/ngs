import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { IExcelData, IPatient } from 'src/app/home/models/patients';
import { ExcelAddListService } from 'src/app/home/services/excelAddList';
import { ExcelService } from 'src/app/services/excel.service';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';

import { catchError, concatMap, filter, map, switchMap, tap } from 'rxjs/operators';
import { from, throwError } from 'rxjs';
import { IAMLALL, IGenetic, ILYM, IMDS, ISEQ } from './excel.model';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';

export interface ITYPE {
  type: string;
  code: string;
}

@Component({
  selector: 'app-patientexcel',
  templateUrl: './patientexcel.component.html',
  styleUrls: ['./patientexcel.component.scss']
})
export class PatientexcelComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  size = 0;
  count = 1;

  patientInfo: IPatient[] = [];
  types: ITYPE[] = [];

  amlall: IAMLALL[] = [];
  lym: ILYM[] = [];
  mds: IMDS[] = [];
  genetic: IGenetic[] = [];
  seq: ISEQ[] = [];
  processing = false;


  constructor(
    private excelService: ExcelAddListService,
    private snackBar: MatSnackBar,
    private excel: ExcelService,
    private patientsList: PatientsListService,
    private codeDefaultValueService: CodeDefaultValue,
    private variantsService: DetectedVariantsService
  ) { }

  ngOnInit(): void {


    this.codeDefaultValueService.getLists()
      .pipe(
        // tap(data => console.log(data)),
        switchMap(data => from(data))
      )
      .subscribe(data => {
        this.types.push({ type: data.type, code: data.code });
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getPatientLists(start: string, end: string, gubun: string): void {

    this.amlall = [];
    this.lym = [];
    this.mds = [];
    this.genetic = [];
    this.seq = [];

    this.patientsList.patientSearch(start.replace(/-/g, ''), end.replace(/-/g, ''))
      .pipe(
        switchMap(data => from(data)),
        // tap(data => console.log('[TAP1]', this.types, data.test_code)),
        map(data => {
          const idx = this.types.findIndex(list => list.code === data.test_code);
          if (idx === -1) {
            return { ...data, type: 'none' };
          }
          return { ...data, type: this.types[idx].type };
        }),
        filter(list => list.type !== 'none'),
        filter(list => list.type === gubun),
        catchError(err => {
          console.log(err);
          return throwError(err);
        }),
        concatMap(patientinfo => {
          return this.variantsService.screenSelect(patientinfo.specimenNo)
            .pipe(
              map(data => {
                // console.log(patientinfo.name, data);
                return { ...patientinfo, data };
              }),
              // filter(data => data.data.length)
            );
        }),
      )
      .subscribe(data => {
        if (data.type === 'AMLALL') {
          this.pushAmlAll(data);
        } else if (data.type === 'LYM') {
          this.pushLym(data);
        } else if (data.type === 'MDS') {
          this.pushMds(data);
        } else if (data.type === 'Genetic') {
          this.pushGenetic(data);
        } else if (data.type === 'SEQ') {
          this.pushSeq(data);
        }
      },
        err => console.log(err),
        () => {
          if (gubun === 'AMLALL') {
            this.excelAMLALL();
          } else if (gubun === 'LYM') {
            this.excelLYM();
          } else if (gubun === 'MDS') {
            this.excelMDS();
          } else if (gubun === 'Genetic') {
            this.excelGenetic();
          } else if (gubun === 'SEQ') {
            this.excelSEQ();
          }
          this.processing = false;
        });
  }

  startToday(): string {
    const oneMonthsAgo = moment().subtract(3, 'months');

    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');

    const now1 = yy + '-' + mm + '-' + dd;
    return now1;
  }

  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;

    return now;
  }

  search(start: string, end: string, gubun: string): void {
    if (gubun === 'none') {
      alert('결과지를 선택해 주십시요.');
    } else {
      this.getPatientLists(start, end, gubun);
      this.processing = true;
    }

  }


  pushAmlAll(list): void {
    let check = '';

    if (list.data.length === 0) {
      if (parseInt(list.detected, 10) === 0) {
        check = 'Detected';
      } else if (parseInt(list.detected, 10) === 1) {
        check = 'Not Detected';
      }

      this.amlall.push({
        prescription: list.test_code,
        title: list.reportTitle,
        name: list.name,
        gender: list.gender,
        age: list.age,
        patientID: list.patientID,
        barcode: list.specimenNo,
        acceptdate: list.accept_date,
        reportdate: list.sendEMRDate,
        researchPrescriptionCode: '',
        LeukemiaAssociatedFusion: list.leukemiaassociatedfusion,
        FLT3ITD: list.FLT3ITD,
        IKZF1deletion: list.IKZK1Deletion,
        ChromosomalAnalysis: list.chromosomalanalysis,
        tsvname: list.tsvFilteredFilename,
        result: check,
        gene: '',
        functionalImpact: '',
        transcript: '',
        exonIntro: '',
        nucleotideChange: '',
        aminoAcidChange: '',
        zygosity: '',
        vafPercent: '',
        reference: '',
        cosmic_id: '',
      });
    } else {
      list.data.forEach(item => {
        // console.log('[175]', list);
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.amlall.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          LeukemiaAssociatedFusion: list.leukemiaassociatedfusion,
          FLT3ITD: list.FLT3ITD,
          IKZF1deletion: list.IKZK1Deletion,
          ChromosomalAnalysis: list.chromosomalanalysis,
          tsvname: list.tsvFilteredFilename,
          result: check,
          gene: item.gene,
          functionalImpact: item.functional_impact,
          transcript: item.transcript,
          exonIntro: item.exon,
          nucleotideChange: item.nucleotide_change,
          aminoAcidChange: item.amino_acid_change,
          zygosity: item.zygosity,
          vafPercent: item.vaf,
          reference: item.reference,
          cosmic_id: item.cosmic_id,
        });
      });
    }

  }

  pushLym(list): void {
    let check = '';

    if (list.data.length === 0) {
      if (parseInt(list.detected, 10) === 0) {
        check = 'Detected';
      } else if (parseInt(list.detected, 10) === 1) {
        check = 'Not Detected';
      }

      this.lym.push({
        prescription: list.test_code,
        title: list.reportTitle,
        name: list.name,
        gender: list.gender,
        age: list.age,
        patientID: list.patientID,
        barcode: list.specimenNo,
        acceptdate: list.accept_date,
        reportdate: list.sendEMRDate,
        researchPrescriptionCode: '',
        diagnosis: list.diagnosis,
        chromosomalAnalysis: list.chromosomalanalysis,
        tsvname: list.tsvFilteredFilename,
        result: check,
        gene: '',
        functionalImpact: '',
        transcript: '',
        exonIntro: '',
        nucleotideChange: '',
        aminoAcidChange: '',
        zygosity: '',
        vafPercent: '',
        reference: '',
        cosmic_id: '',
      });
    } else {
      list.data.forEach(item => {
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.lym.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          diagnosis: list.diagnosis,
          chromosomalAnalysis: list.chromosomalanalysis,
          tsvname: list.tsvFilteredFilename,
          result: check,
          gene: item.gene,
          functionalImpact: item.functional_impact,
          transcript: item.transcript,
          exonIntro: item.exon,
          nucleotideChange: item.nucleotide_change,
          aminoAcidChange: item.amino_acid_change,
          zygosity: item.zygosity,
          vafPercent: item.vaf,
          reference: item.reference,
          cosmic_id: item.cosmic_id,
        });
      });

    }
  }

  pushMds(list): void {
    let check = '';

    if (list.data.length === 0) {
      list.data.forEach(item => {
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.mds.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          diagnosis: list.diagnosis,
          geneticTest: list.genetictest,
          chromosomalAnalysis: list.chromosomalanalysis,
          excelname: list.tsvFilteredFilename,
          result: check,
          gene: '',
          functionalImpact: '',
          transcript: '',
          exonIntro: '',
          nucleotideChange: '',
          aminoAcidChange: '',
          zygosity: '',
          vafPercent: '',
          reference: '',
          cosmic_id: '',
        });
      });
    } else {
      list.data.forEach(item => {
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.mds.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          diagnosis: list.diagnosis,
          geneticTest: list.genetictest,
          chromosomalAnalysis: list.chromosomalanalysis,
          excelname: list.tsvFilteredFilename,
          result: check,
          gene: item.gene,
          functionalImpact: item.functional_impact,
          transcript: item.transcript,
          exonIntro: item.exon,
          nucleotideChange: item.nucleotide_change,
          aminoAcidChange: item.amino_acid_change,
          zygosity: item.zygosity,
          vafPercent: item.vaf,
          reference: item.reference,
          cosmic_id: item.cosmic_id,
        });
      });
    }



  }

  pushGenetic(list): void {
    let check = '';
    if (list.data.length === 0) {
      list.data.forEach(item => {
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.genetic.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          diagnosis: list.diagnosis,
          excelname: list.tsvFilteredFilename,
          result: check,
          gene: '',
          functionalImpact: '',
          transcript: '',
          exonIntro: '',
          nucleotideChange: '',
          aminoAcidChange: '',
          zygosity: '',
          dbSNPHGMD: '',
          gnomADEAS: '',
          OMIM: '',
        });
      });
    } else {
      list.data.forEach(item => {
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.genetic.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          diagnosis: list.diagnosis,
          excelname: list.tsvFilteredFilename,
          result: check,
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
        });
      });
    }


  }

  pushSeq(list): void {
    let check = '';
    if (list.data.length === 0) {
      list.data.forEach(item => {
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.seq.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          result: check,
          gene: '',
          type: '',
          exonIntro: '',
          nucleotideChange: '',
          aminoAcidChange: '',
          zygosity: '',
          rsid: '',
          genbank: ''
        });
      });
    } else {
      list.data.forEach(item => {
        if (parseInt(list.detected, 10) === 0) {
          check = 'Detected';
        } else if (parseInt(list.detected, 10) === 1) {
          check = 'Not Detected';
        }
        this.seq.push({
          prescription: list.test_code,
          title: list.reportTitle,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          barcode: list.specimenNo,
          acceptdate: list.accept_date,
          reportdate: list.sendEMRDate,
          researchPrescriptionCode: '',
          result: check,
          gene: item.gene,
          type: item.functional_impact,
          exonIntro: item.exon,
          nucleotideChange: item.nucleotide_change,
          aminoAcidChange: item.amino_acid_change,
          zygosity: item.zygosity,
          rsid: item.cosmic_id,
          genbank: item.reference
        });
      });
    }


  }



  excelAMLALL(): void {

    this.amlall.unshift({
      prescription: '처방코드',
      title: 'Report제목',
      name: '환자명',
      gender: '성별',
      age: '나이',
      patientID: '등록번호',
      barcode: '검체바코드',
      acceptdate: '접수일시',
      reportdate: '저장일시',
      researchPrescriptionCode: '연구용처방여부',

      LeukemiaAssociatedFusion: 'Leukemia associated fusion',
      IKZF1deletion: 'IKZF1 deletion',
      FLT3ITD: 'FLT3-ITD',
      ChromosomalAnalysis: 'Chromosomal analysis',
      tsvname: 'TSV파일명',
      result: 'Result',
      gene: 'Gene',
      functionalImpact: 'Functional Impact',
      transcript: 'Transcript',
      exonIntro: 'Exon/Intron',
      nucleotideChange: 'Nucleotide Change',
      aminoAcidChange: 'Amino Acid Change',
      zygosity: 'Zygosity',
      vafPercent: 'VAF %',
      reference: 'Reference(s)',
      cosmic_id: 'COSMIC ID',

    });

    const width = [{ width: 9 }, { width: 39 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 },
    { width: 25 }, { width: 30 }, { width: 21 }, { width: 27 },
    { width: 16 }, { width: 18 }, { width: 18 }, { width: 34 }, { width: 13 },
    { width: 28 }, { width: 37 }, { width: 14 }, { width: 12 }, { width: 14 },
    { width: 14 },
    ];
    this.excel.exportAsExcelFileWidth(this.amlall, 'AMLALL', width);
  }

  excelLYM(): void {

    this.lym.unshift({
      prescription: '처방코드',
      title: 'Report제목',
      name: '환자명',
      gender: '성별',
      age: '나이',
      patientID: '등록번호',
      barcode: '검체바코드',
      acceptdate: '접수일시',
      reportdate: '저장일시',
      researchPrescriptionCode: '연구용처방여부',
      diagnosis: 'Diagnosis',
      chromosomalAnalysis: 'Chromosomal analysis',
      tsvname: 'TSV파일명',
      result: 'Result',
      gene: 'Gene',
      functionalImpact: 'Functional Impact',
      transcript: 'Transcript',
      exonIntro: 'Exon/Intron',
      nucleotideChange: 'Nucleotide Change',
      aminoAcidChange: 'Amino Acid Change',
      zygosity: 'Zygosity',
      vafPercent: 'VAF %',
      reference: 'Reference(s)',
      cosmic_id: 'COSMIC ID',
    });

    const width = [{ width: 9 }, { width: 19 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 },
    { width: 16 }, { width: 20 }, { width: 25 }, { width: 9 }, { width: 17 },
    { width: 18 }, { width: 37 }, { width: 11 }, { width: 26 }, { width: 33 },
    { width: 14 }, { width: 9 }, { width: 14 }, { width: 14 }
    ];
    this.excel.exportAsExcelFileWidth(this.lym, 'LYM', width);
  }

  excelMDS(): void {
    this.mds.unshift({
      prescription: '처방코드',
      title: 'Report제목',
      name: '환자명',
      gender: '성별',
      age: '나이',
      patientID: '등록번호',
      barcode: '검체바코드',
      acceptdate: '접수일시',
      reportdate: '저장일시',
      researchPrescriptionCode: '연구용처방여부',
      diagnosis: 'Diagonsis',
      geneticTest: 'Genetic test',
      chromosomalAnalysis: 'Chromosomal analysis',
      excelname: '액셀파일명',
      result: 'Result',
      gene: 'Gene',
      functionalImpact: 'Functional Impact',
      transcript: 'Transcript',
      exonIntro: 'Exon/Intron',
      nucleotideChange: 'Nucleotide Change',
      aminoAcidChange: 'Amino Acid Change',
      zygosity: 'Zygosity',
      vafPercent: 'VAF %',
      reference: 'Reference(s)',
      cosmic_id: 'COSMIC ID',

    });

    const width = [{ width: 9 }, { width: 39 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 },
    { width: 10 }, { width: 30 }, { width: 21 }, { width: 27 }, { width: 16 }, { width: 18 },
    { width: 18 }, { width: 34 }, { width: 27 }, { width: 28 }, { width: 19 },
    { width: 19 }, { width: 12 }, { width: 9 }, { width: 14 },

    ];
    this.excel.exportAsExcelFileWidth(this.mds, 'MDSMPN', width);
  }

  excelGenetic(): void {
    this.genetic.unshift({
      prescription: '처방코드',
      title: 'Report제목',
      name: '환자명',
      gender: '성별',
      age: '나이',
      patientID: '등록번호',
      barcode: '검체바코드',
      acceptdate: '접수일시',
      reportdate: '저장일시',
      researchPrescriptionCode: '연구용처방여부',
      diagnosis: 'Diagonsis',
      excelname: '액셀파일명',
      result: 'Result',
      gene: 'Gene',
      functionalImpact: 'Functional Impact',
      transcript: 'Transcript',
      exonIntro: 'Exon/Intron',
      nucleotideChange: 'Nucleotide Change',
      aminoAcidChange: 'Amino Acid Change',
      zygosity: 'Zygosity',
      dbSNPHGMD: 'dbSNP/HGMD',
      gnomADEAS: 'gnomAD EAS',
      OMIM: 'OMIM',
    });

    const width = [{ width: 9 }, { width: 29 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 },
    { width: 10 }, { width: 52 }, { width: 9 }, { width: 12 }, { width: 16 }, { width: 18 },
    { width: 18 }, { width: 34 }, { width: 18 }, { width: 18 }, { width: 13 },
    { width: 19 }, { width: 12 }, { width: 9 }

    ];
    this.excel.exportAsExcelFileWidth(this.genetic, 'Genetic', width);
  }

  excelSEQ(): void {
    this.seq.unshift({
      prescription: '처방코드',
      title: 'Report제목',
      name: '환자명',
      gender: '성별',
      age: '나이',
      patientID: '등록번호',
      barcode: '검체바코드',
      acceptdate: '접수일시',
      reportdate: '저장일시',
      researchPrescriptionCode: '연구용처방여부',
      result: 'Result',
      gene: 'Gene',
      type: 'Type',
      exonIntro: 'Exon/Intron',
      nucleotideChange: 'Nucleotide Change',
      aminoAcidChange: 'Amino Acid Change',
      zygosity: 'Zygosity',
      rsid: 'rs ID',
      genbank: 'GenBank accesion no.',

    });

    const width = [{ width: 9 }, { width: 29 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 },
    { width: 10 }, { width: 9 }, { width: 9 }, { width: 12 }, { width: 17 },
    { width: 18 }, { width: 14 }, { width: 9 }, { width: 20 }
    ];
    this.excel.exportAsExcelFileWidth(this.seq, 'SEQ', width);
  }



}
