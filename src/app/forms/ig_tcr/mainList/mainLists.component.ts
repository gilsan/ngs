import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';
import { IPatient } from 'src/app/home/models/patients';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { IgtcrService } from '../igtcr.services';
import { ResearchDialogComponent } from './research-dialog/researchTcr.component';
import { IGTStoreService } from '../store';
@Component({
  selector: 'app-main-lists',
  templateUrl: './mainLists.component.html',
  styleUrls: ['./mainLists.component.scss']
})
export class MainListsComponent implements OnInit {


  startDay = this.startToday();
  endDay = this.endToday();
  specimenNo = '';
  patientname = '';
  patientid = '';
  lists: IPatient[] = [];

  select0 = false;
  select1 = false;
  select2 = false;
  select3 = false;
  select5 = false;
  select10 = false;
  select100 = false;
  lpeall = false;
  lpe555 = false;
  lpe556 = false;
  lpe557 = false;
  researchTOTAL = false;
  researchDiag = false;
  researchResearch = false;

  @ViewChild('testedID', { static: true }) testedID: ElementRef;
  @ViewChild('patientID', { static: true }) patientID: ElementRef;
  @ViewChild('patientName', { static: true }) patientName: ElementRef;
  @ViewChild('start', { static: true }) start: ElementRef;
  @ViewChild('end', { static: true }) end: ElementRef;

  constructor(
    private router: Router,
    public service: IgtcrService,
    public dialog: MatDialog,
    public storeService: IGTStoreService,
    
  ) {}

  ngOnInit(): void {
   // this.search(this.startDay, this.endDay);
   const storeData = this.storeService.mainListSearchGet() ;
    // console.log('[ngOnInit]', storeData);
   if (storeData.length > 0) {
    this.testedID.nativeElement.value = storeData[0].specimenNo;
    this.patientID.nativeElement.value = storeData[0].patientid;
    this.patientName.nativeElement.value = storeData[0].patientname;

    this.selectOption(storeData[0].status);
    this.sheetOption(storeData[0].sheet);
    this.researchOption(storeData[0].research1);

    this.startDay = storeData[0].start;
    this.endDay = storeData[0].end;

    this.search(storeData[0].start, storeData[0].end, storeData[0].specimenNo, storeData[0].patientid,
    storeData[0].patientname, storeData[0].status === '100' ? '' : storeData[0].status,
     storeData[0].sheet === '100'? '':storeData[0].sheet,  storeData[0].research1 === '100' ? '' : storeData[0].research1);
   } else {
    this.search(this.startDay, this.endDay);
   }
  }



  sheet(): void {
    this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet']);
  }

  goReporter(i: number, type: string) {
   // console.log(this.lists[i]);
    this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet', type,i]);
    // this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet', this.lists[i].test_code,i]);

  }


  search(start: string, end: string, specimenNo: string='', patientId: string='', patientname: string = '',
  status: string = '', sheet: string = '', research1: string = ''): void {
    this.startDay = start;
    this.endDay = end;
    this.specimenNo = specimenNo;
    this.patientid = patientId;
    this.patientname = patientname;
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');

    this.storeService.mainListSearchSet(start, end,this.specimenNo, this.patientid, patientname, status, sheet, research1);

    this.service.igtcrListsSearch(start, end,this.specimenNo, this.patientid, patientname, status, sheet, research1).subscribe((data: IPatient[]) => {
      if (data.length) {
        
        this.lists = data;
      } else {
        this.lists = [];
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
    return 'PDF저장';
  } else if (parseInt(status, 10) === 5) {
    return '접수취소';
  } else {
    return '접수';
  }
}

  // tslint:disable-next-line: typedef
  setStartDate(date: string): void {
    this.startDay = date;
  }

  setEndDate(date: string): void {
    this.endDay = date;
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

      ////////// 연구용
      openDialog(): void {
        const dialogConfig = new MatDialogConfig();
  
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxWidth = '100vw';
        dialogConfig.maxHeight = '100vh';
        const dialogRef = this.dialog.open(ResearchDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(data => {
         // this.checkStore();
         console.log('[Dialog...]');
        });
      }

          // 메뉴 SCREEN STATUS선택옵션
          selectOption(status: string): void {
            this.select0 = false;
            this.select1 = false;
            this.select2 = false;
            this.select3 = false;
            this.select5 = false;
            this.select10 = false;
            this.select100 = false;
            if (parseInt(status, 10) === 0) {
              this.select0 = true;
            } else if (parseInt(status, 10) === 1) {
              this.select1 = true;
            } else if (parseInt(status, 10) === 2) {
              this.select2 = true;
            } else if (parseInt(status, 10) === 3) {
              this.select3 = true;
            } else if (parseInt(status, 10) === 5) {
              this.select5 = true;
            } else if (status === 'register' || parseInt(status, 10) === 10) {
              this.select10 = true;
            } else if (parseInt(status, 10) === 100) {
              this.select100 = true;
            }
          }
  
          sheetOption(sheet: string): void {
            this.lpeall = false;
            this.lpe555 = false;
            this.lpe556 = false;
            this.lpe557 = false;
            if (sheet === '100') {
              this.lpeall = true;
            } else if (sheet === 'LPE555') {
              this.lpe555 = true;
            } else if (sheet === 'LPE556') {
              this.lpe556 = true;
            } else if (sheet === 'LPE557') {
              this.lpe557 = true;
            }
          }
  
          researchOption(research: string): void {
            this.researchDiag = false;
            this.researchResearch = false;
            this.researchTOTAL = false;
            if (research === 'diag') {
              this.researchDiag = true;
            } else if (research === 'RESEARCH') {
              this.researchResearch = true;
            } else if (research === 'TOTAL') {
              this.researchTOTAL = true;
            }
          }
  


}
