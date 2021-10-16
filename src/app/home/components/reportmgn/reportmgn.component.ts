import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';
import { ReportService } from './reportmgn.service';
import { SubSink } from 'subsink';

export interface Result {
  type: string;
  checker: string;
  reader: string;
}

@Component({
  selector: 'app-reportmgn',
  templateUrl: './reportmgn.component.html',
  styleUrls: ['./reportmgn.component.scss']
})
export class ReportmgnComponent implements OnInit, OnDestroy {

  amlChecker = '';
  amlReader = '';
  lymChecker = '';
  lymReader = '';
  mdsChecker = '';
  mdsReader = '';
  genChecker = '';
  genReader = '';
  seqChecker = '';
  seqReader = '';
  mlpaChecker = '';
  mlpaReader = '';

  private subs = new SubSink();

  constructor(
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.subs.sink = this.reportService.getLists()
      .subscribe((data: Result[]) => {
        this.displayReaderChecker(data);
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  save(type: string, checker: string, reader: string): void {
    this.reportService.getListUpdate(type, checker, reader)
      .subscribe(data => {
        alert('저장 하였습니다.');
      });
  }

  retrive(type: string): void {
    const lists$ = this.reportService.getDiagList();

    this.subs.sink = lists$.pipe(
      map(lists => lists.filter(list => list.part === 'D'))
    ).subscribe(data => {
      const len = data.length - 1;
      let reader = '';
      data.forEach((list, index) => {
        if (index === len) {
          reader = reader + list.user_nm + ' M.D.';
        } else {
          reader = reader + list.user_nm + ' M.D./';
        }
      });
      this.displayReader(type, reader);

    });

    this.subs.sink = lists$.pipe(
      map(lists => lists.filter(list => list.part === 'T'))
    ).subscribe(data => {
      const len = data.length - 1;
      let checker = '';
      data.forEach((list, index) => {
        if (index === len) {
          checker = checker + list.user_nm + ' M.T.';
        } else {
          checker = checker + list.user_nm + ' M.T./';
        }
      });
      this.displayChecker(type, checker);
    });


  }

  displayChecker(type: string, checker: string): void {
    if (type === 'AMLALL') {
      this.amlChecker = checker;
    } else if (type === 'LYM') {
      this.lymChecker = checker;
    } else if (type === 'MDS') {
      this.mdsChecker = checker;
    } else if (type === 'Genetic') {
      this.genChecker = checker;
    } else if (type === 'SEQ') {
      this.seqChecker = checker;
    } else if (type === 'MLPA') {
      this.mlpaChecker = checker;
    }
  }

  displayReader(type: string, reader: string): void {
    if (type === 'AMLALL') {
      this.amlReader = reader;
    } else if (type === 'LYM') {
      this.lymReader = reader;
    } else if (type === 'MDS') {
      this.mdsReader = reader;
    } else if (type === 'Genetic') {
      this.genReader = reader;
    } else if (type === 'SEQ') {
      this.seqReader = reader;
    } else if (type === 'MLPA') {
      this.mlpaReader = reader;
    }
  }

  displayReaderChecker(result: Result[]): void {
    result.forEach(list => {
      if (list.type === 'AMLALL') {
        this.amlChecker = list.checker;
        this.amlReader = list.reader;
      } else if (list.type === 'LYM') {
        this.lymChecker = list.checker;
        this.lymReader = list.reader;
      } else if (list.type === 'MDS') {
        this.mdsChecker = list.checker;
        this.mdsReader = list.reader;
      } else if (list.type === 'Genetic') {
        this.genChecker = list.checker;
        this.genReader = list.reader;
      } else if (list.type === 'SEQ') {
        this.seqChecker = list.checker;
        this.seqReader = list.reader;
      } else if (list.type === 'MLPA') {
        this.mlpaChecker = list.checker;
        this.mlpaReader = list.reader;
      }
    })

  }














}
