import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { IExcelData } from 'src/app/home/models/patients';

import { SubSink } from 'subsink';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExcelAddListService } from '../../services/excelAddList';
import { ExcelService } from '../../services/excel.service';

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
    /*
    this.subs.sink = this.excelService.patientExcelList(start, end)
      .subscribe(excellists => {
        const excelLists: IExcelData[] = [];
        this.snackBar.open('정상적으로 다운로드 하였습니다.', '닫기', { duration: 3000 });
        excelLists.push({

        });

        excellists.forEach(list => {
          excelLists.push({

          });
        });

        this.excel.exportAsExcelFile(excelLists, 'report');
      });
     */

  }


}
