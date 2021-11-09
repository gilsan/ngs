import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { IExcelData } from 'src/app/home/models/patients';
import { ExcelAddListService } from 'src/app/home/services/excelAddList';
import { ExcelService } from 'src/app/services/excel.service';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-patientexcel',
  templateUrl: './patientexcel.component.html',
  styleUrls: ['./patientexcel.component.scss']
})
export class PatientexcelComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  size = 0;
  count = 1;
  constructor(
    private excelService: ExcelAddListService,
    private snackBar: MatSnackBar,
    private excel: ExcelService,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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


  search(start: string, end: string, type: string): void {

    if (type !== 'none') {
      if (type === 'A') {
        type = '';
      }
      console.log(start, end, type);
      this.subs.sink = this.excelService.patientExcelList(start, end, type)
        .subscribe(excellists => {
          const excelLists: IExcelData[] = [];
          this.snackBar.open('정상적으로 다운로드 하였습니다.', '닫기', { duration: 3000 });
          if (type === 'AMLALL') {
            excelLists.push({
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
              functionalImpact: 'Functional Impact',
              transcript: 'Transcript',
              exonIntro: 'Exon/Intron',
              nucleotideChange: 'Nucleotide Change',
              aminoAcidChange: 'Amino Acid Change',
              zygosity: 'Zygosity',
              vafPercent: 'VAF %',
              reference: 'Reference(s)',
              cosmic_id: 'COSMIC ID',
              tsvname: 'TSV파일명',
              LeukemiaAssociatedFusion: 'Leukemia associated fusion',
              IKZF1deletion: 'IKZF1 deletion',
              ChromosomalAnalysis: 'Chromosomal analysis'
            });

            excellists.forEach(list => {
              excelLists.push({
                tsvname: list.tsvname,
                name: list.name,
                gender: list.gender,
                age: list.age,
                patientID: list.patientID,
                barcode: list.barcode,
                acceptdate: list.acceptdate,
                reportdate: list.reportdate,
                testcode: list.testcode,
                gene: list.gene,
                functionalImpact: list.functionalImpact,
                transcript: list.transcript,
                exonIntro: list.exonIntro,
                nucleotideChange: list.nucleotideChange,
                aminoAcidChange: list.aminoAcidChange,
                zygosity: list.zygosity,
                vafPercent: list.vafPercent,
                references: list.reference,
                cosmicID: list.cosmicID
              });
            });
          } else if (type === 'LYM') {
            excelLists.push({
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
              functionalImpact: 'Functional Impact',
              transcript: 'Transcript',
              exonIntro: 'Exon/Intron',
              nucleotideChange: 'Nucleotide Change',
              aminoAcidChange: 'Amino Acid Change',
              zygosity: 'Zygosity',
              vafPercent: 'VAF %',
              reference: 'Reference(s)',
              cosmic_id: 'COSMIC ID',
              tsvname: 'TSV파일명',
              Diagnosis: 'Diagnosis',
              ChromosomalAnalysis: 'Chromosomal analysis'
            });

          } else if (type === 'MDS') {
            excelLists.push({
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
              functionalImpact: 'Functional Impact',
              transcript: 'Transcript',
              exonIntro: 'Exon/Intron',
              nucleotideChange: 'Nucleotide Change',
              aminoAcidChange: 'Amino Acid Change',
              zygosity: 'Zygosity',
              vafPercent: 'VAF %',
              reference: 'Reference(s)',
              cosmic_id: 'COSMIC ID',
              excelname: 'Excel파일명',
              Diagnosis: 'Diagnosis',
              GeneticTest: 'Genetic test',
              ChromosomalAnalysis: 'Chromosomal analysis'
            });
          } else if (type === 'Genetic') {
            excelLists.push({
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

            excellists.forEach(list => {
              excelLists.push({
                tsvname: list.tsvname,
                name: list.name,
                gender: list.gender,
                age: list.age,
                patientID: list.patientID,
                barcode: list.barcode,
                acceptdate: list.acceptdate,
                reportdate: list.reportdate,
                testcode: list.testcode,
                gene: list.gene,
                functionalImpact: list.functionalImpact,
                transcript: list.transcript,
                exonIntro: list.exonIntro,
                nucleotideChange: list.nucleotideChange,
                aminoAcidChange: list.aminoAcidChange,
                zygosity: list.zygosity,
                vafPercent: list.vafPercent,
                references: list.reference,
                cosmicID: list.cosmicID
              });
            });
          } else if (type === 'SEQ') {
            excelLists.push({
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
              functionalImpact: 'Type',
              transcript: 'Genbank accession no',
              exonIntro: 'Exon/Intron',
              nucleotideChange: 'Nucleotide Change',
              aminoAcidChange: 'Amino Acid Change',
              zygosity: 'Zygosity',
              rsid: 'rs ID'
            });

            excellists.forEach(list => {
              excelLists.push({
                tsvname: list.tsvname,
                name: list.name,
                gender: list.gender,
                age: list.age,
                patientID: list.patientID,
                barcode: list.barcode,
                acceptdate: list.acceptdate,
                reportdate: list.reportdate,
                testcode: list.testcode,
                gene: list.gene,
                functionalImpact: list.functionalImpact,
                transcript: list.transcript,
                exonIntro: list.exonIntro,
                nucleotideChange: list.nucleotideChange,
                aminoAcidChange: list.aminoAcidChange,
                zygosity: list.zygosity,
                vafPercent: list.vafPercent,
                references: list.reference,
                cosmicID: list.cosmicID
              });
            });
          }




          this.excel.exportAsExcelFile(excelLists, 'report');
        });
    } else {
      alert('검색항목을 선택해 주십시요.');
    }

  }



}
