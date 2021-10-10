import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { IExcelData } from 'src/app/home/models/patients';
import { ExcelAddListService } from 'src/app/home/services/excelAddList';
import { ExcelService } from 'src/app/services/excel.service';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OutlinkService {


  search(start, end, type): Observable<INGS[]> {
    // tslint:disable-next-line:max-line-length
    const url = `http://emr012edu.cmcnu.or.kr/cmcnu/.live?submit_id=TRLII00147&business_id=li&instcd=012&infmdd=${start}&intodd=${end}&intype=${type}`;
    const data = [{
      gbn: 'L',
      hospnm: '가톨릭대학교 서울성모병원',
      proccorpcd: '11100338',
      pid: '35967076',
      hngnm: '박정남',
      brthdd: '20190101',
      sex: '2',
      docuseqno: '00964',
      pay100ownbrate: '5',
      clamacptno: '4037754',
      preicd10cd: 'C920',
      preicd10hngnm: '급성 골수모구성 백혈병',
      posticd10cd: 'C920',
      posticd10hngnm: '급성 골수모구성 백혈병',
      age: '2',
      testcd: 'LPE522',
      testnm: '유전성 골형성이상 질환 [NGS]',
      bcno: 'O278U3KK0',
      orddd: '20210429',
      prcpdd: '20210429',
      prcpno: '1401889545',
      execprcpuntqno: '1501301406',
      spcnm: 'EDTA blood',
      spccd: '1',
      spcacptdt: '20210429',
      lstreptdt: '20210429'
    }];

    return of(data);
  }


  constructor(
    private http: HttpClient
  ) { }
}

export interface INGS {
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
}



@Component({
  selector: 'app-ngsexcel',
  templateUrl: './ngsexcel.component.html',
  styleUrls: ['./ngsexcel.component.scss']
})
export class NgsexcelComponent implements OnInit, OnDestroy {

  lists: INGS[] = [];
  private subs = new SubSink();

  constructor(
    private excelService: ExcelAddListService,
    private excel: ExcelService,
    private linkService: OutlinkService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  ngsLists(datas: INGS[]): void {
    const ngsLists = [];

    ngsLists.push({
      a1: '순번', b1: '조건부선별급여접수번호', c1: '증례등록번호', d1: '요양기호', e1: '등록번호',
      f1: '환자명', g1: '생년월일', h1: '성별', i1: '청구여부', j1: '접수번호',
      k1: '명일련', l1: '본인부담률', m1: '본인부담률90%분', n1: '90% 본인부담률 소견서 작성 여부', o1: '패널명',
      p1: '패널구분', q1: '패널관리번호', r1: '검사 전\n상병분류기호', s1: '검사전상병명', t1: '검사 후\n상병분류기호',
      u1: '검사후상병명', v1: '해당질환\n가족력', w1: '고형암 여부', x1: '진행성, 전이성, 재발성 고형암', y1: '병기구분',
      z1: 'Stage', aa1: '행동양식 분류부호', ab1: '검체종류', ac1: '검체기타', ad1: '검체접수일',
      ae1: '검사보고일', af1: 'PV/LPV 검출 여부', ag1: 'PV/LPV 검출 유전자', ah1: 'VUS 검출여부', ai1: 'VUS 검출 유전자',
      aj1: '검사위탁', ak1: '인체유래물 등의\n기증 동의여부', al1: '기타 특이사항'
    });

    datas.forEach((item, idx) => {
      ngsLists.push({
        a1: '', b1: '', c1: '', d1: item.proccorpcd, e1: item.pid,
        f1: item.hngnm, g1: item.brthdd, h1: item.sex, i1: '', j1: item.clamacptno,
        k1: item.docuseqno, l1: item.pay100ownbrate, m1: '', n1: '', o1: item.testnm,
        p1: item.testcd, q1: item.bcno, r1: item.preicd10cd, s1: item.preicd10hngnm, t1: item.posticd10cd,
        u1: item.posticd10hngnm, v1: '', w1: '', x1: '', y1: '',
        z1: '', aa1: '', ab1: item.spccd, ac1: '', ad1: item.spcacptdt,
        ae1: item.lstreptdt, af1: '', ag1: '', ah1: '', ai1: '',
        aj1: item.hospnm, ak1: '', al1: ''
      });
    });

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


    const ngwidth = [{ width: 6 }, { width: 12 }, { width: 6 }, { width: 12 }, { width: 9 },
    { width: 8 }, { width: 8 }, { width: 4 }, { width: 4 }, { width: 8 },
    { width: 7 }, { width: 5 }, { width: 4 }, { width: 4 }, { width: 24 },
    { width: 5 }, { width: 15 }, { width: 12 }, { width: 11 }, { width: 8 },
    { width: 55 }, { width: 6 }, { width: 5 }, { width: 5 }, { width: 5 },
    { width: 4 }, { width: 4 }, { width: 9 }, { width: 5 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 27 }, { width: 9 }, { width: 36 },
    { width: 9 }, { width: 9 }, { width: 9 }
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

  search(start: string, end: string, type: string): void {
    const lists = [];

    if (type !== 'none') {
      const startday = start.replace(/-/g, '');
      const endday = end.replace(/-/g, '');

      console.log(startday, endday, type);
      this.subs.sink = this.linkService.search(startday, endday, type)
        .subscribe(data => {
          this.ngsLists(data);
        });
    } else {
      alert('검색항목을 선택해 주십시요.');
    }

  }




}
