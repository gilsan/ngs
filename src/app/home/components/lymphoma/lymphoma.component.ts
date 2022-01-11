import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreLYMService } from 'src/app/forms/store.current.lym';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { geneTitles } from 'src/app/forms/commons/geneList';

import { TestCodeTitleService } from 'src/app/home/services/testCodeTitle.service';
import { LymDialogComponent } from './lym-dialog/lym-dialog.component';

export const lymphomaLists = [
  'LPE474', 'LPE475'
];

@Component({
  selector: 'app-lymphoma',
  templateUrl: './lymphoma.component.html',
  styleUrls: ['./lymphoma.component.scss']
})
export class LymphomaComponent implements OnInit, AfterViewInit, OnDestroy {

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
  receivedType = 'none';
  private apiUrl = emrUrl;
  lselect10 = false;
  lselect0 = false;
  lselect1 = false;
  lselect2 = false;
  lselect3 = false;
  lselect5 = false;
  lselect100 = false;
  lsheetlymphoma = false;
  lsheetLPE474 = false;
  lsheetLPE475 = false;
  lresearchTOTAL = false;
  lresearchDiag = false;
  lresearchResearch = false;

  lstartDay = this.startToday();
  lendDay = this.endToday();

  @ViewChild('lymTestedID', { static: true }) testedID: ElementRef;
  @ViewChild('lymPatient', { static: true }) patient: ElementRef;
  @ViewChild('lymStatus', { static: true }) screenstatus: ElementRef;
  @ViewChild('lymSheet', { static: true }) amlallsheet: ElementRef;
  @ViewChild('lymResearch', { static: true }) research: ElementRef;
  @ViewChild('lymStart', { static: true }) start: ElementRef;
  @ViewChild('lymEnd', { static: true }) end: ElementRef;

  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;

  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreLYMService,
    private sanitizer: DomSanitizer,
    private titleService: TestCodeTitleService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      filter(data => data !== null || data !== undefined),
      map(route => route.get('type'))
    ).subscribe(data => {
      if (data !== null) {
        this.receivedType = data;

        if (parseInt(this.receivedType, 10) === 0) {
          this.lselect0 = true;
        } else if (parseInt(this.receivedType, 10) === 1) {
          this.lselect1 = true;
        } else if (parseInt(this.receivedType, 10) === 2) {
          this.lselect2 = true;
        } else if (parseInt(this.receivedType, 10) === 3) {
          this.lselect3 = true;
        } else if (this.receivedType === 'register') {
          this.lselect10 = true;
        }

      }
    });

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

  selectOption(status: string): void {
    this.lselect10 = false;
    this.lselect0 = false;
    this.lselect1 = false;
    this.lselect2 = false;
    this.lselect3 = false;
    this.lselect5 = false;
    this.lselect100 = false;
    if (parseInt(status, 10) === 0) {
      this.lselect0 = true;
    } else if (parseInt(status, 10) === 1) {
      this.lselect1 = true;
    } else if (parseInt(status, 10) === 2) {
      this.lselect2 = true;
    } else if (parseInt(status, 10) === 3) {
      this.lselect3 = true;
    } else if (parseInt(status, 10) === 5) {
      this.lselect5 = true;
    } else if (status === 'register' || parseInt(status, 10) === 10) {
      this.lselect10 = true;
    } else if (parseInt(status, 10) === 100) {
      this.lselect100 = true;
    }
    if (this.receivedType !== 'none') {
      this.receivedType = status;
    }
  }

  sheetOption(sheet: string): void {
    this.lsheetlymphoma = false;
    this.lsheetLPE474 = false;
    this.lsheetLPE475 = false;
    if (sheet === 'lymphoma') {
      this.lsheetlymphoma = true;
    } else if (sheet === 'LPE474') {
      this.lsheetLPE474 = true;
    } else if (sheet === 'LPE475') {
      this.lsheetLPE475 = true;
    }
  }

  researchOption(research: string): void {
    this.lresearchTOTAL = false;
    this.lresearchDiag = false;
    this.lresearchResearch = false;
    if (research === 'diag') {
      this.lresearchDiag = true;
    } else if (research === 'RESEARCH') {
      this.lresearchResearch = true;
    } else if (research === 'TOTAL') {
      this.lresearchTOTAL = true;
    }
  }


  init(): void {
    this.lists$ = this.patientsList.getPatientList();
    this.subs.sink = this.lists$
      .pipe(
        switchMap(item => of(item)),
        switchMap(list => from(list)),
        filter(list => lymphomaLists.includes(list.test_code)),
      )
      .subscribe((data) => {
        // console.log(data);
        this.lists.push(data);
        console.log('[mainscreen][환자정보]', this.lists);
      });
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
    this.isVisible = !this.isVisible;  // 신규
  }

  // tslint:disable-next-line: typedef
  goReporter(i: number) {
    const testedID = this.testedID.nativeElement.value;
    const patient = this.patient.nativeElement.value;
    const status = this.screenstatus.nativeElement.value;
    const sheet = this.amlallsheet.nativeElement.value;
    const research = this.research.nativeElement.value;
    const start = this.start.nativeElement.value;
    const end = this.end.nativeElement.value;
    if (this.receivedType !== 'none') {
      this.receivedType = status;
    }
    this.store.setSpecimentNo(testedID);
    this.store.setPatientID(patient);
    this.store.setStatus(status);
    this.store.setSheet(sheet);
    this.store.setResearch(research);
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setReceivedType(this.receivedType);

    ////////////////////////////////////////////////////////////////
    const specimenno = this.store.getSpecimenNo();

    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL

    this.router.navigate(['/diag', 'lymphoma', 'form3', this.lists[i].test_code, this.receivedType]);

  }

  goReporterClass(idx: number): any {
    const specimenno = this.store.getSpecimenNo();

    if (this.lists[idx].specimenNo === specimenno) {
      return { btn_report: true };
    } else {
      return { btn_report: false };
    }
  }

  // tslint:disable-next-line: typedef
  setStartDate(date: string): void {
    this.lstartDay = date;
  }

  setEndDate(date: string): void {
    this.lendDay = date;
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

  getUrl(list: IPatient, type: string): SafeResourceUrl {

    const irpath = list.path;
    const irfilename = list.tsvFilteredFilename;
    const irurl = this.apiUrl + '/download?path=' + irpath + '&filename=' + irfilename;
    return this.sanitizer.bypassSecurityTrustResourceUrl(irurl);

  }

  checkStore(): void {
    // this.storeStartDay = this.store.getSearchStartDay();
    // this.storeEndDay = this.store.getSearchEndDay();
    // this.storePatientID = this.store.getamlPatientID();
    // this.storeSpecimenID = this.store.getamlSpecimenID();
    // this.status = this.store.getStatus();
    // this.sheet = this.store.getSheet();
    // const whichstate = this.store.getWhichstate();
    const storeSpecimenID = this.store.getamlSpecimenID();
    const storePatientID = this.store.getamlPatientID();
    const status = this.store.getStatus();
    const sheet = this.store.getSheet();
    const storeStartDay = this.store.getSearchStartDay();
    const storeEndDay = this.store.getSearchEndDay();
    const research = this.store.getResearch();
    const whichstate = this.store.getWhichstate();
    const receivedType = this.store.getReceivedType();

    if (storeSpecimenID.length !== 0) {
      this.storeSpecimenID = storeSpecimenID;
      this.testedID.nativeElement.value = this.storeSpecimenID;
    }

    if (storePatientID.length !== 0) {
      this.storePatientID = storePatientID;
      this.patient.nativeElement.value = this.storePatientID;
    }

    if (status.length !== 0) {
      if (this.receivedType !== 'none') {
        this.receivedType = status;
      }
      // this.screenstatus.nativeElement.value = this.status;
      this.selectOption(status);
    }

    if (sheet.length !== 0) {
      // this.sheet = sheet;
      // this.amlallsheet.nativeElement.value = this.sheet;
      this.sheetOption(sheet);
    }

    if (storeStartDay.length !== 0) {
      this.storeStartDay = storeStartDay;
      this.lstartDay = storeStartDay;
    }

    if (storeEndDay.length !== 0) {
      this.storeEndDay = storeEndDay;
      this.lendDay = storeEndDay;
    }

    if (research.length !== 0) {
      this.research.nativeElement.value = research;
      this.researchOption(research);
    }

    if (receivedType.length !== 0) {
      this.receivedType = receivedType;
    }



    this.startday = this.storeStartDay;
    this.endday = this.storeEndDay;
    this.specimenno = this.storeSpecimenID;
    this.patientid = this.storePatientID;


    this.lists = [];
    if (whichstate === 'searchscreen') {
      this.search(storeStartDay.replace(/-/g, ''), storeEndDay.replace(/-/g, ''),
        storeSpecimenID, storePatientID, status, sheet, research);
      // this.search(this.storeStartDay, this.storeEndDay, this.storeSpecimenID, this.storePatientID, this.status, this.sheet);
    } else if (whichstate === 'mainscreen') {
      if (storeStartDay.length && storeEndDay.length) {
        this.search(storeStartDay.replace(/-/g, ''), storeEndDay.replace(/-/g, ''),
          storeSpecimenID, storePatientID, status, sheet, research);
      } else {
        this.search(this.startToday(), this.endToday(), '', '');
      }
      // this.search(this.startToday(), this.endToday(), '', '');
    }
  }

  // tslint:disable-next-line: typedef
  search(start: string, end: string, specimenNo: string, patientId: string,
    status: string = '', sheet: string = '', research: string = '') {
    this.startday = start;
    this.endday = end;
    this.specimenno = specimenNo;
    this.patientid = patientId;
    this.status = status;
    this.sheet = sheet;

    // this.store.setSearchStartDay(start);
    // this.store.setSearchEndDay(end);
    // this.store.setamlSpecimenID(specimenNo);
    // this.store.setamlPatientID(patientId);
    // this.store.setStatus(status);
    // this.store.setSheet(sheet);
    // this.store.setWhichstate('searchscreen');
    console.log('[search][431][스크린상태]', status);
    this.lists = [];
    const tempLists: IPatient[] = [];
    //
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');

    if (patientId !== undefined) {
      patientId = patientId.trim();
    }
    if (specimenNo !== undefined) {
      specimenNo = specimenNo.trim();
    }

    if (research === 'TOTAL') {
      research = '';
    }

    if (parseInt(status, 10) === 10 || this.receivedType === 'register') {
      status = '10';
    }

    // MDS/MPN [NGS]  : LPE473 (골수형성이상, 골수증식종양)
    // Lymphoma [NGS] : LPE474-악성림프종, LPE475-형질세포종
    this.patientsList.lymphomaSearch2(startdate, enddate, patientId, specimenNo, status, sheet, research)
      .then(response => response.json())
      .then(data => {
        // console.log('[LYM]', data);
        if (this.receivedType !== 'none') {
          data.forEach(list => {
            if (this.receivedType === 'register') {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 0) {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 1) {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 2) {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 3) {
              tempLists.push(list);
            }
          });

          this.patientsList.setPatientID(tempLists);
          this.lists = tempLists;
          this.tempLists = tempLists;
          // this.receivedType = 'none';
        } else if (this.receivedType === 'none') {
          this.patientsList.setPatientID(data);
          this.lists = data;
          this.tempLists = data;
        }

        this.patientID = '';
        this.specimenNo = '';
      });

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
    } else {
      return '접수';
    }
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
    if (lymphomaLists.includes(testCode)) {
      return false;
    }
    return true;
  }

  processingSatus(testCode: string): boolean {
    if (lymphomaLists.includes(testCode)) {
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
    const dialogRef = this.dialog.open(LymDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      this.checkStore();
    });
  }


  goDashboard(): void {
    this.store.setSpecimentNo('');
    this.store.setPatientID('');
    this.store.setStatus('');
    this.store.setSheet('');
    this.store.setResearch('');
    this.store.setSearchStartDay('');
    this.store.setSearchEndDay('');
    this.store.setReceivedType('');
    this.router.navigate(['/diag', 'board']);
  }



}
