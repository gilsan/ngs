import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreSEQService } from 'src/app/forms/store.current.seq';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { listSequencing, sequencingLists } from 'src/app/forms/commons/geneList';
import { TestCodeTitleService } from '../../services/testCodeTitle.service';
import { SeqDialogComponent } from './seq-dialog/seq-dialog.component';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { ICodement } from 'src/app/inhouse/models/comments';


@Component({
  selector: 'app-sequencing',
  templateUrl: './sequencing.component.html',
  styleUrls: ['./sequencing.component.scss']
})
export class SequencingComponent implements OnInit, AfterViewInit, OnDestroy {

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
  receivedType = 'none';
  storeStartDay: string;
  storeEndDay: string;
  storePatientID: string;
  storeSpecimenID: string;

  private apiUrl = emrUrl;

  // sequencingLists = sequencingLists;
  // listSequencing = listSequencing.sort((a, b) => {
  //   const x = a.gene; const y = b.gene;
  //   return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  // });
  listSequencing: ICodement[] = [];
  qselect10 = false;
  qselect0 = false;
  qselect1 = false;
  qselect2 = false;
  qselect3 = false;
  qselect5 = false;
  qselect100 = false;

  qresearchTOTAL = false;
  qresearchDiag = false;
  qresearchResearch = false;

  qstartDay = this.startToday();
  qendDay = this.endToday();

  @ViewChild('seqTestedID', { static: true }) testedID: ElementRef;
  @ViewChild('seqPatient', { static: true }) patient: ElementRef;
  @ViewChild('seqStatus', { static: true }) screenstatus: ElementRef;
  @ViewChild('seqSheet', { static: true }) amlallsheet: ElementRef;
  @ViewChild('seqResearch', { static: true }) research: ElementRef;
  @ViewChild('seqStart', { static: true }) start: ElementRef;
  @ViewChild('seqEnd', { static: true }) end: ElementRef;
  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;

  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreSEQService,
    private sanitizer: DomSanitizer,
    private titleService: TestCodeTitleService,
    public dialog: MatDialog,
    private codeDefaultValueService: CodeDefaultValue
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      filter(data => data !== null || data !== undefined),
      map(route => route.get('type'))
    ).subscribe(data => {
      if (data !== null) {
        this.receivedType = data;

        if (parseInt(this.receivedType, 10) === 0) {
          this.qselect0 = true;
        } else if (parseInt(this.receivedType, 10) === 1) {
          this.qselect1 = true;
        } else if (parseInt(this.receivedType, 10) === 2) {
          this.qselect2 = true;
        } else if (parseInt(this.receivedType, 10) === 3) {
          this.qselect3 = true;
        } else if (this.receivedType === 'register') {
          this.qselect10 = true;
        }


      }
    });

    this.checkStore();
    if (this.storeStartDay === null || this.storeEndDay === null) {
      this.init();
    }

    this.loadCode();
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
    this.qselect10 = false;
    this.qselect0 = false;
    this.qselect1 = false;
    this.qselect2 = false;
    this.qselect3 = false;
    this.qselect5 = false;
    this.qselect100 = false;
    if (parseInt(status, 10) === 0) {
      this.qselect0 = true;
    } else if (parseInt(status, 10) === 1) {
      this.qselect1 = true;
    } else if (parseInt(status, 10) === 2) {
      this.qselect2 = true;
    } else if (parseInt(status, 10) === 3) {
      this.qselect3 = true;
    } else if (parseInt(status, 10) === 5) {
      this.qselect5 = true;
    } else if (status === 'register' || parseInt(status, 10) === 10) {
      this.qselect10 = true;
    } else if (parseInt(status, 10) === 100) {
      this.qselect100 = true;
    }
    if (this.receivedType !== 'none') {
      this.receivedType = status;
    }
  }

  sheetOption(sheet: string): boolean {

    if (this.sheet === sheet) {
      return true;
    }
    return false;

  }

  researchOption(research: string): void {
    this.qresearchTOTAL = false;
    this.qresearchDiag = false;
    this.qresearchResearch = false;
    if (research === 'diag') {
      this.qresearchDiag = true;
    } else if (research === 'RESEARCH') {
      this.qresearchResearch = true;
    } else if (research === 'TOTAL') {
      this.qresearchTOTAL = true;
    }
  }

  //  메뉴선택
  loadCode(): void {
    this.codeDefaultValueService.getCodeLists()
      .pipe(
        tap(data => console.log('[138][]', data)),
        map(lists => {
          return lists.sort((a, b) => {
            if (a.report < b.report) { return -1; }
            if (a.report > b.report) { return 1; }
            if (a.report === b.report) { return 0; }
          });
        }),
        switchMap(data => from(data)),
        filter(list => list.type === 'SEQ')
      )
      .subscribe(data => {
        this.listSequencing.push(data);
      });
  }


  init(): void {
    this.patientsList.getPatientList2()
      .then(response => response.json())
      .then(data => {
        this.patientsList.setPatientID(data);
        this.lists = data;
      });
    // this.lists$ = this.patientsList.getPatientList();
    // this.subs.sink = this.lists$
    //   .pipe(
    //     switchMap(item => of(item)),
    //     switchMap(list => from(list)),
    //     filter(list => this.sequencingLists.includes(list.test_code)),
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
    this.store.setamlSpecimenID(testedID);
    this.store.setamlPatientID(patient);
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
    // this.router.navigate(['/diag', 'jingum', this.lists[i].test_code]);
    this.router.navigate(['/diag', 'sequencing', 'form7', this.lists[i].test_code, this.receivedType]);
  }


  // tslint:disable-next-line: typedef
  setStartDate(date: string): void {
    this.qstartDay = date;
  }

  setEndDate(date: string): void {
    this.qendDay = date;
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
      console.log('[369][]', status)
      // this.screenstatus.nativeElement.value = this.status;
      this.selectOption(status);
    }

    if (sheet.length !== 0) {
      this.sheet = sheet;
      // this.amlallsheet.nativeElement.value = this.sheet;
      // this.sheetOption(sheet);
    }

    if (storeStartDay.length !== 0) {
      this.storeStartDay = storeStartDay;
      this.qstartDay = storeStartDay;
    }

    if (storeEndDay.length !== 0) {
      this.storeEndDay = storeEndDay;
      this.qendDay = storeEndDay;
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
    this.lists = [];
    const tempLists: IPatient[] = [];

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

    this.patientsList.sequencingSearch2(startdate, enddate, patientId, specimenNo, status, sheet, research)
      .then(response => response.json())
      .then(data => {
        // data.forEach(item => console.log('[465][스크린상태]', item.screenstatus));
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
          tempLists.forEach(list => {
            this.lists.push(list);
            this.tempLists.push(list);
            this.patientID = '';
            this.specimenNo = '';
          });
          // this.receivedType = 'none';
        } else if (this.receivedType === 'none') {
          this.patientsList.setPatientID(data);
          data.forEach(list => {
            this.lists.push(list);
            this.tempLists.push(list);
            this.patientID = '';
            this.specimenNo = '';
          });
        }

      });

  }


  processingStatus(i: number): string {
    const status = this.lists[i].screenstatus;

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


  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }

  ////////// 연구용
  openDialog(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth = '100vw';
    dialogConfig.maxHeight = '100vh';
    const dialogRef = this.dialog.open(SeqDialogComponent, dialogConfig);
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
