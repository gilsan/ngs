import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreService } from 'src/app/forms/store.current';
import { IPatient } from '../../models/patients';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { geneTitles } from 'src/app/forms/commons/geneList';
import { TestCodeTitleService } from 'src/app/home/services/testCodeTitle.service';
import { AMLALL, LYM, SEQ, MDS, GENETIC, MLPA } from 'src/app/forms/commons/geneList';
import { PatientsListService } from '../../services/patientslist';
import { DashboardService } from '../../services/dashboard.service';
import { AmlallDialogComponent } from './amlall-dialog/amlall-dialog.component';
@Component({
  selector: 'app-amlall',
  templateUrl: './amlall.component.html',
  styleUrls: ['./amlall.component.scss']
})
export class AmlallComponent implements OnInit, AfterViewInit, OnDestroy {


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
  select0 = false;
  select1 = false;
  select2 = false;
  select3 = false;
  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;

  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreService,
    private sanitizer: DomSanitizer,
    private titleService: TestCodeTitleService,
    private dashboardService: DashboardService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      filter(data => data !== null || data !== undefined),
      map(route => route.get('type'))
    ).subscribe(data => {
      if (data !== null) {
        this.receivedType = data;
      }
      // console.log('[69][전송값]', this.receivedType);
      if (parseInt(this.receivedType, 10) === 0) {
        this.select0 = true;
      } else if (parseInt(this.receivedType, 10) === 1) {
        this.select1 = true;
      } else if (parseInt(this.receivedType, 10) === 2) {
        this.select2 = true;
      } else if (parseInt(this.receivedType, 10) === 3) {
        this.select3 = true;
      }
    });


    this.checkStore();
    if (this.storeStartDay === null || this.storeEndDay === null) {
      this.init();
    }
  }

  selectOption(status: string): void {
    this.select0 = false;
    this.select1 = false;
    this.select2 = false;
    this.select3 = false;
    if (parseInt(status, 10) === 0) {
      this.select0 = true;
    } else if (parseInt(status, 10) === 1) {
      this.select1 = true;
    } else if (parseInt(status, 10) === 2) {
      this.select2 = true;
    } else if (parseInt(status, 10) === 3) {
      this.select3 = true;
    }
  }

  // 전체 리스트
  getAllLists(): void {
    let empty = 0;
    let start = 0;
    let screenread = 0;
    let screenfinish = 0;
    this.patientsList.getAllLists()
      .pipe(
        switchMap(lists => from(lists))
      )
      .subscribe((data) => {
        if (data === undefined) {
          console.log('[78][전체 리스트]', data);
        } else {
          if (data.screenstatus === '') {
            empty++;
          } else if (data.screenstatus === '0') {
            start++;
          } else if (data.screenstatus === '1') {
            screenread++;
          } else if (data.screenstatus === '2') {
            screenfinish++;
          }
        }
      });
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


    this.lists$ = this.patientsList.getPatientList();
    this.subs.sink = this.lists$
      .pipe(
        switchMap(item => of(item)),
        switchMap(list => from(list)),
        map(list => {
          if (list.test_code === 'LPE545' || list.test_code === 'LPE472') {
            return { ...list, codetest: 'ALL', original_code: list.test_code };
          } else if (list.test_code === 'LPE471') {
            return { ...list, codetest: 'AML', original_code: list.test_code };
          } else if (list.test_code === 'LPE473') {
            return { ...list, codetest: 'MDS/MPN' };
          } else if (list.test_code === 'LPE474' || list.test_code === 'LPE475') {
            return { ...list };
            // return { ...list, test_code: 'Lymphoma' };
          } else {
            return { ...list };
          }
        }),
        // tap(list => console.log(list)),
      )
      .subscribe((data) => {
        console.log(data);
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
    // console.log('[143][날짜검사]', this.startday, this.endday);
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
    // console.log('[111][mainscreen][goReporter]', this.lists[i]);
    const specimenno = this.store.getSpecimenNo();

    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL
    // this.router.navigate(['/diag', 'jingum', this.lists[i].test_code]);
    this.router.navigate(['/diag', 'amlall', 'form2', this.lists[i].codetest]);
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

    console.log('[307][AMLALL]][상태 가져오기]', this.storeStartDay, this.storeEndDay, this.storeSpecimenID, this.storePatientID, this.status, this.sheet);
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
    let type = '';
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

    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');

    if (patientId !== undefined) {
      patientId = patientId.trim();
    }
    if (specimenNo !== undefined) {
      specimenNo = specimenNo.trim();
    }

    // MDS/MPN [NGS]  : LPE473 (골수형성이상, 골수증식종양)
    // Lymphoma [NGS] : LPE474-악성림프종, LPE475-형질세포종

    if (sheet.length > 0) {
      type = 'AMLALL';
    } else {
      type = '';
    }

    if (research === 'TOTAL') {
      research = '';
    }
    this.lists = []; // 초기화
    this.lists$ = this.patientsList.search(startdate, enddate, patientId, specimenNo, status, type, research);
    this.subs.sink = this.lists$
      .pipe(
        switchMap(item => of(item)),
        switchMap(list => from(list)),
        filter(list => list.test_code === 'LPE545' || list.test_code === 'LPE472' || list.test_code === 'LPE471'),
        map(list => {
          if (list.test_code === 'LPE545' || list.test_code === 'LPE472') {
            return { ...list, codetest: 'ALL', original_code: list.test_code };
          } else if (list.test_code === 'LPE471') {
            return { ...list, codetest: 'AML', original_code: list.test_code };
          }
        }),
        // tap(data => console.log('[343]', data)),
      ).subscribe((data: any) => {
        if (data.reportTitle === '') {
          const title = this.titleService.getMltaTitle(data.original_code);
          if (title !== 'None') {
            data.reportTitle = title;
          }
        }

        if (this.receivedType !== 'none') {
          if (this.receivedType === 'register' && data.screenstatus === '') {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 0 && parseInt(data.screenstatus, 10) === 0) {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 1 && parseInt(data.screenstatus, 10) === 1) {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 2 && parseInt(data.screenstatus, 10) === 2) {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 3 && parseInt(data.screenstatus, 10) === 3) {
            this.saveData(data, sheet);
          }
        } else if (this.receivedType === 'none') {
          if (sheet === 'TOTAL' || sheet.length === 0) {
            this.lists.push(data);
            this.tempLists.push(data);
          } else if (sheet === 'AMLALL') {
            if (data.test_code === 'LPE471') {
              this.lists.push(data);
              this.tempLists.push(data);
            }
          } else if (sheet === 'ETC') {
            if (data.test_code === 'LPE472') {
              this.lists.push(data);
              this.tempLists.push(data);
            }
          }
        }


        this.patientID = '';
        this.specimenNo = '';
      });

  }

  saveData(data: IPatient, sheet: string): void {
    if (sheet === 'TOTAL' || sheet.length === 0) {
      this.lists.push(data);
      this.tempLists.push(data);
    } else if (sheet === 'AMLALL') {
      if (data.test_code === 'AML') {
        this.lists.push(data);
        this.tempLists.push(data);
      }
    } else if (sheet === 'ETC') {
      if (data.test_code === 'ALL') {
        this.lists.push(data);
        this.tempLists.push(data);
      }
    }
    this.receivedType = 'none';
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
    if (parseInt(status, 10) === 0 && filename.length) {
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
    if (testCode === 'AML' || testCode === 'ALL') {
      return false;
    }
    return true;
  }

  processingSatus(testCode: string): boolean {
    if (testCode === 'AML' || testCode === 'ALL') {
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
    const dialogRef = this.dialog.open(AmlallDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      this.checkStore();
    });
  }


  goDashboard(): void {
    this.receivedType = 'none';
    this.router.navigate(['/diag', 'board']);
  }


}
