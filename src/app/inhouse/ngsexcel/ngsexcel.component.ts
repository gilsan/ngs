import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { IExcelData } from 'src/app/home/models/patients';
import { ExcelAddListService } from 'src/app/home/services/excelAddList';
import { ExcelService } from 'src/app/services/excel.service';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { from, Observable, of } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class OutlinkService {
  private apiUrl = emrUrl;
  constructor(private http: HttpClient) { }

  search(start: string, end: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report_xml/list`, { start, end, gubun: 'diag' });
  }
}

export interface INGS {
  id?: string;
  gbn: string;
  hospnm: string;
  proccorpcd: string;
  pid: string;
  hngnm: string;
  brthdd: string;
  sex: string;
  docuseqno: string;
  pay100ownbrate: string;
  clamacptno: string;
  preicd10cd: string;
  preicd10hngnm: string;
  posticd10cd: string;
  posticd10hngnm: string;
  age: string;
  testcd: string;
  testnm: string;
  bcno: string;
  orddd: string;
  prcpdd: string;
  prcpno: string;
  execprcpuntqno: string;
  spcnm: string;
  spccd: string;
  spcacptdt: string;
  lstreptdt: string;
  pv: string;
  pv_gene: string;
  vus: string;
  vus_gene: string;
}



@Component({
  selector: 'app-ngsexcel',
  templateUrl: './ngsexcel.component.html',
  styleUrls: ['./ngsexcel.component.scss']
})
export class NgsexcelComponent implements OnInit, OnDestroy {

  // lists: INGS[] = [];
  private subs = new SubSink();
  size = 0;
  count = 1;
  constructor(
    private excelService: ExcelAddListService,
    private excel: ExcelService,
    private snackBar: MatSnackBar,
    private linkService: OutlinkService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  ngsLists(datas: INGS[]): void {
    const ngsLists = [];

    // ngsLists.push({
    //   id: '순번', b1: '조건부선별급여접수번호', c1: '증례등록번호', proccorpcd: '요양기호', pid: '등록번호',
    //   f1: '환자명', g1: '생년월일', h1: '성별', i1: '청구여부', j1: '접수번호',
    //   k1: '명일련', l1: '본인부담률', m1: '본인부담률90%분', n1: '90% 본인부담률 소견서 작성 여부', o1: '패널명',
    //   p1: '패널구분', q1: '패널관리번호', r1: '검사 전\n상병분류기호', s1: '검사전상병명', t1: '검사 후\n상병분류기호',
    //   u1: '검사후상병명', v1: '해당질환\n가족력', w1: '고형암 여부', x1: '진행성, 전이성, 재발성 고형암', y1: '병기구분',
    //   z1: 'Stage', aa1: '행동양식 분류부호', ab1: '검체종류', ac1: '검체기타', ad1: '검체접수일',
    //   ae1: '검사보고일', af1: 'PV/LPV 검출 여부', ag1: 'PV/LPV 검출 유전자', ah1: 'VUS 검출여부', ai1: 'VUS 검출 유전자',
    //   aj1: '검사위탁', ak1: '인체유래물 등의\n기증 동의여부', al1: '기타 특이사항'
    // });



    // ngsLists.push({
    //   id: '순번', b1: '조건부선별급여접수번호', c1: '증례등록번호', proccorpcd: '요양기호', pid: '등록번호',
    //   hngnm: '환자명', brthdd: '생년월일', sex: '성별', i1: '청구여부', clamacptno: '접수번호',
    //   docuseqno: '명일련', pay100ownbrate: '본인부담률', m1: '본인부담률90%분', n1: '90% 본인부담률 소견서 작성 여부', testnm: '패널명',
    //   testcd: '패널구분', bcno: '패널관리번호', preicd10cd: '검사 전\n상병분류기호', preicd10hngnm: '검사전상병명', posticd10cd: '검사 후\n상병분류기호',
    //   posticd10hngnm: '검사후상병명', v1: '해당질환\n가족력', w1: '고형암 여부', x1: '진행성, 전이성, 재발성 고형암', y1: '병기구분',
    //   z1: 'Stage', aa1: '행동양식 분류부호', spccd: '검체종류', ac1: '검체기타', spcacptdt: '검체접수일',
    //   lstreptdt: '검사보고일', pv: 'PV/LPV 검출 여부', pv_gene: 'PV/LPV 검출 유전자', vus: 'VUS 검출여부', vus_gene: 'VUS 검출 유전자',
    //   hospnm: '검사위탁', ak1: '인체유래물 등의\n기증 동의여부', al1: '기타 특이사항'
    // });


    datas.forEach((item, idx) => {
      ngsLists.push({
        id: idx + 1, b1: '', c1: idx + 1, proccorpcd: item.proccorpcd, pid: item.pid,
        hngnm: item.hngnm, brthdd: item.brthdd, sex: item.sex, i1: 'Y', clamacptno: item.clamacptno,
        docuseqno: item.docuseqno, pay100ownbrate: item.pay100ownbrate, m1: '', n1: '', testnm: item.testnm,
        testcd: item.testcd, bcno: item.bcno, preicd10cd: item.preicd10cd, preicd10hngnm: item.preicd10hngnm, posticd10cd: item.posticd10cd,
        posticd10hngnm: item.posticd10hngnm, v1: '', w1: '', x1: '', y1: '',
        z1: '', aa1: '', spccd: item.spccd, ac1: '', spcacptdt: item.spcacptdt,
        lstreptdt: item.lstreptdt, pv: item.pv, pv_gene: item.pv_gene, vus: item.vus, vus_gene: item.vus_gene,
        hospnm: item.hospnm, ak1: '', al1: ''
      });

    });

    ngsLists.unshift({
      id: '', b1: '', c1: '', proccorpcd: '', pid: '',
      hngnm: '', brthdd: '', sex: '', i1: '', clamacptno: '',
      docuseqno: '', pay100ownbrate: '', m1: '', n1: '', testnm: '',
      testcd: '', bcno: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      posticd10hngnm: '', v1: '', w1: '', x1: '', y1: '',
      z1: '', aa1: '', spccd: '', ac1: '', spcacptdt: '',
      lstreptdt: '', pv: '', pv_gene: '', vus: '', vus_gene: '',
      hospnm: '', ak1: '', al1: ''
    });

    ngsLists.unshift({
      id: '', b1: '', c1: '', proccorpcd: '', pid: '',
      hngnm: '', brthdd: '', sex: '', i1: '', clamacptno: '',
      docuseqno: '', pay100ownbrate: '', m1: '', n1: '', testnm: '',
      testcd: '', bcno: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      posticd10hngnm: '', v1: '', w1: '', x1: '', y1: '',
      z1: '', aa1: '', spccd: '', ac1: '', spcacptdt: '',
      lstreptdt: '', pv: '', pv_gene: '', vus: '', vus_gene: '',
      hospnm: '', ak1: '', al1: ''
    });

    ngsLists.unshift({
      id: '', b1: '', c1: '', proccorpcd: '', pid: '',
      hngnm: '', brthdd: '', sex: '', i1: '', clamacptno: '',
      docuseqno: '', pay100ownbrate: '', m1: '', n1: '', testnm: '',
      testcd: '', bcno: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      posticd10hngnm: '', v1: '', w1: '', x1: '', y1: '',
      z1: '', aa1: '', spccd: '', ac1: '', spcacptdt: '',
      lstreptdt: '', pv: '', pv_gene: '', vus: '', vus_gene: '',
      hospnm: '', ak1: '', al1: ''
    });



    const ngwidth = [{ width: 6 }, { width: 21 }, { width: 12 }, { width: 12 }, { width: 9 },
    { width: 8 }, { width: 10 }, { width: 5 }, { width: 9 }, { width: 8 },
    { width: 7 }, { width: 9 }, { width: 14 }, { width: 19 }, { width: 24 },
    { width: 8 }, { width: 15 }, { width: 13 }, { width: 11 }, { width: 17 },
    { width: 55 }, { width: 13 }, { width: 11 }, { width: 26 }, { width: 8 },
    { width: 8 }, { width: 15 }, { width: 9 }, { width: 8 }, { width: 12 },
    { width: 12 }, { width: 15 }, { width: 33 }, { width: 12 }, { width: 36 },
    { width: 9 }, { width: 9 }, { width: 14 }
    ];

    this.excel.exortAsNGSTest(ngsLists, 'report', ngwidth);

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

  getDate(event): void {
    // console.log(event.toString().replace(/-/gi, ''));
  }

  search(start: string, end: string): void {
    const lists = [];

    const startday = start.replace(/-/g, '');
    const endday = end.replace(/-/g, '');

    console.log(startday, endday);
    this.subs.sink = this.linkService.search(startday, endday)
      .pipe(
        tap(data => console.log('[진검]', data)),
        tap(data => this.size = data.length),
        switchMap(datas => from(datas)),
        map((data: any) => {
          const pv_gene = data.pv_gene;
          const vus_gene = data.vus_gene;

          if (data.pv === 'Y') {
            const pvLen = pv_gene.split(/(\s+)/).length;
            if (pvLen > 1) {
              data.pv_gene = pv_gene.trim().replace(/[ ]/g, ',');
            }
          }

          if (data.vus === 'Y') {
            const pvLen = vus_gene.split(/(\s+)/).length;
            if (pvLen > 1) {
              data.vus_gene = vus_gene.trim().replace(/[ ]/g, ',');
            }
          }
          return data;
        }),
      )
      .subscribe(data => {
        this.snackBar.open('정상적으로 다운로드 하였습니다.', '닫기', { duration: 3000 });
        if (this.count < this.size) {
          lists.push(data);
          this.count++;
        } else if (this.count === this.size) {
          this.ngsLists(lists);
          this.count = 1;
          this.size = 0;
        }

      });


  }


}


    // worklist 내용
    // gbn : '진검병리구분'
    // hospnm :'기관명칭'
    // proccorpcd :'요양기호' --
    // pid :'등록번호'  --
    // hngnm :'성명' --
    // brthdd : '생년월일'
    // sex :'성별' --
    // docuseqno :'명일련' --
    // pay100ownbrate :'본인부담률' --
    // clamacptno :'접수번호'  --
    // preicd10cd :검사전상병분류기호 --
    // preicd10hngnm :검사전상병명 --
    // posticd10cd :검사후상병분류기호 --
    // posticd10hngnm :검사후상병명 --
    // age :'나이'
    // testcd :'검사코드'
    // testnm :'검사명'
    // bcno :'검체번호/병리번호'
    // orddd :'진료일'
    // prcpdd :'처방일'
    // prcpno :'처방번호
    // execprcpuntqno :'실시번호'
    // spcnm :'검체명'
    // spccd :'검체코드' --
    // spcacptdt:'접수일' --
    // lstreptdt :'보고일' --



    // gbn : '진검병리구분'
    // hospnm :'기관명칭'
    // brthdd : '생년월일'
    // age :'나이'
    // testcd :'검사코드'
    // testnm :'검사명'
    // bcno :'검체번호/병리번호'
    // orddd :'진료일'
    // prcpdd :'처방일'
    // prcpno :'처방번호
    // execprcpuntqno :'실시번호'
    // spcnm :'검체명'
