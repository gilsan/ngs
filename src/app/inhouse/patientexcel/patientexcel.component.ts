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
import { AnalysisService } from 'src/app/forms/commons/analysis.service';

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
    private variantsService: DetectedVariantsService,
    private analysisService: AnalysisService
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
        // tap(data => console.log('[TAP1]', data)),
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
              // tap(data => console.log('[97]', data)),
              map(data => {
                // console.log('[99]', patientinfo.name, data);
                return { ...patientinfo, data };
              }),
            );
        }),
      )
      .subscribe(data => {
        console.log('[107][patientExcel] ... ', data)
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
    let leukemia = '';
    let flt3itd = '';
    let chron = '';

    if (list.data.length === 0) {
      if (parseInt(list.screenstatus, 10) >= 3) {
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
      }

    } else {
      list.data.forEach(item => {
        if (parseInt(item.sendyn, 10) === 3) {

          if (list.test_code === 'LPE471') { // AML
            this.analysisService.getAanlysisAMLInfo(list.specimenNo)
              .subscribe(profile => {
                if (profile.length > 0) {
                  leukemia = profile[0].leukemiaassociatedfusion;
                  flt3itd = profile[0].FLT3ITD;
                  chron = profile[0].chromosomalanalysis;
                } else {
                  leukemia = list.leukemiaassociatedfusion;
                  flt3itd = list.FLT3ITD;
                  chron = list.chromosomalanalysis;
                }

                console.log('AML: ', profile);
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
                  LeukemiaAssociatedFusion: leukemia,
                  FLT3ITD: flt3itd,
                  IKZF1deletion: '',
                  ChromosomalAnalysis: chron,
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
          } else if (list.test_code === 'LPE472') { // ALL
            this.analysisService.getAanlysisALLInfo(list.specimenNo)
              .subscribe(profile => {
                if (profile.length > 0) {
                  leukemia = profile[0].leukemiaassociatedfusion;
                  flt3itd = profile[0].IKZK1Deletion;
                  chron = profile[0].chromosomalanalysis;
                } else {
                  leukemia = list.leukemiaassociatedfusion;
                  flt3itd = list.IKZK1Deletion;
                  chron = list.chromosomalanalysis;
                }

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
                  LeukemiaAssociatedFusion: leukemia,
                  FLT3ITD: '',
                  IKZF1deletion: flt3itd,
                  ChromosomalAnalysis: chron,
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

      });
    }

  }

  pushLym(list): void {
    let check = '';
    let leukemia = '';
    let chron = '';

    if (list.data.length === 0) {
      if (parseInt(list.screenstatus, 10) === 3) {
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
          diagnosis: list.bonemarrow,
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
      }
    } else {
      list.data.forEach(item => {
        if (parseInt(item.sendyn, 10) === 3) {

          this.analysisService.getAanlysisLYMInfo(list.specimenNo)
            .subscribe(profile => {
              if (profile.length > 0) {
                leukemia = profile[0].bonemarrow;
                chron = profile[0].chromosomalanalysis;
              } else {
                leukemia = list.leukemiaassociatedfusion;
                chron = list.chromosomalanalysis;
              }

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
                diagnosis: leukemia,
                chromosomalAnalysis: chron,
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

      });

    }
  }

  pushMds(list): void {
    let check = '';
    let leukemia = '';
    let genetictest = '';
    let chron = '';

    if (list.data.length === 0) {
      if (parseInt(list.screenstatus, 10) >= 3) {
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
      };
    } else {

      list.data.forEach(item => {
        if (parseInt(item.sendyn, 10) === 3) {

          this.analysisService.getAanlysisMDSInfo(list.specimenNo)
            .subscribe(profile => {
              if (profile.length > 0) {
                leukemia = profile[0].diagnosis;
                genetictest = profile[0].genetictest;
                chron = profile[0].chromosomalanalysis;
              } else {
                leukemia = list.leukemiaassociatedfusion;
                // tslint:disable-next-line:max-line-length
                genetictest = 'JAK2 V617F :' + list.genetic1 + ';' + 'JAK2 exon 12 :' + list.genetic2 + ';' + 'CALR :' + list.genetic3 + ';' + 'MPL :' + list.genetic4;
                chron = list.chromosomalanalysis;
              }
              console.log('[472]', leukemia, genetictest, chron);
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
                diagnosis: leukemia,
                geneticTest: genetictest,
                chromosomalAnalysis: chron,
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

      });
    }

  }

  pushGenetic(list): void {
    let check = '';
    if (list.data.length === 0) {
      if (parseInt(list.screenstatus, 10) >= 3) {
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
          comment: ''
          
        });
      };
    } else {
      list.data.forEach(item => {
        if (parseInt(item.sendyn, 10) === 3) {
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
            comment: item.comment
          });
        }

      });
    }


  }

  pushSeq(list): void {
    let check = '';

    if (list.data.length === 0) {
      if (parseInt(list.screenstatus, 10) === 3) {
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
          genbank: '',
          comment: ''
        });
      }

    } else {
      list.data.forEach(item => {
        if (parseInt(item.sendyn, 10) === 3) {
          console.log(list);
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
            type: item.type,
            exonIntro: item.exon,
            nucleotideChange: item.nucleotide_change,
            aminoAcidChange: item.amino_acid_change,
            zygosity: item.zygosity,
            rsid: item.cosmic_id,
            genbank: item.reference,
            comment: item.comment
          });
        }

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
      comment: 'Comment'
    });

    const width = [{ width: 9 }, { width: 29 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 },
    { width: 10 }, { width: 52 }, { width: 9 }, { width: 12 }, { width: 16 }, { width: 18 },
    { width: 18 }, { width: 34 }, { width: 18 }, { width: 18 }, { width: 13 },
    { width: 19 }, { width: 12 }, { width: 9 }, { width: 60 }

    ];
    console.log('[822][유전성]', this.genetic);
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
      comment: 'Comment'

    });

    const width = [{ width: 9 }, { width: 29 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 },
    { width: 10 }, { width: 9 }, { width: 9 }, { width: 12 }, { width: 17 },
    { width: 18 }, { width: 14 }, { width: 9 }, { width: 20 }, { width: 60 }
    ];
    this.excel.exportAsExcelFileWidth(this.seq, 'SEQ', width);
  }



}
