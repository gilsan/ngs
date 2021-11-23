import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { DashboardService } from '../../services/dashboard.service';
import { PatientsListService } from '../../services/patientslist';

export interface IBOARD {
  type: string;
  register: number;
  start: number;
  screenread: number;
  screenfinish: number;
  emrsend: number;
}

export interface ILIST {
  type: string;
  code: string;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  types = ['AMLALL', 'MDS', 'Genetic', 'LYM', 'SEQ', 'MLPA'];
  lists: ILIST[] = [];
  board: IBOARD[] = [];

  constructor(
    private patientsList: PatientsListService,
    private codeDefaultValueService: CodeDefaultValue,
    private dashboardService: DashboardService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.makeBoard();
    this.collections();
  }

  makeBoard(): void {
    this.types.forEach(type => {
      this.board.push({ type, register: 0, start: 0, screenread: 0, screenfinish: 0, emrsend: 0 });
    });
  }

  collections(): void {
    this.codeDefaultValueService.getLists().subscribe(data => {
      data.forEach(item => {
        this.lists.push({ type: item.type, code: item.code });
      });
      // console.log(this.lists);

      this.patientsList.boardSearch(this.threemonthage(), this.today())
        .subscribe(item => {
          // console.log(data);
          const temp = this.lists.filter(list => list.code === item.test_code);
          this.split(temp[0].type, item.screenstatus);
        },
          err => console.log(err),
          () => {
            // console.log(this.board);
          });
    })

  }

  split(type: string, status: string): void {
    if (type === 'AMLALL') {
      this.counter(type, status);
    } else if (type === 'LYM') {
      this.counter(type, status);
    } else if (type === 'MDS') {
      this.counter(type, status);
    } else if (type === 'Genetic') {
      this.counter(type, status);
    } else if (type === 'SEQ') {
      this.counter(type, status);
    } else if (type === 'MLPA') {
      this.counter(type, status);
    }
  }

  counter(type: string, status: string): void {
    if (status === '') {
      const idx = this.board.findIndex(item => item.type === type);
      this.board[idx].register++;
    } else if (parseInt(status, 10) === 0) {
      const idx = this.board.findIndex(item => item.type === type);
      this.board[idx].start++;
    } else if (parseInt(status, 10) === 1) {
      const idx = this.board.findIndex(item => item.type === type);
      this.board[idx].screenread++;
    } else if (parseInt(status, 10) === 2) {
      const idx = this.board.findIndex(item => item.type === type);
      this.board[idx].screenfinish++;
    } else if (parseInt(status, 10) === 3) {
      const idx = this.board.findIndex(item => item.type === type);
      this.board[idx].emrsend++;
    }
  }


  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + newmon + + newday;

    return now;
  }

  threemonthage(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1 - 3;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + newmon + + newday;

    return now;
  }

  getCount(type: string, status: string): number {
    const idx = this.board.findIndex(item => item.type === type);
    const temp = this.board[idx];
    if (status === 'register') {
      return temp.register;
    } else if (status === 'start') {
      return temp.start;
    } else if (status === 'screenread') {
      return temp.screenread;
    } else if (status === 'screenfinish') {
      return temp.screenfinish;
    }
    return temp.emrsend;
  }

  goResult(type: string, subtype: string): void {
    this.dashboardService.dashBoardSetParmas(type, subtype);
    if (type === 'AMLALL') {
      this.router.navigate(['/diag', 'amlall', subtype]);
    } else if (type === 'LYM') {
      this.router.navigate(['/diag', 'lymphoma', subtype]);
    } else if (type === 'MDS') {
      this.router.navigate(['/diag', 'mdsmpn', subtype]);
    } else if (type === 'Genetic') {
      this.router.navigate(['/diag', 'hereditary', subtype]);
    } else if (type === 'SEQ') {
      this.router.navigate(['/diag', 'sequencing', subtype]);
    } else if (type === 'MLPA') {
      this.router.navigate(['/diag', 'mlpa', subtype]);
    }

  }



}
