import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';
@Component({
  selector: 'app-main-lists',
  templateUrl: './mainLists.component.html',
  styleUrls: ['./mainLists.component.scss']
})
export class MainListsComponent implements OnInit {


  startday = '';
  endday = '';
  testId = '';
  patientname = '';
  patientid = '';


  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {

  }



  sheet(): void {
    this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet']);
  }



  search(start: string, end: string, testid: string, patientId: string, patientname: string = ''): void {
        this.startday = start;
        this.endday = end;
        this.testId = testid;
        this.patientid = patientId;
        this.patientname = patientname;
        const startdate = start.toString().replace(/-/gi, '');
        const enddate = end.toString().replace(/-/gi, '');


    }

  // tslint:disable-next-line: typedef
  today() {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    // const date = today.getDate();  // 날짜
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + day).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    // if (this.storeStartDay) {
    //   return this.storeStartDay;
    // }
    return now;
  }

  startToday(): string {
    const oneMonthsAgo = moment().subtract(3, 'months');

    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');

    const now1 = yy + '-' + mm + '-' + dd;
    // if (this.storeStartDay) {
    //   return this.storeStartDay;
    // }
    return now1;
  }



}
