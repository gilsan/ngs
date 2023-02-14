import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';
import { IPatient } from 'src/app/home/models/patients';
import { IgtcrService } from '../igtcr.services';
@Component({
  selector: 'app-main-lists',
  templateUrl: './mainLists.component.html',
  styleUrls: ['./mainLists.component.scss']
})
export class MainListsComponent implements OnInit {


  startDay = this.startToday();
  endDay = this.endToday();
  testId = '';
  patientname = '';
  patientid = '';
  lists: IPatient[] = [];

  constructor(
    private router: Router,
    public service: IgtcrService
  ) {}

  ngOnInit(): void {
    this.search(this.startDay, this.endDay);
  }



  sheet(): void {
    this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet']);
  }

  goReporter(i: number, type: string) {
    console.log(this.lists[i]);
    this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet', type,i]);
    // this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet', this.lists[i].test_code,i]);

  }



  search(start: string, end: string, testid: string='', patientId: string='', patientname: string = ''): void {
    this.startDay = start;
    this.endDay = end;
    this.testId = testid;
    this.patientid = patientId;
    this.patientname = patientname;
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');

    this.service.igtcrListsSearch(start, end).subscribe((data: IPatient[]) => {
      if (data.length) {
        this.lists = data;
        console.log(this.lists);
      }

    });


}


processingStatus(i: number): string {
  const status = this.lists[i].screenstatus;
  const filename = this.lists[i].tsvFilteredFilename;
  if (parseInt(status, 10) === 0 && filename.length) {
    return '시작';
  } else if (parseInt(status, 10) === 1) {
    return '스크린완료';
  } else if (parseInt(status, 10) === 2) {
    return '판독완료';
  } else if (parseInt(status, 10) === 3) {
    return '전송완료';
  } else if (parseInt(status, 10) === 5) {
    return '접수취소';
  } else {
    return '접수';
  }
}

  // tslint:disable-next-line: typedef
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



}
