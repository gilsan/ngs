import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreMLPAService } from 'src/app/forms/store.current.mlpa';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { geneTitles, mlpaLists, listMLPA } from 'src/app/forms/commons/geneList';
import { MLPATLIST } from 'src/app/forms/commons/mlpa.data';
import { MlpaService } from 'src/app/services/mlpa.service';
import { TestCodeTitleService } from '../../services/testCodeTitle.service';
import { MlpaDialogComponent } from './mlpa-dialog/mlpa-dialog.component';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { ICodement } from 'src/app/inhouse/models/comments';

@Component({
  selector: 'app-mlpa',
  templateUrl: './mlpa.component.html',
  styleUrls: ['./mlpa.component.scss']
})
export class MlpaComponent implements OnInit, AfterViewInit, OnDestroy {

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
  mlpaLists = mlpaLists;
  // listsMLPA = listMLPA;
  listsMLPA: ICodement[] = [];
  mlpaselect10 = false;
  mlpaselect0 = false;
  mlpaselect1 = false;
  mlpaselect2 = false;
  mlpaselect3 = false;

  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;

  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreMLPAService,
    private sanitizer: DomSanitizer,
    public mlpaService: MlpaService,
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
          this.mlpaselect0 = true;
        } else if (parseInt(this.receivedType, 10) === 1) {
          this.mlpaselect1 = true;
        } else if (parseInt(this.receivedType, 10) === 2) {
          this.mlpaselect2 = true;
        } else if (parseInt(this.receivedType, 10) === 3) {
          this.mlpaselect3 = true;
        } else if (this.receivedType === 'register') {
          this.mlpaselect10 = true;
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
    this.store.setStatus('100');
    this.store.setSheet('MLPA');
  }

  selectOption(status: string): void {
    if (parseInt(status, 10) === 0) {
      this.mlpaselect0 = true;
    } else if (parseInt(status, 10) === 1) {
      this.mlpaselect1 = true;
    } else if (parseInt(status, 10) === 2) {
      this.mlpaselect2 = true;
    } else if (parseInt(status, 10) === 3) {
      this.mlpaselect3 = true;
    } else if (parseInt(status, 10) === 10) {
      this.mlpaselect10 = true;
    }
  }


  loadCode(): void {
    this.codeDefaultValueService.getCodeLists()
      .pipe(
        map(lists => {
          return lists.sort((a, b) => {
            if (a.report < b.report) { return -1; }
            if (a.report > b.report) { return 1; }
            if (a.report === b.report) { return 0; }
          });
        }),
        switchMap(data => from(data)),
        filter(list => list.type === 'MLPA')
      )
      .subscribe(data => {
        // console.log(data);
        this.listsMLPA.push(data);
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
    //     filter(list => this.mlpaLists.includes(list.test_code)),
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
    // this.router.navigate(['/diag', 'jingum', this.lists[i].test_code]);
    this.router.navigate(['/diag', 'mlpa', 'form5', this.lists[i].test_code]);

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
  search(start: string, end: string, specimenNo: string, patientId: string,
    status: string = '', sheet: string = '', research: string = '') {
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

    this.patientsList.mlpaSearch2(startdate, enddate, patientId, specimenNo, status, sheet, research)
      .then(response => response.json())
      .then(data => {
        this.patientsList.setPatientID(data);
        if (this.receivedType !== 'none') {
          data.forEach(list => {
            if (this.receivedType === 'register' && list.screenstatus === '') {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 0 && parseInt(list.screenstatus, 10) === 0) {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 1 && parseInt(list.screenstatus, 10) === 1) {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 2 && parseInt(list.screenstatus, 10) === 2) {
              tempLists.push(list);
            } else if (parseInt(this.receivedType, 10) === 3 && parseInt(list.screenstatus, 10) === 3) {
              tempLists.push(list);
            }
          });

          this.lists = tempLists;
          this.tempLists = tempLists;
          this.receivedType = 'none';
        } else if (this.receivedType === 'none') {
          this.lists = data;
          this.tempLists = data;
        }

        this.patientID = '';
        this.specimenNo = '';
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
    const dialogRef = this.dialog.open(MlpaDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      this.checkStore();
    });
  }


  goDashboard(): void {
    this.receivedType = 'none';
    this.router.navigate(['/diag', 'board']);
  }




}
