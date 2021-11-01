import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';


import { SubSink } from 'subsink';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ExcelService } from '../../services/excel.service';
import { IExcelData } from '../../models/patients';
import { ExcelAddListService } from '../../services/excelAddList';

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


  search(start: string, end: string): void {

    console.log(start, end);
    const excelLists: IExcelData[] = [];
    let count;
    this.subs.sink = this.excelService.patientExcelList(start, end)
      .subscribe(lists => {
        // console.log(lists);
        this.snackBar.open('정상적으로 다운로드 하였습니다.', '닫기', { duration: 3000 });
        excelLists.push({
          no: 'No',
          prescription_date: '검사일시',
          report_date: '저장일시',
          rel_pathology_num: '등록번호',
          pathology_num: '병리번호',
          pathological_dx: '관련병리번호\n(Tube number)',
          organ: 'Organ',
          diagnosis: 'Diagnosis',
          report_gb: '구분(C:PV/LPV 검출 유전자, P:VUS 검출 유전자)',
          gene: 'gene',
          amino_acid_change: 'variant(P) (참고:Amino acid change의미)',
          nucleotide_change: 'variant(N) (참고:Nucleotide change의미)',
          variant_allele_frequency: 'Allele Frequency'
        });

        lists.forEach((list, index) => {
          count = index + 1;
          console.log(list);
          excelLists.push({
            no: count.toString(),
            prescription_date: list.prescription_date,
            report_date: list.report_date,
            rel_pathology_num: list.rel_pathology_num,
            pathology_num: list.pathology_num,
            pathological_dx: list.rel_pathology_num,
            organ: list.organ,
            diagnosis: '',
            report_gb: list.report_gb,
            gene: list.gene,
            amino_acid_change: list.amino_acid_change,
            nucleotide_change: list.nucleotide_change,
            variant_allele_frequency: list.variant_allele_frequency
          });
        });

        const ngwidth = [{ width: 9 }, { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 },
        { width: 25 }, { width: 9 }, { width: 9 }, { width: 42 }, { width: 9 },
        { width: 35 }, { width: 35 }, { width: 16 }
        ];

        this.excel.exportAsExcelFile(excelLists, 'report', ngwidth);
      });


  }


}
