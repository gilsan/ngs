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
//import { TestCodeTitleService } from '../../services/testCodeTitle.service';
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
  savedLists: IPatient[] = [];
  specimenNo = '';
  patientID = '';
  patientname = '';
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
  storePatientName: string;
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
  mlpaselect5 = false;
  mlpaselect100 = false;

  mlparesearchTOTAL = false;
  mlparesearchDiag = false;
  mlparesearchResearch = false;

  mlpastartDay = this.startToday();
  mlpaendDay = this.endToday();

  // specimenNoLists: string[] = [];
  // patientIDLists: string[] = [];
  // patientNameLists: string[] = [];

  // backupspecimenNoLists: string[] = [];
  // backuppatientIDLists: string[] = [];
  // backuppatientNameLists: string[] = [];

  @ViewChild('mlpaTestedID', { static: true }) testedID: ElementRef;
  @ViewChild('mlpaPatient', { static: true }) patient: ElementRef;
  @ViewChild('mlpapatientName', { static: true }) patientName: ElementRef;
  @ViewChild('mlpaStatus', { static: true }) screenstatus: ElementRef;
  @ViewChild('mlpaSheet', { static: true }) amlallsheet: ElementRef;
  @ViewChild('mlpaResearch', { static: true }) research: ElementRef;
  @ViewChild('mlpaStart', { static: true }) start: ElementRef;
  @ViewChild('mlpaEnd', { static: true }) end: ElementRef;
  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;
  initState = true;
  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreMLPAService,
    private sanitizer: DomSanitizer,
    public mlpaService: MlpaService,
    //private titleService: TestCodeTitleService,
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
  }

  selectOption(status: string): void {
    this.mlpaselect10 = false;
    this.mlpaselect0 = false;
    this.mlpaselect1 = false;
    this.mlpaselect2 = false;
    this.mlpaselect3 = false;
    this.mlpaselect5 = false;
    this.mlpaselect100 = false;
    if (parseInt(status, 10) === 0) {
      this.mlpaselect0 = true;
    } else if (parseInt(status, 10) === 1) {
      this.mlpaselect1 = true;
    } else if (parseInt(status, 10) === 2) {
      this.mlpaselect2 = true;
    } else if (parseInt(status, 10) === 3) {
      this.mlpaselect3 = true;
    } else if (parseInt(status, 10) === 5) {
      this.mlpaselect5 = true;
    } else if (status === 'register' || parseInt(status, 10) === 10) {
      this.mlpaselect10 = true;
    } else if (parseInt(status, 10) === 100) {
      this.mlpaselect100 = true;
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
    this.mlparesearchTOTAL = false;
    this.mlparesearchDiag = false;
    this.mlparesearchResearch = false;
    if (research === 'diag') {
      this.mlparesearchDiag = true;
    } else if (research === 'RESEARCH') {
      this.mlparesearchResearch = true;
    } else if (research === 'TOTAL') {
      this.mlparesearchTOTAL = true;
    }
  }


  loadCode(): void {
    this.codeDefaultValueService.getCodeLists()
      .pipe(
        // tap(data => console.log('[133][MLPA]', data)),
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
        // console.log('[144]', data);
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
    this.savedLists = [];
    const testedID = this.testedID.nativeElement.value;
    const patient = this.patient.nativeElement.value;
    const patientName = this.patientName.nativeElement.value;
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
    this.store.setPatientName(patientName);
    this.store.setStatus(status);
    this.store.setSheet(sheet);
    this.store.setResearch(research);
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setReceivedType(this.receivedType);

    // this.store.setSpecimenNoLists(this.specimenNoLists);
    // this.store.setPatientIDLists(this.patientIDLists);
    // this.store.setPatientNameLists(this.patientNameLists);

    // this.store.setPatientLists(this.tempLists);
    ////////////////////////////////////////////////////////////////

    const specimenno = this.store.getSpecimenNo();

    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL
    // this.router.navigate(['/diag', 'jingum', this.lists[i].test_code]);
    this.router.navigate(['/diag', 'mlpa', 'form5', this.lists[i].test_code, this.receivedType]);

  }


  // tslint:disable-next-line: typedef
  setStartDate(date: string): void {
    this.mlpastartDay = date;
  }

  setEndDate(date: string): void {
    this.mlpaendDay = date;
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
    // this.storeStartDay = this.store.getSearchStartDay();
    // this.storeEndDay = this.store.getSearchEndDay();
    // this.storePatientID = this.store.getamlPatientID();
    // this.storeSpecimenID = this.store.getamlSpecimenID();
    // this.status = this.store.getStatus();
    // this.sheet = this.store.getSheet();
    // const whichstate = this.store.getWhichstate();
    this.initState = false;
    const storeSpecimenID = this.store.getamlSpecimenID();
    const storePatientID = this.store.getamlPatientID();
    const storePatientName = this.store.getPatientName();
    const status = this.store.getStatus();
    const sheet = this.store.getSheet();
    const storeStartDay = this.store.getSearchStartDay();
    const storeEndDay = this.store.getSearchEndDay();
    const research = this.store.getResearch();
    const whichstate = this.store.getWhichstate();
    const receivedType = this.store.getReceivedType();

    // this.specimenNoLists = this.store.getSpecimenNoLists();
    // this.patientIDLists = this.store.getPatientIDLists();
    // this.patientNameLists = this.store.getPatientNameLists();
    // this.savedLists = this.store.getPatientLists();

    if (storeSpecimenID.length !== 0) {
      this.storeSpecimenID = storeSpecimenID;
      this.testedID.nativeElement.value = this.storeSpecimenID;
    }

    if (storePatientID.length !== 0) {
      this.storePatientID = storePatientID;
      this.patient.nativeElement.value = this.storePatientID;
    }

    if (storePatientName.length !== 0) {
      this.storePatientName = storePatientName;
      this.patientName.nativeElement.value = this.storePatientName;
    }

    if (status.length !== 0) {
      if (this.receivedType !== 'none') {
        this.receivedType = status;
      }
      this.selectOption(status);
    }

    if (sheet.length !== 0) {
      this.sheet = sheet;
    }

    if (storeStartDay.length !== 0) {
      this.storeStartDay = storeStartDay;
      this.mlpastartDay = storeStartDay;
    }

    if (storeEndDay.length !== 0) {
      this.storeEndDay = storeEndDay;
      this.mlpaendDay = storeEndDay;
    }

    if (research.length !== 0) {
      this.research.nativeElement.value = research;
      this.researchOption(research);
    }

    if (receivedType.length !== 0) {
      this.receivedType = receivedType;
    }


    this.startday = storeStartDay;
    this.endday = storeEndDay;
    this.specimenno = storeSpecimenID;
    this.patientid = storePatientID;


    this.lists = [];
    if (whichstate === 'searchscreen') {
      this.search(storeStartDay.replace(/-/g, ''), storeEndDay.replace(/-/g, ''),
        storeSpecimenID, storePatientID, status, sheet, research, storePatientName);
      // this.search(this.storeStartDay, this.storeEndDay, this.storeSpecimenID, this.storePatientID, this.status, this.sheet);
    } else if (whichstate === 'mainscreen') {
      if (storeStartDay.length && storeEndDay.length) {
        this.search(storeStartDay.replace(/-/g, ''), storeEndDay.replace(/-/g, ''),
          storeSpecimenID, storePatientID, status, sheet, research, storePatientName);
      } else {
        this.search(this.startToday(), this.endToday(), '', '');
      }
      // this.search(this.startToday(), this.endToday(), '', '');
    }


  }

  // tslint:disable-next-line: typedef
  search(start: string, end: string, specimenNo: string, patientId: string,
    status: string = '', sheet: string = '', research: string = '', patientname: string = '') {

    this.startday = start;
    this.endday = end;
    this.specimenno = specimenNo;
    this.patientid = patientId;
    this.status = status;
    this.sheet = sheet;
    this.patientname = patientname;

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

    this.patientsList.mlpaSearch2(startdate, enddate, patientId, specimenNo, status, sheet, research, patientname)
      .then(response => response.json())
      .then(data => {
        data.forEach(item => console.log('[469][type]]', this.receivedType));
        this.patientsList.setPatientID(data);
        if (this.receivedType !== 'none') {
          data.forEach(list => {
            if (this.receivedType === 'register' || parseInt(this.receivedType, 10)) {
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

          this.lists = tempLists;
          this.tempLists = tempLists;
          // this.receivedType = 'none';
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
    const dialogRef = this.dialog.open(MlpaDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      this.checkStore();
    });
  }


  goDashboard(): void {
    this.store.setSpecimentNo('');
    this.store.setPatientID('');
    this.store.setPatientName('');
    this.store.setStatus('');
    this.store.setSheet('');
    this.store.setResearch('');
    this.store.setSearchStartDay('');
    this.store.setSearchEndDay('');
    this.store.setReceivedType('');
    this.router.navigate(['/diag', 'board']);
  }




}
