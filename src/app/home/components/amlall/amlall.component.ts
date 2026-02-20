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
//import { AMLALL, LYM, SEQ, MDS, GENETIC, MLPA } from 'src/app/forms/commons/geneList';
import { PatientsListService } from '../../services/patientslist';
import { DashboardService } from '../../services/dashboard.service';
import { AmlallDialogComponent } from './amlall-dialog/amlall-dialog.component';

// 25.09.18 인천
import { FileName } from 'src/app/home/models/bTypemodel';

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
  patientname = '';
  isVisible = true;
  startday = '';
  endday = '';
  specimenno = '';
  patientid = '';
  status = ''; // 시작, 스크린판독, 판독완료, EMR전송
  sheet = ''; // AML ALL LYN MDS
  receivedType = '';
  storeStartDay: string;
  storeEndDay: string;
  storePatientID: string;
  storeSpecimenID: string;
  storePatientName: string;
  researchs: string;

  // 25.10.03 인천
  fieName = FileName;

  private apiUrl = emrUrl;
  select0 = false;
  select1 = false;
  select2 = false;
  select3 = false;
  select5 = false;
  select10 = false;
  select100 = false;
  sheetTOTAL = false;
  sheetAMLALL = false;
  sheetETC = false;
  researchTOTAL = false;
  researchDiag = false;
  researchResearch = false;

  startDay = this.startToday();
  endDay = this.endToday();

  specimenNoLists: string[] = [];
  patientIDLists: string[] = [];
  patientNameLists: string[] = [];

  backupspecimenNoLists: string[] = [];
  backuppatientIDLists: string[] = [];
  backuppatientNameLists: string[] = [];
  initState = true;
  @ViewChild('dbox100', { static: true }) dbox100: ElementRef;
  @ViewChild('testedID', { static: true }) testedID: ElementRef;
  @ViewChild('patient', { static: true }) patient: ElementRef;
  @ViewChild('patientName', { static: true }) patientName: ElementRef;
  @ViewChild('status', { static: true }) screenstatus: ElementRef;
  @ViewChild('sheet', { static: true }) amlallsheet: ElementRef;
  @ViewChild('research', { static: true }) research: ElementRef;
  @ViewChild('start', { static: true }) start: ElementRef;
  @ViewChild('end', { static: true }) end: ElementRef;


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
      map(route => route.get('type')),
    ).subscribe(data => {
      if (data !== null) {
        this.receivedType = data;
        // console.log('[92][전송값][receivedType] ', this.receivedType);
        if (parseInt(this.receivedType, 10) === 0) {
          this.select0 = true;
        } else if (parseInt(this.receivedType, 10) === 1) {
          this.select1 = true;
        } else if (parseInt(this.receivedType, 10) === 2) {
          this.select2 = true;
        } else if (parseInt(this.receivedType, 10) === 3) {
          this.select3 = true;
        } else if (parseInt(this.receivedType, 10) === 5) {
          this.select5 = true;
        } else if (this.receivedType === 'register') {
          this.select10 = true;
        }

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

    if (this.receivedType !== 'none') {
      this.receivedType = status;
    }

  }

  sheetOption(sheet: string): void {
    this.sheetAMLALL = false;
    this.sheetETC = false;
    this.sheetTOTAL = false;
    if (sheet === 'AMLALL') {
      this.sheetAMLALL = true;
    } else if (sheet === 'ETC') {
      this.sheetAMLALL = true;
    } else if (sheet === 'TOTAL') {
      this.sheetTOTAL = true;
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
          // console.log('[78][전체 리스트]', data);
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
        // console.log('[mainscreen][환자정보]', this.lists);
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

    // this.store.setSpecimenNoLists(this.specimenNoLists);
    // this.store.setPatientIDLists(this.patientIDLists);
    // this.store.setPatientNameLists(this.patientNameLists);
    ////////////////////////////////////////////////////////////////
    //  testedID, patient, status, sheet, research, start, end, this.receivedType);
    const specimenno = this.store.getSpecimenNo();

    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL
    // this.router.navigate(['/diag', 'jingum', this.lists[i].test_code]);
    this.router.navigate(['/diag', 'amlall', 'form2', this.lists[i].codetest, this.receivedType]);
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
  setStartDate(date: string): void {
    this.startDay = date;
  }

  setEndDate(date: string): void {
    this.endDay = date;
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

    if (this.receivedType === 'none') {
      this.initState = false;
    } else {
      this.initState = true;
    }

    const storeSpecimenID = this.store.getSpecimenNo();
    const storePatientID = this.store.getPatinetID();
    const storePatientName = this.store.getPatientName();
    const status = this.store.getStatus();
    const sheet = this.store.getSheet();
    const research = this.store.getResearch();
    const storeStartDay = this.store.getSearchStartDay();
    const storeEndDay = this.store.getSearchEndDay();
    const whichstate = this.store.getWhichstate();
    const receivedType = this.store.getReceivedType();

    // this.specimenNoLists = this.store.getSpecimenNoLists();
    // this.patientIDLists = this.store.getPatientIDLists();
    // this.patientNameLists = this.store.getPatientNameLists();
    // console.log('[421][checkStore][저장된데이터] ', storeSpecimenID);
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
      // this.screenstatus.nativeElement.value = this.status;
      this.selectOption(status);
    }

    if (sheet.length !== 0) {
      this.sheet = sheet;
      // this.amlallsheet.nativeElement.value = this.sheet;
      this.sheetOption(sheet);
    }

    if (storeStartDay.length !== 0) {
      this.storeStartDay = storeStartDay;
      this.startDay = storeStartDay;
    }

    if (storeEndDay.length !== 0) {
      this.storeEndDay = storeEndDay;
      this.endDay = storeEndDay;
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

    // console.log('[434][whichstate][저장된데이터] ', whichstate);
    // console.log('[434][날자] ', storeStartDay, storeEndDay);
    if (whichstate === 'searchscreen') {
      this.search(storeStartDay.replace(/-/g, ''), storeEndDay.replace(/-/g, ''),
        storeSpecimenID, storePatientID, status, sheet, research, storePatientName);
    } else if (whichstate === 'mainscreen') {
      if (storeStartDay.length && storeEndDay.length) {
        this.search(storeStartDay.replace(/-/g, ''), storeEndDay.replace(/-/g, ''),
          storeSpecimenID, storePatientID, status, sheet, research, storePatientName);
      } else {
        this.search(this.startToday(), this.endToday(), '', '');
      }
    }
  }

  // tslint:disable-next-line: typedef
  search(start: string, end: string, specimenNo: string, patientId: string,
    status: string = '', sheet: string = '', research: string = '', patientname: string = '') {
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
    // console.log(this.initState, isChanged);
    // console.log('[515] ', specimenNo);

    let type = '';
    this.startday = start;
    this.endday = end;
    this.specimenno = specimenNo;
    this.patientid = patientId;
    this.status = status;
    this.sheet = sheet;
    this.patientname = patientname;

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
    if (parseInt(status, 10) === 10 || this.receivedType === 'register') {
      status = '10';
    }
    // console.log('[550][검색][receivedType]', specimenNo);
    // console.log('[499][검색]', startdate, enddate, patientId, specimenNo, status, type, research);

    this.lists = []; // 초기화
    this.lists$ = this.patientsList.search(startdate, enddate, patientId, specimenNo, status, type, research, patientname);
    this.subs.sink = this.lists$
      .pipe(
        map(lists => lists.filter(list => list.test_code === 'LPE545' || list.test_code === 'LPE472' || list.test_code === 'LPE471')),
        map(lists => lists.map(list => list.specimenNo))
      )
      .subscribe(data => {
        this.backupspecimenNoLists = data.sort();
        if (this.initState) {
          this.specimenNoLists = this.backupspecimenNoLists;
        }

        if (isChanged) {
          this.specimenNoLists = this.backupspecimenNoLists;
        }
      });

    this.subs.sink = this.lists$
      .pipe(
        map(lists => lists.filter(list => list.test_code === 'LPE545' || list.test_code === 'LPE472' || list.test_code === 'LPE471')),
        map(lists => lists.map(list => list.patientID))
      )
      .subscribe(data => {
        this.backuppatientIDLists = data.sort();
        if (this.initState) {
          this.patientIDLists = this.backuppatientIDLists;
        }

        if (isChanged) {
          this.patientIDLists = this.backuppatientIDLists;
        }
      });

    this.subs.sink = this.lists$
      .pipe(
        map(lists => lists.filter(list => list.test_code === 'LPE545' || list.test_code === 'LPE472' || list.test_code === 'LPE471')),
        map(lists => lists.map(list => list.name))
      )
      .subscribe(data => {
        this.backuppatientNameLists = data.sort();
        if (this.initState) {
          this.patientNameLists = this.backuppatientNameLists;
        }

        if (isChanged) {
          this.patientNameLists = this.backuppatientNameLists;
        }
      });

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
      ).subscribe((data: any) => {
        this.initState = false;
        if (data.reportTitle === '') {
          const title = this.titleService.getMltaTitle(data.original_code);
          if (title !== 'None') {
            data.reportTitle = title;
          }
        }
        // console.log('[533][검색][receivedType]', this.receivedType);
        if (this.receivedType !== 'none') {
          if (this.receivedType === 'register' || parseInt(this.receivedType, 10)) {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 0) {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 1) {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 2) {
            this.saveData(data, sheet);
          } else if (parseInt(this.receivedType, 10) === 3) {
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
    // console.log('[542][SAVEDATA]', data, sheet);
    if (sheet === 'TOTAL' || sheet.length === 0) {
      this.lists.push(data);
      this.tempLists.push(data);
    } else if (sheet === 'AMLALL') {
      if (data.test_code === 'AML' || data.test_code === 'LPE471') {
        this.lists.push(data);
        this.tempLists.push(data);
      }
    } else if (sheet === 'ETC') {
      if (data.test_code === 'ALL' || data.test_code === 'LPE472') {
        this.lists.push(data);
        this.tempLists.push(data);
      }
    }
    // this.receivedType = 'none';
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
    // this.receivedType = 'none';
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
