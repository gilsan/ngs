import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IManageUsers } from 'src/app/home/models/manageUsers';
import { ManageUsersService } from 'src/app/home/services/manageUsers.service';
import * as moment from 'moment';
@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {

  lists$: Observable<IManageUsers[]>;
  lists: IManageUsers[];
  listManageUsers: IManageUsers[];
  manageUsers: IManageUsers;

  curPage: number;
  totPage: number;
  pageLine: number;
  totRecords: number;

  startday: string;
  endday: string;
  storeStartDay: string;
  storeEndDay: string;


  constructor(
    private manageUsersService: ManageUsersService
  ) { }

  ngOnInit(): void {
    // if (this.storeStartDay === null || this.storeEndDay === null) {
    this.init();
    // }
  }


  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    return now;
  }

  startToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth();  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log('[' + date + '][' + now + '][' + this.storeStartDay + ']');
    if (this.storeStartDay) {
      return this.storeStartDay;
    }
    return now;
  }

  startToday2(): string {
    const oneMonthsAgo = moment().subtract(3, 'months');
    // console.log(oneMonthsAgo.format('YYYY-MM-DD'));
    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');
    // console.log('[63][오늘날자]년[' + yy + ']월[' + mm + ']일[' + dd + ']');
    const now1 = yy + '-' + mm + '-' + dd;
    return now1;
  }

  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    if (this.storeEndDay) {
      return this.storeEndDay;
    }
    return now;
  }

  init(): void {

    this.search(this.startToday2(), this.endToday(), '', '');
  }

  goPage(page: string): void {
    if (page === "<" && this.pageLine > 0) {
      this.pageLine--;
      this.curPage = this.pageLine * 10 - 1;
      if (this.curPage < 1) this.curPage = 1;
    } else if (page === ">" && this.pageLine < Math.ceil(this.totPage / 10) - 1) {
      this.pageLine++;
      this.curPage = this.pageLine * 10 + 1;
    } else {
      if (page != "<" && page != ">")
        this.curPage = Number(page);
    }
    page = this.curPage + "";
    this.lists = this.listManageUsers.slice((Number(page) - 1) * 10, (Number(page)) * 10);
  }

  search(startDay: string, endDay: string, userId: string, userNm: string): void {
    this.totRecords = 0;
    this.lists$ = this.manageUsersService.getManageUsersList(startDay, endDay, userId, userNm, 'P');
    this.lists$.subscribe((data) => {
      console.log('[170][Users 검색]', data);
      this.listManageUsers = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listManageUsers.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listManageUsers.length;
    });
  }

  confirm(id: string, approved: string): void {
    //  debugger;
    let approve = (approved == "Y" ? "승인" : "미승인");
    let result = confirm(approve + " 하시겠습니까?");
    if (result == true) {
      this.lists$ = this.manageUsersService.setManageUsersApproved(id, approved);
      this.lists$.subscribe((data) => {
        alert("정상 처리 되었습니다.");
      });
    }
    this.init();
  }

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }


}
