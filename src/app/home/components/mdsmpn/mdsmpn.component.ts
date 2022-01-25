import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreMDSService } from 'src/app/forms/store.current.mds';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { geneTitles } from 'src/app/forms/commons/geneList';

import { TestCodeTitleService } from 'src/app/home/services/testCodeTitle.service';
import { MdsDialogComponent } from './mds-dialog/mds-dialog.component';
@Component({
  selector: 'app-mdsmpn',
  templateUrl: './mdsmpn.component.html',
  styleUrls: ['./mdsmpn.component.scss']
})
export class MdsmpnComponent implements OnInit, AfterViewInit, OnDestroy {

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
  mselect0 = false;
  mselect1 = false;
  mselect2 = false;
  mselect3 = false;
  mselect5 = false;
  mselect10 = false;
  mselect100 = false;
  msheetMDS = false;
  msheetLPE473 = false;

  mresearchTOTAL = false;
  mresearchDiag = false;
  mresearchResearch = false;

  mstartDay = this.startToday();
  mendDay = this.endToday();

  specimenNoLists: string[] = [];
  patientIDLists: string[] = [];
  patientNameLists: string[] = [];

  backupspecimenNoLists: string[] = [];
  backuppatientIDLists: string[] = [];
  backuppatientNameLists: string[] = [];

  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;
  @ViewChild('mdsTestedID', { static: true }) testedID: ElementRef;
  @ViewChild('mdspatientName', { static: true }) patientName: ElementRef;
  @ViewChild('mdsPatient', { static: true }) patient: ElementRef;
  @ViewChild('mdsStatus', { static: true }) screenstatus: ElementRef;
  @ViewChild('mdsSheet', { static: true }) amlallsheet: ElementRef;
  @ViewChild('mdsResearch', { static: true }) research: ElementRef;
  @ViewChild('mdsStart', { static: true }) start: ElementRef;
  @ViewChild('mdsEnd', { static: true }) end: ElementRef;
  initState = true;

  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private route: ActivatedRoute,
    private store: StoreMDSService,
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
        console.log('[87][receivedType]', this.receivedType);
        if (parseInt(this.receivedType, 10) === 0) {
          this.mselect0 = true;
        } else if (parseInt(this.receivedType, 10) === 1) {
          this.mselect1 = true;
        } else if (parseInt(this.receivedType, 10) === 2) {
          this.mselect2 = true;
        } else if (parseInt(this.receivedType, 10) === 3) {
          this.mselect3 = true;
        } else if (this.receivedType === 'register') {
          this.mselect10 = true;
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
    this.mselect0 = false;
    this.mselect1 = false;
    this.mselect2 = false;
    this.mselect3 = false;
    this.mselect5 = false;
    this.mselect10 = false;
    this.mselect100 = false;
    if (parseInt(status, 10) === 0) {
      this.mselect0 = true;
    } else if (parseInt(status, 10) === 1) {
      this.mselect1 = true;
    } else if (parseInt(status, 10) === 2) {
      this.mselect2 = true;
    } else if (parseInt(status, 10) === 3) {
      this.mselect3 = true;
    } else if (parseInt(status, 10) === 5) {
      this.mselect5 = true;
    } else if (status === 'register' || parseInt(status, 10) === 10) {
      this.mselect10 = true;
    } else if (parseInt(status, 10) === 100) {
      this.mselect100 = true;
    }
    if (this.receivedType !== 'none') {
      this.receivedType = status;
    }
  }

  sheetOption(sheet: string): void {
    this.msheetMDS = false;
    this.msheetLPE473 = false;
    if (sheet === 'MDS') {
      this.msheetMDS = true;
    } else if (sheet === 'LPE473') {
      this.msheetLPE473 = true;
    }
  }

  researchOption(research: string): void {
    this.mresearchTOTAL = false;
    this.mresearchDiag = false;
    this.mresearchResearch = false;
    if (research === 'diag') {
      this.mresearchDiag = true;
    } else if (research === 'RESEARCH') {
      this.mresearchResearch = true;
    } else if (research === 'TOTAL') {
      this.mresearchTOTAL = true;
    }
  }



  init(): void {
    this.lists$ = this.patientsList.getPatientList();
    this.subs.sink = this.lists$
      .pipe(
        switchMap(item => of(item)),
        switchMap(list => from(list)),
        filter(list => list.test_code === 'LPE473'),
        map(list => {
          if (list.test_code === 'LPE473') {
            return { ...list, codetest: 'MDS/MPN' };
          }
        }),
        tap(list => console.log(list)),
      )
      .subscribe((data) => {
        this.lists.push(data);
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
    this.store.setSpecimentNo(testedID);
    this.store.setPatientID(patient);
    this.store.setPatientName(patientName);
    this.store.setStatus(status);
    this.store.setSheet(sheet);
    this.store.setResearch(research);
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setReceivedType(this.receivedType);

    this.store.setSpecimenNoLists(this.specimenNoLists);
    this.store.setPatientIDLists(this.patientIDLists);
    this.store.setPatientNameLists(this.patientNameLists);

    this.store.setPatientLists(this.tempLists);
    ////////////////////////////////////////////////////////////////
    const specimenno = this.store.getSpecimenNo();

    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL

    this.router.navigate(['/diag', 'mdsmpn', 'form4', this.lists[i].codetest, this.receivedType]);

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
    this.mstartDay = date;
  }

  setEndDate(date: string): void {
    this.mendDay = date;
  }

  // tslint:disable-next-line: typedef
  today() {
    const today = new Date();
    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + day).substr(-2);
    const now = year + '-' + newmon + '-' + newday;

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
    this.initState = false;
    const storeSpecimenID = this.store.getSpecimenNo();
    const storePatientID = this.store.getPatineID();
    const storePatientName = this.store.getPatientName();
    const status = this.store.getStatus();
    const sheet = this.store.getSheet();
    const storeStartDay = this.store.getSearchStartDay();
    const storeEndDay = this.store.getSearchEndDay();
    const research = this.store.getResearch();
    const whichstate = this.store.getWhichstate();
    const receivedType = this.store.getReceivedType();

    this.specimenNoLists = this.store.getSpecimenNoLists();
    this.patientIDLists = this.store.getPatientIDLists();
    this.patientNameLists = this.store.getPatientNameLists();
    this.savedLists = this.store.getPatientLists();

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
      this.patientName.nativeElement.value = this.storePatientID;
    }


    if (status.length !== 0) {
      if (this.receivedType !== 'none') {
        this.receivedType = status;
      }
      // this.screenstatus.nativeElement.value = status;
      this.selectOption(status);
    }

    if (sheet.length !== 0) {
      // this.sheet = sheet;
      // this.amlallsheet.nativeElement.value = this.sheet;
      this.sheetOption(sheet);
    }

    if (storeStartDay.length !== 0) {
      this.storeStartDay = storeStartDay;
      this.mstartDay = storeStartDay;
    }

    if (storeEndDay.length !== 0) {
      this.storeEndDay = storeEndDay;
      this.mendDay = storeEndDay;
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
    // console.log('[391][checkStore][저장된데이터] ', status, storeStartDay, storeEndDay, receivedType);
    // this.lists = [];
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
  search(start: string, end: string, specimenNo: string,
    patientId: string, status: string = '', sheet: string = '', research: string = '', patientname: string = '') {
    let isChanged = false;

    if (specimenNo === '100') {
      specimenNo = '';
    }

    if (patientId === '100') {
      patientId = '';
    }

    if (patientname === '100') {
      patientname = '';
    }

    if (this.startday.toString().replace(/-/gi, '') !== start.toString().replace(/-/gi, '') ||
      this.endday.toString().replace(/-/gi, '') !== end.toString().replace(/-/gi, '')) {
      isChanged = true;
    } else {
      isChanged = false;
    }

    this.startday = start;
    this.endday = end;
    this.specimenno = specimenNo;
    this.patientid = patientId;
    this.status = status;
    this.sheet = sheet;
    this.patientname = patientname;

    this.lists = [];
    const tempLists = [];
    const templists: IPatient[] = [];

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

    this.patientsList.mdsmpnSearch2(startdate, enddate, patientId, specimenNo, status, sheet, research, patientname)
      .then(response => response.json())
      .then(data => {
        if (this.receivedType !== 'none') {
          data.forEach(list => {
            if (this.receivedType === 'register' || parseInt(this.receivedType, 10)) {
              templists.push(list);
            } else if (parseInt(this.receivedType, 10) === 0) {
              templists.push(list);
            } else if (parseInt(this.receivedType, 10) === 1) {
              templists.push(list);
            } else if (parseInt(this.receivedType, 10) === 2) {
              templists.push(list);
            } else if (parseInt(this.receivedType, 10) === 3) {
              templists.push(list);
            }
          });

          templists.forEach(list => {
            if (list.test_code === 'LPE473') {
              tempLists.push({ ...list, codetest: 'MDS/MPN' });
            }
          });
          // console.log(tempLists);
          this.patientsList.setPatientID(tempLists);
          this.lists = tempLists;
          this.tempLists = tempLists;
          // this.receivedType = 'none';
        } else if (this.receivedType === 'none') {
          data.forEach(list => {
            if (list.test_code === 'LPE473') {
              tempLists.push({ ...list, codetest: 'MDS/MPN' });
            }
          });
          // console.log(tempLists);
          this.patientsList.setPatientID(tempLists);
          this.lists = tempLists;
          this.tempLists = tempLists;
        }

        this.patientID = '';
        this.specimenNo = '';
        return data;
      })
      .then(lists => {
        this.backupspecimenNoLists = [];
        this.backuppatientIDLists = [];
        this.backuppatientNameLists = [];
        this.backupspecimenNoLists = lists.map(list => list.specimenNo).sort();
        this.backuppatientIDLists = lists.map(list => list.patientID).sort();
        this.backuppatientNameLists = lists.map(list => list.name).sort();
        if (this.initState) {
          this.specimenNoLists = this.backupspecimenNoLists;
          this.patientIDLists = this.backuppatientIDLists;
          this.patientNameLists = this.backuppatientNameLists;
        }
        if (isChanged) {
          this.specimenNoLists = this.backupspecimenNoLists;
          this.patientIDLists = this.backuppatientIDLists;
          this.patientNameLists = this.backuppatientNameLists;
        }
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
    if (testCode === 'MDS/MPN') {
      return false;
    }
    return true;
  }

  processingSatus(testCode: string): boolean {
    if (testCode === 'MDS/MPN') {
      return true;
    }
    const result = geneTitles.findIndex(item => item.gene === testCode);
    if (result !== -1) {
      return true;
    }
    return false;
  }

  optionTestcode(option: string): void {
    this.lists = [];
    if (option === '100') {
      this.storeSpecimenID = '';
      this.store.setSpecimentNo('');
      if (this.tempLists.length > this.savedLists.length) {
        this.lists = this.tempLists;
      } else if (this.tempLists.length < this.savedLists.length) {
        this.lists = this.savedLists;
        this.tempLists = this.savedLists;
      } else {
        this.lists = this.tempLists;
      }
    } else {
      const list = this.tempLists.filter(patient => patient.specimenNo === option);
      this.lists = list;
    }
  }

  optionPatientid(option: string): void {
    this.lists = [];
    if (option === '100') {
      this.storeSpecimenID = '';
      this.store.setPatientID('');
      if (this.tempLists.length > this.savedLists.length) {
        this.lists = this.tempLists;
      } else if (this.tempLists.length < this.savedLists.length) {
        this.lists = this.savedLists;
        this.tempLists = this.savedLists;
      } else {
        this.lists = this.tempLists;
      }
    } else {
      const list = this.tempLists.filter(patient => patient.patientID === option);
      this.lists = list;
    }
  }

  optionPatientname(option: string): void {
    this.lists = [];
    if (option === '100') {
      this.storePatientName = '';
      this.store.setPatientName('');
      if (this.tempLists.length > this.savedLists.length) {
        this.lists = this.tempLists;
      } else if (this.tempLists.length < this.savedLists.length) {
        this.lists = this.savedLists;
        this.tempLists = this.savedLists;
      } else {
        this.lists = this.tempLists;
      }
    } else {
      const list = this.tempLists.filter(patient => patient.name === option);
      this.lists = list;
    }
  }
  ////////// 연구용
  openDialog(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth = '100vw';
    dialogConfig.maxHeight = '100vh';
    const dialogRef = this.dialog.open(MdsDialogComponent, dialogConfig);
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
