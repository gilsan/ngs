import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import * as moment from 'moment';
import { from, Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { ExcelService } from '../../services/excel.service';
import { SubSink } from 'subsink';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OutlinkService {
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient,
  ) { }

  search(start: string, end: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report_xml_Path/list `, { start, end });
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
  // 24.05.01
  testcd2: string;
  // 24.05.01
  canceryn: string;
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
  stage: string;

  // 23.11.16
  monogenicyn?: string;
  monogenicdd?: string;
  monogenicnm?: string;

  organ: string;
  tumor_type: string;
  diagnosis: string;
  void1?: string;
  void2?: string;
  void3?: string;

  // 23.11.30
  tier? : string

}




@Component({
  selector: 'app-ngsexcel',
  templateUrl: './ngsexcel.component.html',
  styleUrls: ['./ngsexcel.component.scss']
})
export class NgsexcelComponent implements OnInit {
  size = 0;
  count = 1;
  private subs = new SubSink();
  constructor(
    private excel: ExcelService,
    private snackBar: MatSnackBar,
    private linkService: OutlinkService
  ) { }

  ngOnInit(): void {
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

  search(start: string, end: string): void {
    const lists = [];

    // const startday = start.replace(/-/g, '');
    // const endday = end.replace(/-/g, '');

    console.log(start, end);
    this.subs.sink = this.linkService.search(start, end)
      .pipe(
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

  ngsLists(datas: INGS[]): void {
    const ngsLists = [];
    // console.log('[166]', datas);
    datas.forEach((item, idx) => {
      const tumor_type = item.tumor_type.charAt(0).toLowerCase() + item.tumor_type.slice(1);
      const organ = item.organ.split(" ")[1];

      ngsLists.push({
        //24.05.01
      //id: idx + 1, b1: '', c1: idx + 1, proccorpcd: item.proccorpcd, pid: item.pid,
      id: idx + 1, b1: '', c1: idx + 1, proccorpcd: item.proccorpcd,
      hngnm: item.hngnm, brthdd: item.brthdd, sex: item.sex, i1: 'Y', clamacptno: item.clamacptno,
        docuseqno: item.docuseqno, pay100ownbrate: item.pay100ownbrate, m1: '', n1: '', testnm: item.testnm,
        // 24.05.01
        //testcd: item.testcd, bcno: item.bcno, preicd10cd: item.preicd10cd, preicd10hngnm: item.preicd10hngnm, posticd10cd: item.posticd10cd,
        testcd: item.testcd, testcd2: item.testcd2, preicd10cd: item.preicd10cd, preicd10hngnm: item.preicd10hngnm, posticd10cd: item.posticd10cd,
        // 24.05.01
        //posticd10hngnm: item.posticd10hngnm, v1: '', w1: '', x1: '', y1: '',
        posticd10hngnm: item.posticd10hngnm, v1: '', canceryn: item.canceryn,  x1: '', y1: '',
        z1: item.stage, aa1: '', spccd: item.spccd, ac1: '', spcacptdt: item.spcacptdt,
        lstreptdt: item.lstreptdt, 
        // 23.11.16
        //organ: organ, tumor_type: tumor_type, diagnosis: item.diagnosis, void1: '', void2: '', void3:'',
        organ: organ, tumor_type: tumor_type, diagnosis: item.diagnosis, void1: '', monogenicyn:item.monogenicyn, monogenicdd:item.monogenicdd, monogenicnm:item.monogenicnm,
        pv: item.pv, pv_gene: item.pv_gene, vus: item.vus, vus_gene: item.vus_gene,
        // 23.11.30
        //hospnm: item.hospnm, ak1: '', al1: '' 
        //24.05.01
      //hospnm: item.hospnm, ak1: '', al1: '', am1: '', an1: '', tier: item.tier
      hospnm: item.hospnm, ak1: 'Y', al1: '', am1: 'Y', an1: '', tier: item.tier, bcno: item.bcno, pid: item.pid

      });

    });

    ngsLists.unshift({
      //24.05.01
      //id: '', b1: '', c1: '', proccorpcd: '', pid: '',
      id: '', b1: '', c1: '', proccorpcd: '',
      hngnm: '', brthdd: '', sex: '', i1: '', clamacptno: '',
      docuseqno: '', pay100ownbrate: '', m1: '', n1: '', testnm: '',
      // 24.05.01
      //testcd: '', bcno: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      testcd: '', testcd2: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      // 24.05.01
        //posticd10hngnm: '', v1: '', w1: '', x1: '', y1: '',
        posticd10hngnm: '', v1: '', canceryn: '',  x1: '', y1: '',
      z1: '', aa1: '', spccd: '', ac1: '', spcacptdt: '',
      lstreptdt: '', 
      // 23.11.16
      //organ: '', tumor_type: '', diagnosis: '', void1: '', void2: '', void3:'',
      organ: '', tumor_type: '', diagnosis: '', void1: '', monogenicyn: '', monogenicdd:'', monogenicnm:'',
      pv: '', pv_gene: '', vus: '', vus_gene: '',
      // 23.11.30
      //hospnm: '', ak1: '', al1: ''
      // 24.05.01
      //hospnm: '', ak1: '', al1: '', am1: '', an1: '', tier: ''
      hospnm: '', ak1: '', al1: '', am1: '', an1: '', tier: '', bcno: '', pid: ''
    });

    ngsLists.unshift({
      //24.05.01
      //id: '', b1: '', c1: '', proccorpcd: '', pid: '',
      id: '', b1: '', c1: '', proccorpcd: '',
      hngnm: '', brthdd: '', sex: '', i1: '', clamacptno: '',
      docuseqno: '', pay100ownbrate: '', m1: '', n1: '', testnm: '',
      // 24.05.01
      //testcd: '', bcno: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      testcd: '', testcd2: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      // 24.05.01
        //posticd10hngnm: '', v1: '', w1: '', x1: '', y1: '',
        posticd10hngnm: '', v1: '', canceryn: '', x1: '', y1: '',
      z1: '', aa1: '', spccd: '', ac1: '', spcacptdt: '',
      lstreptdt: '', 
      // 23.11.16
      //organ: '', tumor_type: '', diagnosis: '', void1: '', void2: '', void3:'',
      organ: '', tumor_type: '', diagnosis: '', void1: '', monogenicyn: '', monogenicdd:'', monogenicnm:'',
      pv: '', pv_gene: '', vus: '', vus_gene: '',
      // 23.11.30
      //hospnm: '', ak1: '', al1: ''
      // 24.05.01
      //hospnm: '', ak1: '', al1: '', am1: '', an1: '', tier: ''
      hospnm: '', ak1: '', al1: '', am1: '', an1: '', tier: '', bcno: '', pid: ''
    });

    ngsLists.unshift({
      //24.05.01
      //id: '', b1: '', c1: '', proccorpcd: '', pid: '',
      id: '', b1: '', c1: '', proccorpcd: '',
      hngnm: '', brthdd: '', sex: '', i1: '', clamacptno: '',
      docuseqno: '', pay100ownbrate: '', m1: '', n1: '', testnm: '',
      // 24.05.01
      //testcd: '', bcno: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      testcd: '', testcd2: '', preicd10cd: '', preicd10hngnm: '', posticd10cd: '',
      // 24.05.01
        //posticd10hngnm: '', v1: '', w1: '', x1: '', y1: '',
        posticd10hngnm: '', v1: '', canceryn: '', x1: '', y1: '',
      z1: '', aa1: '', spccd: '', ac1: '', spcacptdt: '',
      lstreptdt: '',   
      // 23.11.16
      //organ: '', tumor_type: '', diagnosis: '', void1: '', void2: '', void3:'',
      organ: '', tumor_type: '', diagnosis: '', void1: '', monogenicyn: '', monogenicdd:'', monogenicnm:'',
      pv: '', pv_gene: '', vus: '', vus_gene: '',
      // 23.11.30
      //hospnm: '', ak1: '', al1: ''
      // 24.05.01
      //hospnm: '', ak1: '', al1: '', am1: '', an1: '', tier: ''
      hospnm: '', ak1: '', al1: '', am1: '', an1: '', tier: '', bcno: '', pid: ''
    });



    const ngwidth = [{ width: 6 }, { width: 21 }, { width: 12 }, { width: 12 }, { width: 9 }, // A, B, C, D,E
    { width: 10 }, { width: 10 }, { width: 5 }, { width: 9 }, { width: 8 },    // F, G, H, I, J,
    { width: 7 }, { width: 9 }, { width: 14 }, { width: 19 }, { width: 24 },  // k,L, M, N, O
    { width: 12 }, { width: 15 }, { width: 13 }, { width: 11 }, { width: 17 }, // p,q,R, S, T,
    { width: 55 }, { width: 13 }, { width: 11 }, { width: 26 }, { width: 8 }, //u,v, W, X, Y,
    { width: 8 }, { width: 15 }, { width: 9 }, { width: 10 }, { width: 12 }, // Z, AA, AB, AC, AD,
    { width: 12 }, { width: 15 }, { width: 33 }, { width: 12 }, { width: 36 }, //AE, AF,AG, AH, AI
    // 23.11.16
    //{ width: 9 }, { width: 9 }, { width: 17 },  // AJ,AK, AL
    { width: 9 }, { width: 9 }, { width: 17 }, { width: 36 },  // AJ,AK, AL, AM
    { width: 17 }, { width: 15 }, { width: 20 }, { width: 12 }, { width: 28 }, // AN, AO,AP,AQ, AR
    //23.11.30
    //{ width: 14 }, { width: 9 }, { width: 14 } //AS, AT, AU
    { width: 14 }, { width: 9 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 } , { width: 14 }//AS, AT, AU, AV, AW
    
    ];

    this.excel.exortAsNGSTest(ngsLists, 'report', ngwidth);

  }



}
