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
import { IAMLALL, IGenetic, IIGTCR, IIGTCREXCEL, ILYM, IMDS, ISEQ } from './excel.model';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { AnalysisService } from 'src/app/forms/commons/analysis.service';
import { IgTcrService } from 'src/app/services/igtcr.service';

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
  excelData:  IIGTCREXCEL[] =[];
  processing = false;


  constructor(
    private excelService: ExcelAddListService,
    private snackBar: MatSnackBar,
    private excel: ExcelService,
    private patientsList: PatientsListService,
    private codeDefaultValueService: CodeDefaultValue,
    private variantsService: DetectedVariantsService,
    private analysisService: AnalysisService,
    private igtcrService: IgTcrService
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
        // console.log('[111][patientExcel] ... ', data)
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
        } else if (data.type === 'IGTCR') {
          this.pushIgtcr(data.name , data.specimenNo, data.patientID);
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
          }else if (gubun === 'IGTCR') {
            this.printIGTCRInfoEachPatient();
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
          comment: list.comment_gene
          
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
            comment: list.comment_gene
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
          comment: list.comment
        });
      }

    } else {
      console.log('[637][SEQ]==>', list);
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
            comment: list.comment
          });
        }

      });
    }


  }

  pushIgtcl() {
    
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

  ///////////////////////// IG-TCR
 pushIgtcr(name: string, specimenno: string, patientID: string ) {
  this.igtcrService.igtcrListInfo(specimenno)
  .pipe(
    map(data => data.map(item => {
        
      this.excelData.push({
        name,
        patientId: patientID,
        report_date: item.report_date,
        gene: item.gene,
        total_read_count: item.total_read_count,
        // 23.07.27  read_of_LQIC에는 % 필요없으므로 삭제
        read_of_LQIC: item.read_of_LQIC?.length ? item.read_of_LQIC : '',
        percent_of_LQIC: item.percent_of_LQIC,
        total_Bcell_Tcell_count: item.total_Bcell_Tcell_count,
        sequence1: item.sequence1,
        sequence_length1: item.sequence_length1,
        raw_count1: item.raw_count1,
        v_gene1: item.v_gene1,
        j_gene1: item.j_gene1,
        percent_total_reads1: item.percent_total_reads1.length ? item.percent_total_reads1+'%' : '',
        cell_equipment1: item.cell_equipment1,
        sequence2: item.sequence2,
        sequence_length2: item.sequence_length2,
        raw_count2: item.raw_count2,
        v_gene2: item.v_gene2,
        j_gene2: item.j_gene2,
        percent_total_reads2: item.percent_total_reads2.length ? item.percent_total_reads2+'%' : '',
        cell_equipment2: item.cell_equipment2,
        sequence3: item.sequence3,
        sequence_length3: item.sequence_length3,
        raw_count3: item.raw_count3,
        v_gene3: item.v_gene3,
        j_gene3: item.j_gene3,
        percent_total_reads3: item.percent_total_reads3.length ? item.percent_total_reads3+'%' : '',
        cell_equipment3: item.cell_equipment3,
        sequence4: item.sequence4,
        sequence_length4: item.sequence_length4,
        raw_count4: item.raw_count4,
        v_gene4: item.v_gene4,
        j_gene4: item.j_gene4,
        percent_total_reads4: item.percent_total_reads4.length ? item.percent_total_reads4+'%': '',
        cell_equipment4: item.cell_equipment4,
        sequence5: item.sequence5,
        sequence_length5: item.sequence_length5,
        raw_count5: item.raw_count5,
        v_gene5: item.v_gene5,
        j_gene5: item.j_gene5,
        percent_total_reads5: item.percent_total_reads5.length ? item.percent_total_reads5+'%': '',
        cell_equipment5: item.cell_equipment5,
        sequence6: item.sequence6,
        sequence_length6: item.sequence_length6,
        raw_count6: item.raw_count6,
        v_gene6: item.v_gene6,
        j_gene6: item.j_gene6,
        percent_total_reads6: item.percent_total_reads6.length ? item.percent_total_reads6+'%' : '',
        cell_equipment6: item.cell_equipment6,
        sequence7: item.sequence7,
        sequence_length7: item.sequence_length7,
        raw_count7: item.raw_count7,
        v_gene7: item.v_gene7,
        j_gene7: item.j_gene7,
        percent_total_reads7: item.percent_total_reads7.length ? item.percent_total_reads7+'%' : '',
        cell_equipment7: item.cell_equipment7,
        sequence8: item.sequence8,
        sequence_length8: item.sequence_length8,
        raw_count8: item.raw_count8,
        v_gene8: item.v_gene8,
        j_gene8: item.j_gene8,
        percent_total_reads8: item.percent_total_reads8.length ? item.percent_total_reads8+'%' : '',
        cell_equipment8: item.cell_equipment8,
        sequence9: item.sequence9,
        sequence_length9: item.sequence_length9,
        raw_count9: item.raw_count9,
        v_gene9: item.v_gene9,
        j_gene9: item.j_gene9,
        percent_total_reads9: item.percent_total_reads9.length ? item.percent_total_reads9+'%' : '',
        cell_equipment9: item.cell_equipment9,
        sequence10: item.sequence10,
        sequence_length10: item.sequence_length10,
        raw_count10: item.raw_count10,
        v_gene10: item.v_gene10,
        j_gene10: item.j_gene10,
        percent_total_reads10: item.percent_total_reads10.length ? item.percent_total_reads10+'%': '',
        cell_equipment10: item.cell_equipment10,
        total_IGH_read_depth: item.total_IGH_read_depth+'%',
        total_nucelated_cells: item.total_nucelated_cells+'%',
        total_cell_equipment: item.total_cell_equipment,
        IGHV_mutation : item.IGHV_mutation,
        bigo : item.bigo,
        comment: item.comment,
        density: item.density
      });

      return  item;
    }))
  ).subscribe(data => {
    if (data.length) {
     // console.log('[889]', this.igtcrData);
    }
  })
}

printIGTCRInfoEachPatient() {
  const width = [{ width: 9 },  { width: 12 },{ width: 12 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12}
    ];

    // this.excelData.unshift({
    //   name: '이름',
    //   report_date: '접수 Date',
    //   gene: 'gene',
    //   total_read_count: 'Total read\n count',
    //   read_of_LQIC: 'Read \n of LQIC',
    //   percent_of_LQIC: '% \n of LQIC',
    //   total_Bcell_Tcell_count: 'Total \n B-Cell/ \n T-Cell \n count',
    //   sequence1: 'sequence',
    //   sequence_length1: 'Length',
    //   raw_count1: 'Raw count',
    //   v_gene1: 'V-gene',
    //   j_gene1: 'J-gene',
    //   percent_total_reads1: '% total \n reads',
    //   cell_equipment1: 'cell \n equivalent',
    //   sequence2: 'sequence',
    //   sequence_length2: 'Length',
    //   raw_count2: 'Raw count',
    //   v_gene2:  'V-gene',
    //   j_gene2: 'J-gene',
    //   percent_total_reads2: '% total \n reads',
    //   cell_equipment2: 'cell \n equivalent',
    //   sequence3: 'sequence',
    //   sequence_length3: 'Length',
    //   raw_count3: 'Raw count',
    //   v_gene3: 'V-gene',
    //   j_gene3: 'J-gene',
    //   percent_total_reads3: '% total \n reads',
    //   cell_equipment3: 'cell \n equivalent',
    //   sequence4: 'sequence',
    //   sequence_length4: 'Length',
    //   raw_count4: 'Raw count',
    //   v_gene4: 'V-gene',
    //   j_gene4: 'J-gene',
    //   percent_total_reads4: '% total \n reads',
    //   cell_equipment4: 'cell \n equivalent',
    //   sequence5: 'sequence',
    //   sequence_length5: 'Length',
    //   raw_count5: 'Raw count',
    //   v_gene5: 'V-gene',
    //   j_gene5: 'J-gene',
    //   percent_total_reads5: '% total \n reads',
    //   cell_equipment5: 'cell \n equivalent',
    //   sequence6: 'sequence',
    //   sequence_length6: 'Length',
    //   raw_count6: 'Raw count',
    //   v_gene6: 'V-gene',
    //   j_gene6: 'J-gene',
    //   percent_total_reads6: '% total \n reads',
    //   cell_equipment6: 'cell \n equivalent',
    //   sequence7: 'sequence',
    //   sequence_length7: 'Length',
    //   raw_count7: 'Raw count',
    //   v_gene7: 'V-gene',
    //   j_gene7: 'J-gene',
    //   percent_total_reads7: '% total \n reads',
    //   cell_equipment7: 'cell \n equivalent',
    //   sequence8: 'sequence',
    //   sequence_length8: 'Length',
    //   raw_count8: 'Raw count',
    //   v_gene8: 'V-gene',
    //   j_gene8: 'J-gene',
    //   percent_total_reads8: '% total \n reads',
    //   cell_equipment8: 'cell \n equivalent',
    //   sequence9: 'sequence',
    //   sequence_length9: 'Length',
    //   raw_count9: 'Raw count',
    //   v_gene9: 'V-gene',
    //   j_gene9: 'J-gene',
    //   percent_total_reads9: '% total \n reads',
    //   cell_equipment9: 'cell \n equivalent',
    //   sequence10: 'sequence',
    //   sequence_length10: 'Length',
    //   raw_count10: 'Raw count',
    //   v_gene10: 'V-gene',
    //   j_gene10: 'J-gene',
    //   percent_total_reads10: '% total \n reads',
    //   cell_equipment10: 'cell \n equivalent',
    //   total_IGH_read_depth: 'Clonal\n total IGH \n read depth \n (%)*',
    //   total_nucleated_cells: 'Clonal total \n nucleated cells \n (%)**',
    //   total_cell_equipment: 'Cell \n equivalent',
    //   IGHV_mutation : 'IGHV \n mutation',
    //   bigo : '비고',
    //   comment: 'Comment'
    // });

    this.excelData.unshift({
      name: '',
      patientId: '',
      report_date: '',
      gene: '',
      total_read_count: '',
      read_of_LQIC: '',
      percent_of_LQIC: '',
      total_Bcell_Tcell_count: '',
      sequence1: '',
      sequence_length1: '',
      raw_count1: '',
      v_gene1: '',
      j_gene1: '',
      percent_total_reads1: '',
      cell_equipment1: '',
      sequence2: '',
      sequence_length2: '',
      raw_count2: '',
      v_gene2:  '',
      j_gene2: '',
      percent_total_reads2: '',
      cell_equipment2: '',
      sequence3: '',
      sequence_length3: '',
      raw_count3: '',
      v_gene3: '',
      j_gene3: '',
      percent_total_reads3: '',
      cell_equipment3: '',
      sequence4: '',
      sequence_length4: '',
      raw_count4: '',
      v_gene4: '',
      j_gene4: '',
      percent_total_reads4: '',
      cell_equipment4: '',
      sequence5: '',
      sequence_length5: '',
      raw_count5: '',
      v_gene5: '',
      j_gene5: '',
      percent_total_reads5: '',
      cell_equipment5: '',
      sequence6: '',
      sequence_length6: '',
      raw_count6: '',
      v_gene6: '',
      j_gene6: '',
      percent_total_reads6: '',
      cell_equipment6: '',
      sequence7: '',
      sequence_length7: '',
      raw_count7: '',
      v_gene7: '',
      j_gene7: '',
      percent_total_reads7: '',
      cell_equipment7: '',
      sequence8: '',
      sequence_length8: '',
      raw_count8: '',
      v_gene8: '',
      j_gene8: '',
      percent_total_reads8:'',
      cell_equipment8: '',
      sequence9: '',
      sequence_length9: '',
      raw_count9: '',
      v_gene9: '',
      j_gene9: '',
      percent_total_reads9: '',
      cell_equipment9: '',
      sequence10: '',
      sequence_length10: '',
      raw_count10: '',
      v_gene10: '',
      j_gene10: '',
      percent_total_reads10: '',
      cell_equipment10: '',
      total_IGH_read_depth: '',
      total_nucelated_cells:'',
      total_cell_equipment: '',
      IGHV_mutation : '',
      bigo : '',
      comment: '',
      density: ''
    });

    this.excelData.unshift({
      name: '',
      patientId: '',
      report_date: '',
      gene: '',
      total_read_count: '',
      read_of_LQIC: '',
      percent_of_LQIC: '',
      total_Bcell_Tcell_count: '',
      sequence1: '',
      sequence_length1: '',
      raw_count1: '',
      v_gene1: '',
      j_gene1: '',
      percent_total_reads1: '',
      cell_equipment1: '',
      sequence2: '',
      sequence_length2: '',
      raw_count2: '',
      v_gene2:  '',
      j_gene2: '',
      percent_total_reads2: '',
      cell_equipment2: '',
      sequence3: '',
      sequence_length3: '',
      raw_count3: '',
      v_gene3: '',
      j_gene3: '',
      percent_total_reads3: '',
      cell_equipment3: '',
      sequence4: '',
      sequence_length4: '',
      raw_count4: '',
      v_gene4: '',
      j_gene4: '',
      percent_total_reads4: '',
      cell_equipment4: '',
      sequence5: '',
      sequence_length5: '',
      raw_count5: '',
      v_gene5: '',
      j_gene5: '',
      percent_total_reads5: '',
      cell_equipment5: '',
      sequence6: '',
      sequence_length6: '',
      raw_count6: '',
      v_gene6: '',
      j_gene6: '',
      percent_total_reads6: '',
      cell_equipment6: '',
      sequence7: '',
      sequence_length7: '',
      raw_count7: '',
      v_gene7: '',
      j_gene7: '',
      percent_total_reads7: '',
      cell_equipment7: '',
      sequence8: '',
      sequence_length8: '',
      raw_count8: '',
      v_gene8: '',
      j_gene8: '',
      percent_total_reads8:'',
      cell_equipment8: '',
      sequence9: '',
      sequence_length9: '',
      raw_count9: '',
      v_gene9: '',
      j_gene9: '',
      percent_total_reads9: '',
      cell_equipment9: '',
      sequence10: '',
      sequence_length10: '',
      raw_count10: '',
      v_gene10: '',
      j_gene10: '',
      percent_total_reads10: '',
      cell_equipment10: '',
      total_IGH_read_depth: '',
      total_nucelated_cells:'',
      total_cell_equipment: '',
      IGHV_mutation : '',
      bigo : '',
      comment: '',
      density: ''
    });
    


    this.excel.exportIGTCR(this.excelData, 'IG-TCR', width);
 
 
 }





}
