import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';



@Injectable({
  providedIn: 'root',
})
export class OutlinkService {
  private apiUrl = emrUrl;
  constructor(private http: HttpClient) { }

  search(start: string, end: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report_xml/list`, { start, end, gubun: 'path' });
  }
}



@Component({
  selector: 'app-ngsexcel',
  templateUrl: './ngsexcel.component.html',
  styleUrls: ['./ngsexcel.component.scss']
})
export class NgsexcelComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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
    console.log('[search]', start, end);
  }



}
