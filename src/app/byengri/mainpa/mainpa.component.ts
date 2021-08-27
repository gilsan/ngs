import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IPatient } from '../models/patients';
import { PathologyService } from '../mainpa_services/pathology.service';
import { SearchService } from '../mainpa_services/search.service';
import { RearchStorePathService } from '../mainpa_services/store.path.service';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { concatMap, filter, first, map, take, tap } from 'rxjs/operators';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ITitleList } from './path.interface';
@Component({
  selector: 'app-mainpa',
  templateUrl: './mainpa.component.html',
  styleUrls: ['./mainpa.component.scss']
})
export class MainpaComponent implements OnInit, OnDestroy, AfterViewInit {

  private subs = new SubSink();
  lists$: Observable<IPatient[]>;
  lists: IPatient[];
  patientInfo: IPatient;
  patientID: string;
  pathologyNo = '';
  type = '';  // N:신규입력, R: 재입력

  isVisible = false;
  isSelected = false; // 화일등록이 되었는지 확인하는 플래그
  startday: string;
  endday: string;
  pathologyNO = '';
  patientid = '';

  usesearch = 'N';
  storeStartDay: string;
  storeEndDay: string;
  storePatientID: string;
  storePathologyNo: string;

  private apiUrl = emrUrl;
  initStatusValue = 'R';
  isDisabled = false;
  // listsForm: FormGroup;
  // pathList: ITitleList[] = [];

  @ViewChild('pbox100', { static: true }) pbox100: ElementRef;
  @ViewChildren('prescription, name, age, gender, patientid, pathologynum') newPath: QueryList<ElementRef>;


  constructor(
    private pathologyService: PathologyService,
    private serachService: SearchService,
    private router: Router,
    private store: RearchStorePathService,
    private sanitizer: DomSanitizer,

  ) { }

  ngOnInit(): void {

    this.checkStore();

    if (this.storeStartDay === null || this.storeEndDay === null) {
      // console.log('[init]', this.storeStartDay, this.storeEndDay);
      this.init();
    }


    if (this.pathologyNO.length === 0 && this.patientid.length === 0) {
      // console.log('[57][main]', this.pathologyNO, this.patientid, this.startToday(), this.endToday());
      this.reSearch(this.startToday(), this.endToday(), '', '');
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const scrolly = this.store.getScrollyPosition();
      this.pbox100.nativeElement.scrollTop = scrolly;
    }, 300);

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    // console.log('65 init');
    // 환자정보 가져오기
    this.lists$ = this.pathologyService.getPatientList()
      .pipe(
        tap(lists => console.log('[95]목록: ', lists))
      );

    this.subs.sink = this.lists$.subscribe(data => {
      this.lists = data;

    });
  }


  // 체크박스 실행

  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;

    return now;
  }

  startToday(): string {
    const oneMonthsAgo = moment().subtract(3, 'months');

    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');

    const now1 = yy + '-' + mm + '-' + dd;
    if (this.storeStartDay) {
      return this.storeStartDay;
    }
    return now1;
  }

  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);

    const now = year + '-' + newmon + '-' + newday;

    if (this.storeEndDay) {
      return this.storeEndDay;
    }
    return now;
  }


  saveUploadPageInfo(pathologyNum: string, i: number, type: string): void {
    this.store.setUploadpageInfo(pathologyNum, i, type);
  }

  goUploadpage(pathologyNo: string, i: number, type: string): void {
    this.store.setPathologyNo(pathologyNo);
    this.store.setType(type);
    console.log('[157][goUploadpage] ==> ', pathologyNo, i, type, this.isSelected);
    if (this.isSelected) {
      this.pathologyService.setPathologyNo(pathologyNo);
      this.pathologyService.setType(type); // // N:신규입력, R: 재입력
      this.type = type;


      this.pathologyService.setPersonalInfoandPathologyNum(i, pathologyNo);
    } else {

      this.saveUploadPageInfo(pathologyNo, i, type);
    }

    this.isVisible = !this.isVisible; // 신규
  }

  goReporter(idx: number): void {

    // 검체번호를 확인한다.
    const pathNum = this.pathologyService.getPathologyNum();
    this.pathologyService.setPatientIndex(idx);
    this.router.navigate(['/pathology', 'research', this.lists[idx].pathology_num]);
  }

  // 선택된 결과지 보고서
  goReporterClass(idx: number): any {
    const pathNum = this.pathologyService.getPathologyNum();
    if (this.lists[idx].pathology_num === pathNum) {
      return { btn_report: true };
    } else {
      return { btn_report: false };
    }
  }

  getDate(event): void {

  }

  // 환자 정보
  setPatientID(id: number): void {
    this.patientInfo = this.lists[id];
  }

  // 검체번호 설정
  setPathologyNo(pathologyNo: string): void {
    this.pathologyNo = pathologyNo;
  }

  reSearch(start: string, end: string, pathologynum: string = '', patient: string = '', saveStore = 'N'): void {

    this.startday = start;
    this.endday = end;
    this.pathologyNo = pathologynum;
    this.patientid = patient;
    this.store.setWhichstate('searchscreen');
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setPathologyNo(pathologynum);
    this.store.setPatientID(patient);
    if (saveStore === 'Y') {
      this.store.setUseSearch('Y');
    }



    this.lists = []; // 리스트 초기화
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');

    if (patient !== undefined && patient !== null) {
      patient = patient.trim();
    }

    if (pathologynum !== undefined && pathologynum !== null) {
      pathologynum = pathologynum.trim();
    }
    this.lists$ = this.pathologyService.search(startdate, enddate, patient, pathologynum)
      .pipe(
        take(1),
        filter(data => data.length > 0),
        // tap(data => console.log(' ********* [242]reSearch MAINPA **********> ', data)),
      );

    this.subs.sink = this.lists$
      .pipe(
        take(1),
        filter(data => data.length > 0),
        map((datas: IPatient[]) => datas.map(data => {
          if (data.recheck !== undefined) {
            data.loginid = data.recheck.split('_')[0];
            data.rechecker = data.recheck.split('_')[1];
          }
          return data;
        })),
        map((datas: IPatient[]) => datas.map(data => {
          const tempDate = data.prescription_date;
          const tempYear = data.prescription_date.slice(0, 4);
          const tempMon = data.prescription_date.slice(4, 6);
          const tempDay = data.prescription_date.slice(6, 8);
          const newDate = tempYear + '-' + tempMon + '-' + tempDay;
          data.prescription_date = newDate;
          return data;
        })),
        // tap(data => console.log(data)),
      )
      .subscribe((data) => {
        // console.log('[232][병리검색] [찿기]', data);
        this.lists = data;
        // console.log('[234] [목록길이]: ', this.lists.length);
      });

  }

  /******
   *  테이블의 목록이 8개 미만시
   *  bodytable 의 height를 57px로 조정
   */
  adjustBodyTable(): object {
    let bodytableHeight = 0;
    if (this.lists.length <= 8 && this.lists.length >= 1) {
      bodytableHeight = this.lists.length * 57;
      return { height: bodytableHeight + 'px;' };
    }
    return { height: '500px;' };
  }


  onSelected(): void {
    // console.log('[207] [onSelected]');

    this.startday = this.store.getSearchStartDay();
    this.endday = this.store.getSearchEndDay();
    this.pathologyNo = this.store.getPathologyNo();
    this.patientid = this.store.getPatientID();
    this.lists = []; // 리스트 초기화

    const status = this.store.getUseSearch();
    // console.log('[299][onSelected][ 상태] ', status);
    if (status === 'N') {
      this.pathologyNo = '';
      this.patientid = '';

    } else {
      this.store.setUseSearch('N');
    }
    // console.log('[257][파일 업로드후 검색조건]', this.startday, this.endday, this.pathologyNo, this.patientid.length);
    if (this.startday.length && this.endday.length && this.pathologyNo && this.patientid) {
      this.reSearch(this.startday, this.endday, this.pathologyNO, this.patientid, 'N');
    } else if (this.startday.length && this.endday.length && this.pathologyNo.length && this.patientid.length === 0) {
      this.reSearch(this.startday, this.endday, this.pathologyNo, '', 'N');
    } else if (this.startday.length && this.endday.length && this.pathologyNo.length === 0 && this.patientid.length) {
      this.reSearch(this.startday, this.endday, '', this.patientid, 'N');
    } else if (this.startday.length && this.endday.length && this.pathologyNo.length === 0 && this.patientid.length === 0) {
      this.reSearch(this.startday, this.endday, '', '', 'N');
    } else {
      this.init();
    }

    this.isVisible = true;

    this.isSelected = true;
    const uploadInfo = this.store.getUploadpageInfo();

    this.goUploadpage(uploadInfo.pathologyNum, uploadInfo.i, uploadInfo.type);

  }

  onCanceled(): void {
    this.isVisible = false;
    this.isSelected = false;
  }

  checkStore(): void {
    // console.log('[231][checkStore]');
    const status = this.store.getWhichstate();
    this.storeStartDay = this.store.getSearchStartDay();
    this.storeEndDay = this.store.getSearchEndDay();

    const pid = this.store.getPatientID();
    if (pid === undefined || pid === null) {
      this.storePatientID = '';
    } else {
      this.storePatientID = this.store.getPatientID();
    }

    const pnum = this.store.getPathologyNo();
    if (pnum === undefined || pnum === null) {
      this.storePathologyNo = '';
    } else {
      this.storePathologyNo = this.store.getPathologyNo();
    }


    this.startday = this.storeStartDay;
    this.endday = this.storeEndDay;
    this.pathologyNO = this.storePathologyNo;
    this.patientid = this.storePatientID;

    // console.log('=== [289][저장된것 불러온값]', this.startday, this.endday, this.pathologyNO, this.patientid);
    if (this.storeStartDay && this.storeEndDay) {
      this.reSearch(this.storeStartDay, this.storeEndDay, this.storePathologyNo, this.storePatientID);
    }

  }

  getUrl(list: IPatient, type: string): SafeResourceUrl {

    if (type === 'OR') {
      const orpath = list.orpath;
      const orfilename = list.tsvorfilename;
      const orurl = this.apiUrl + '/download?path=' + orpath + '&filename=' + orfilename;
      return this.sanitizer.bypassSecurityTrustResourceUrl(orurl);
    }
    const irpath = list.irpath;
    const irfilename = list.tsvirfilename;
    const irurl = this.apiUrl + '/download?path=' + irpath + '&filename=' + irfilename;
    return this.sanitizer.bypassSecurityTrustResourceUrl(irurl);

  }

  processingStatus(i: number): string {
    // console.log('=== [292][main][processingStatus][screenstatus]', this.lists[i]);
    if (this.lists.length > 0) {
      const status = this.lists[i].screenstatus;
      const filename = this.lists[i].tsvirfilename;
      if (parseInt(status, 10) === 0 && filename.length) {
        return '시작';
      } else if (parseInt(status, 10) === 1) {
        return '저장';
      } else if (parseInt(status, 10) === 2) {
        return '저장';
      } else if (parseInt(status, 10) === 3) {
        return 'EMR전송완료';
      } else if (parseInt(status, 10) === 4) {
        return '최종승인완료';
      } else {
        return '';
      }
    }

  }

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }

  searchData(start: string, end: string, pathologynum: string, patient: string, saveStore = 'N'): void {
    // console.log('[326] [search]');
    this.startday = start;
    this.endday = end;
    this.pathologyNo = pathologynum;
    this.patientid = patient;
    this.store.setWhichstate('searchscreen');
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setPathologyNo(pathologynum);
    this.store.setPatientID(patient);
    if (saveStore === 'Y') {
      this.store.setUseSearch('Y');
    }


    // console.log('=== [341][검색조건저장]', this.startday, this.endday, this.pathologyNo, this.patientid);
    this.lists = []; // 리스트 초기화
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');
    console.log('[399][main][search]', startdate, enddate, patient, pathologynum);
    if (patient !== undefined && patient !== null) {
      patient = patient.trim();
    }

    if (pathologynum !== undefined && pathologynum !== null) {
      pathologynum = pathologynum.trim();
    }
    this.lists$ = this.pathologyService.search(startdate, enddate, patient, pathologynum)
      .pipe(
        tap(data => console.log('data ==> ', data))
      );
    this.subs.sink = this.lists$.subscribe((data) => {
      // console.log('[409][병리검색]', data);
      this.lists = data;
      // console.log('[411][MAIN][SEARCH][리스트]: ', this.lists);
    });

  }

  onWrongFile(): void {
    this.isVisible = false;
  }

  addPathList(): void {
    this.isDisabled = true;
    this.lists.push({
      prescription_date: '',
      name: '',
      age: '',
      gender: '',
      patientID: '',
      pathological_dx: '',
      pathology_num: '',
      prescription_code: '',
      prescription_no: '',
      rel_pathology_num: '',
    });

    // this.initStatusValue = 'U';
    // this.lists[this.lists.length - 1].prescription_date = this.today();
  }

  addNew(id: number): void {
    // console.log(id);
    this.initStatusValue = 'U';
    this.lists[id].prescription_date = this.today();
  }

  //
  updateRow(id: number): void {

    const list = [];
    this.newPath.forEach((data, index) => {
      // console.log('[485][신규삽입] ', data.nativeElement.value);
      list.push(data.nativeElement.value);

    });

    const path: any = new Object();
    for (let i = 0; i < list.length; i++) {
      if (i === 0) {
        this.lists[id].prescription_date = list[i].replace(/-/g, '');
        path.prescription_date = list[i].replace(/-/g, '');
      }
      if (i === 1) {
        this.lists[id].name = list[i];
        path.name = list[i];
      }
      if (i === 2) {
        this.lists[id].age = list[i];
        path.age = list[i];
      }
      if (i === 3) {
        this.lists[id].gender = list[i];
        path.gender = list[i];
      }
      if (i === 4) {
        this.lists[id].patientID = list[i];
        path.patientID = list[i];
      }
      if (i === 5) {
        this.lists[id].pathology_num = list[i];
        path.pathology_num = list[i];
      }

    }

    this.initStatusValue = 'R';

    const start = this.startday.replace(/-/g, '');
    const end = this.endday.replace(/-/g, '');
    // console.log('[524][신규삽입] ', path);

    this.pathologyService.putNewPatient(path)
      .pipe(
        // tap(data => console.log('[524][신규삽입] ', data)),
        concatMap(() => this.pathologyService.search(start, end)),
      )
      .subscribe(data => {
        // console.log('[528][받은데이터] ', data);
        this.isDisabled = false;
        this.lists = data;

      });
  }

  deleteRow(i: number): void {
    const patientid = this.lists[i].patientID;
    this.pathologyService.deletePatient(patientid)
      .subscribe(data => {
        if (data.result === 'OK') {
          this.lists.splice(i, 1);
        }
      });
  }

}






