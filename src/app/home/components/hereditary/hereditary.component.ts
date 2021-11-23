import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreGENService } from 'src/app/forms/store.current.her';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { geneTitles, geneLists } from 'src/app/forms/commons/geneList';

import { TestCodeTitleService } from 'src/app/home/services/testCodeTitle.service';
import { HereDialogComponent } from './here-dialog/here-dialog.component';

@Component({
  selector: 'app-hereditary',
  templateUrl: './hereditary.component.html',
  styleUrls: ['./hereditary.component.scss']
})
export class HereditaryComponent implements OnInit, AfterViewInit, OnDestroy {

  private subs = new SubSink();
  lists$: Observable<IPatient[]>;
  lists: IPatient[] = [];
  tempLists: IPatient[] = [];
  specimenNo = '';
  patientID = '';
  isVisible = true;
  startday = '';
  endday = '';
  specimenno = '';
  patientid = '';
  status = ''; // 시작, 스크린판독, 판독완료, EMR전송
  sheet = ''; // AML ALL LYN MDS

  storeStartDay: string;
  storeEndDay: string;
  storePatientID: string;
  storeSpecimenID: string;

  private apiUrl = emrUrl;

  hereditaryLists = geneLists;
  listHereditary = geneTitles;
  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;

  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private store: StoreGENService,
    private sanitizer: DomSanitizer,
    private titleService: TestCodeTitleService,
    public dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    this.checkStore();
    if (this.storeStartDay === null || this.storeEndDay === null) {
      this.init();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const scrolly = this.store.getScrollyPosition();
      this.dbox100.nativeElement.scrollTop = scrolly;
    }, 300);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    this.patientsList.getPatientList2()
      .then(response => response.json())
      .then(data => {
        console.log('[79]', data);
        this.patientsList.setPatientID(data);
        this.lists = data;
      });
    // this.lists$ = this.patientsList.getPatientList();
    // this.subs.sink = this.lists$
    //   .pipe(
    //     switchMap(item => of(item)),
    //     switchMap(list => from(list)),
    //     tap(list => console.log(list)),
    //     filter(list => this.hereditaryLists.includes(list.test_code)),
    //     tap(list => console.log(list)),
    //   )
    //   .subscribe((data) => {
    //     this.lists.push(data);
    //   });
  }

  scrollPosition(): void {
    setTimeout(() => {
      const scrolly = this.store.getScrollyPosition();
      this.dbox100.nativeElement.scrollTop = scrolly;
    }, 1000);
  }

  onSelected(): void {
    // 리스트 업데이트 함
    this.lists = [];

    if (this.startday.length && this.endday.length) {
      this.search(this.startday, this.endday, this.specimenno, this.patientid);
    } else {
      this.init();
    }
    this.isVisible = true;
    this.scrollPosition();
  }

  onCanceled(): void {
    this.isVisible = true;
  }
  // tslint:disable-next-line: typedef
  goUploadpage(specimenNo: string, patientid: string) {
    this.specimenNo = specimenNo;
    this.patientID = patientid;
    this.store.setPatientID(patientid);
    this.store.setSpecimentNo(specimenNo);
    // this.router.navigate(['/diag', 'fileupload', specimenNo]);  // 기존
    this.isVisible = !this.isVisible;  // 신규
  }

  // tslint:disable-next-line: typedef
  goReporter(i: number) {
    const specimenno = this.store.getSpecimenNo();

    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL
    this.router.navigate(['/diag', 'hereditary', 'form6', this.lists[i].test_code]);
  }

  goDirect(i): void {
    const specimenno = this.store.getSpecimenNo();
    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL
    this.router.navigate(['/diag', 'hereditary', 'form6', 'direct']);
  }



  goReporterClass(idx: number): any {
    const specimenno = this.store.getSpecimenNo();
    // console.log('[154][main][goReporterClass]', idx, pathNum);
    if (this.lists[idx].specimenNo === specimenno) {
      return { btn_report: true };
    } else {
      return { btn_report: false };
    }
  }

  // tslint:disable-next-line: typedef
  getDate(event) {
    // console.log(event.toString().replace(/-/gi, ''));
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
    if (this.storeStartDay) {
      return this.storeStartDay;
    }
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

  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;

    // if (this.storeEndDay) {
    //   return this.storeEndDay;
    // }
    return now;
  }

  getUrl(list: IPatient, type: string): SafeResourceUrl {

    const irpath = list.path;
    const irfilename = list.tsvFilteredFilename;
    const irurl = this.apiUrl + '/download?path=' + irpath + '&filename=' + irfilename;
    return this.sanitizer.bypassSecurityTrustResourceUrl(irurl);

  }

  checkStore(): void {
    this.storeStartDay = this.store.getSearchStartDay();
    this.storeEndDay = this.store.getSearchEndDay();
    this.storePatientID = this.store.getamlPatientID();
    this.storeSpecimenID = this.store.getamlSpecimenID();
    this.status = this.store.getStatus();
    this.sheet = this.store.getSheet();
    const whichstate = this.store.getWhichstate();

    this.startday = this.storeStartDay;
    this.endday = this.storeEndDay;
    this.specimenno = this.storeSpecimenID;
    this.patientid = this.storePatientID;


    this.lists = [];
    if (whichstate === 'searchscreen') {
      this.search(this.storeStartDay, this.storeEndDay, this.storeSpecimenID, this.storePatientID, this.status, this.sheet);
    } else if (whichstate === 'mainscreen') {
      this.search(this.startToday(), this.endToday(), '', '');
    }


  }

  // tslint:disable-next-line: typedef
  search(start: string, end: string, specimenNo: string, patientId: string, status: string = '', sheet: string = '') {
    this.startday = start;
    this.endday = end;
    this.specimenno = specimenNo;
    this.patientid = patientId;
    this.status = status;
    this.sheet = sheet;

    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setamlSpecimenID(specimenNo);
    this.store.setamlPatientID(patientId);
    this.store.setStatus(status);
    this.store.setSheet(sheet);
    this.store.setWhichstate('searchscreen');
    this.lists = [];

    //
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');
    // console.log('[97][진검검색]', startdate, enddate, specimenNo, patientId);

    if (patientId !== undefined) {
      patientId = patientId.trim();
    }
    if (specimenNo !== undefined) {
      specimenNo = specimenNo.trim();
    }
    this.patientsList.hereditarySearch2(startdate, enddate, patientId, specimenNo, status, sheet)
      .then(response => response.json())
      .then(data => {
        this.patientsList.setPatientID(data);
        data.sort((a, b) => {
          if (a.accept_date > b.accept_date) { return -1; }
          if (a.accept_date === b.accept_date) { return 0; }
          if (a.accept_date < b.accept_date) { return 1; }
        });
        this.lists = data;
        this.tempLists = data;
        this.patientID = '';
        this.specimenNo = '';
      });

    // this.lists$ = this.patientsList.hereditarySearch(startdate, enddate, patientId, specimenNo, status, sheet);
    // this.subs.sink = this.lists$
    //   .pipe(
    //     switchMap(item => of(item)),
    //     switchMap(list => from(list)),
    //     filter(list => this.hereditaryLists.includes(list.test_code)),
    //     // tap(list => console.log(list)),
    //   ).subscribe((data: any) => {
    //     if (data.reportTitle === '') {
    //       const title = this.titleService.getMltaTitle(data.test_code);
    //       if (title !== 'None') {
    //         data.reportTitle = title;
    //       }

    //     }
    //     this.lists.push(data);
    //     this.patientID = '';
    //     this.specimenNo = '';
    //   });

  }
  // 환자ID
  getPatientID(id: string): void {
    this.patientID = id;
  }
  // 검체 ID
  getTestedID(id: string): void {
    this.specimenNo = id;
  }

  processingStatus(i: number): string {
    const status = this.lists[i].screenstatus;
    const filename = this.lists[i].tsvFilteredFilename;
    // console.log('[317] ==>', this.lists);
    if (parseInt(status, 10) === 0) {
      return '시작';
    } else if (parseInt(status, 10) === 1) {
      return '스크린완료';
    } else if (parseInt(status, 10) === 2) {
      return '판독완료';
    } else if (parseInt(status, 10) === 3) {
      return '전송완료';
    } else if (parseInt(status, 10) === 5) {
      return '접수취소';
    }
    return;
  }

  isDisabled(i: number): boolean {
    const status = this.lists[i].screenstatus;
    const filename = this.lists[i].tsvFilteredFilename;
    if (parseInt(status, 10) === 0 && filename.length) {
      return false;
    } else if (parseInt(status, 10) === 1) {
      return false;
    } else if (parseInt(status, 10) === 2) {
      return false;
    } else if (parseInt(status, 10) === 3) {
      return true;
    }
  }

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }

  showReport(testCode: string): boolean {
    // console.log('[353][]', testCode, this.hereditaryLists)
    if (this.hereditaryLists.includes(testCode)) {
      return false;
    }
    return true;
  }

  processingSatus(testCode: string): boolean {
    if (this.hereditaryLists.includes(testCode)) {
      return true;
    }
    const result = geneTitles.findIndex(item => item.gene === testCode);
    if (result !== -1) {
      return true;
    }
    return false;
  }

  ////////// 연구용
  openDialog(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth = '100vw';
    dialogConfig.maxHeight = '100vh';
    const dialogRef = this.dialog.open(HereDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      this.checkStore();
    });
  }

  newList(type: string): IPatient[] {
    this.lists = [];
    if (type === 'TOTAL') {
      this.lists = this.tempLists;
      return this.lists;
    } else if (type === 'PATIENT') {
      this.lists = this.tempLists.filter(list => list.gbn !== 'RESEARCH');
    } else if (type === 'RESEARCH') {
      this.lists = this.tempLists.filter(list => list.gbn === 'RESEARCH');
    }
  }



}
