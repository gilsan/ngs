import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { EChartsOption } from 'echarts';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-typestatics',
  templateUrl: './typestatics.component.html',
  styleUrls: ['./typestatics.component.scss']
})
export class TypestaticsComponent implements OnInit, OnDestroy {

  startday: string;
  endday: string;
  storeStartDay: string;
  storeEndDay: string;

  chartOption: EChartsOption = {
    xAxis: {},
    yAxis: {},
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    series: [{
      symbolSize: 20,
      data: [
        [10.0, 8.04],
        [8.07, 6.95],
        [13.0, 7.58],
        [9.05, 8.81],
        [11.0, 8.33],
        [14.0, 7.66],
        [13.4, 6.81],
        [10.0, 6.33],
        [14.0, 8.96],
        [12.5, 6.82],
        [9.15, 7.20],
        [11.5, 7.20],
        [3.03, 4.23],
        [12.2, 7.83],
        [2.02, 4.47],
        [1.05, 3.33],
        [4.05, 4.96],
        [6.03, 7.24],
        [12.0, 6.26],
        [12.0, 8.84],
        [7.08, 5.82],
        [5.02, 5.68]
      ],
      type: 'scatter'
    }]
  };


  private subs = new SubSink();


  constructor(
    private patientsList: PatientsListService,
  ) { }

  ngOnInit(): void {
    this.getPatientsList();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getPatientsList(): void {
    this.subs.sink = this.patientsList.search('20210527', '20210827', '', '', '', '')
      .subscribe(data => {
        console.log(data);
      });
  }



  startToday(): string {
    const today = new Date();
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));	// 한달 전

    const year = oneMonthAgo.getFullYear(); // 년도
    const month = oneMonthAgo.getMonth() + 1;  // 월
    const date = oneMonthAgo.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;

    if (this.storeStartDay) {
      return this.storeStartDay;
    }
    return now;
  }

  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    if (this.storeEndDay) {
      return this.storeEndDay;
    }
    return now;
  }

  search(startDay: string, endDay: string, userId: string): void {


  }




}
