import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../forms/store.current';
import { PatientsListService } from './services/patientslist';
import { StorePathService } from '../byengri/store.path.service';

import { IExcelData } from 'src/app/home/models/patients';
import { ExcelAddListService } from 'src/app/home/services/excelAddList';
import { ExcelService } from 'src/app/services/excel.service';


import { MatDialog } from '@angular/material/dialog';

import { ManageUsersService } from 'src/app/home/services/manageUsers.service';
import { IPasswd } from '../byengri/models/patients';
import { DiagpasswdchangeComponent } from './diagpasswdchange/diagpasswdchange.component';
import { filter, map, tap } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { StoreGENService } from '../forms/store.current.her';
import { StoreLYMService } from '../forms/store.current.lym';
import { StoreMDSService } from '../forms/store.current.mds';
import { StoreMLPAService } from '../forms/store.current.mlpa';
import { StoreSEQService } from '../forms/store.current.seq';

import { environment } from '../../environments/environment'; // 환경 경로에 맞게 수정

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  hospitalName = environment.home;

  private subs = new SubSink();
    
  // 25.09.12 암호 변경
  id: string;

  userid: string;
  username: string;
  dept = '진검';
  work = '';
  passwdInfo: IPasswd;
  menu1 = false;
  menu2 = false;
  menu3 = false;
  constructor(
    private router: Router,
    private patientsListService: PatientsListService,
    private store: StorePathService,
    public dialog: MatDialog,
    private service: ManageUsersService,
    private excelService: ExcelAddListService,
    private excel: ExcelService,


    private dstore: StoreService,
    private geneStore: StoreGENService,
    private lymStore: StoreLYMService,
    private mdsStore: StoreMDSService,
    private mlpaStore: StoreMLPAService,
    private seqStore: StoreSEQService,

  ) { }

  ngOnInit(): void {
    const userinfo = localStorage.getItem('diaguser');
    this.userid = JSON.parse(userinfo).userid;
    const pw = JSON.parse(userinfo).pw;

    // console.log(this.userid, pw);
    this.service.getManageUsersList('', '', this.userid, '', 'D')
      .pipe(
        //map(data => [data]),
        /*tap(data => { 
              console.log("[tap1] raw data:", data);
              console.log("[tap1] isArray?", Array.isArray(data));
                    }), // 원본 응답 찍기 */
        map(data => Array.isArray(data) ? data : [data]),
        map(values => values.filter(val => val.user_id === this.userid && val.password === pw)),
        map(datas => datas.map(data => {
          // 25.09.12 암호 변경
          if (data.user_gb === null) {
            data.user_gb = 'U';
          }

          // 25.09.12 암호 변경
          if (data.id === null) {
            data.id = '0';
          }

          if (data.pickselect === null) {
            data.pickselect = '';
            return data;
          }
          return data;
        }))
      )
      .subscribe(data => {
        if (data.length > 0) {
          this.passwdInfo = data[0];
          
          //console.log("[tap1] data:", data);
              
          this.username = data[0].user_nm;
          if (data[0].part_nm === 'Tester') {
            this.work = '기사';
          } else if (data[0].part_nm === 'Doctor') {
            this.work = '의사';
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  logout(): void {
    // console.log('로그아웃');
    this.startToday();
    this.endToday();
    localStorage.removeItem('userpart');
    localStorage.removeItem('diaguser');
    this.router.navigateByUrl('/login');

    // this.dstore.setamlPatientID('');
    // this.dstore.setamlSpecimenID('');
    // this.dstore.setStatus('');
    // this.dstore.setSheet('');
    // this.dstore.setWhichstate('mainscreen');
    // this.dstore.setSearchStartDay('');
    // this.dstore.setSearchEndDay('');
    this.dstore.setScrollyPosition(0);

  }

  goHome(): void {
    this.router.navigate(['/diag']);
  }

  startToday(): void {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth();  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    this.store.setSearchStartDay(now);
    //  console.log('home logout:', this.store.getSearchStartDay());
  }

  endToday(): void {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    this.store.setSearchEndDay(now);
    // console.log('home logout:', this.store.getSearchEndDay());
  }




  openDialog(): void {
    const dialogRef = this.dialog.open(DiagpasswdchangeComponent, {
      height: '480px',
      width: '800px',
      disableClose: true,
      data: {
        // 25.09.12 암호 변경
        userid: this.userid,
        username: this.username,
        dept: this.dept,
        work: this.work,
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      // console.log('[dialogRef]', this.passwdInfo, data);
      if (data !== undefined) {
        const id = this.passwdInfo.id;
        const passwd = data.newpassword;
        const userNm = data.username;
        const userGb = this.passwdInfo.user_gb;

        const pickselect = this.passwdInfo.pickselect;
        const tempPart = this.passwdInfo.part_nm;
        let part = '';

        if (tempPart === 'Tester') {
          part = 'T';
        } else {
          part = 'D';
        }
        this.service.updateMangeUser(id, this.userid, passwd, userNm, userGb, 'D', pickselect, part)
          .subscribe(val => {
            console.log(val.rowsAffected[0]);
            if (Number(val.rowsAffected[0]) === 1) {
              alert('변경 되었습니다.');

              localStorage.setItem(
                'diaguser',
                JSON.stringify({
                  userid: this.userid,
                  pw: passwd,
                }),
              )
            }
          });
      }
    });
  }

  ngslink(): void {
    // event.preventDefault();
    // event.stopPropagation();
    this.router.navigate(['/diag', 'inhouse', 'ngsexcel']);
  }

  ngsExcelLink(): void {

    this.router.navigate(['/diag', 'inhouse', 'patientexcel']);
  }

  comment(): void {
    this.router.navigate(['/diag', 'inhouse', 'genemgn']);
  }

  codemgn(): void {
    this.router.navigate(['/diag', 'inhouse', 'codemgn']);
  }

  ment(): void {
    this.router.navigate(['/diag', 'inhouse', 'ment']);
  }

  excelDownload(): void {


    this.subs.sink = this.excelService.excelList().subscribe((lists: IExcelData[]) => {
      console.log(lists);
      const excelLists: IExcelData[] = [];


      excelLists.push({
        tsvname: 'TSV파일명',
        name: '환자명',
        gender: '성별',
        age: '나이',
        patientID: '등록번호',
        acceptdate: '검사일시',
        reportdate: '저장일시',
        testcode: '결과지 구분',
        gene: 'Gene',
        functionalImpact: 'Functional Impact',
        transcript: 'Transcript',
        exonIntro: 'Exon/Intron',
        nucleotideChange: 'Nucleotide Change',
        aminoAcidChange: 'Amino Acid Change',
        zygosity: 'Zygosity',
        vafPercent: 'VAF %',
        references: 'Reference(s)',
        cosmicID: 'COSMIC ID'
      });

      lists.forEach(list => {
        excelLists.push({
          tsvname: list.tsvname,
          name: list.name,
          gender: list.gender,
          age: list.age,
          patientID: list.patientID,
          acceptdate: list.acceptdate,
          reportdate: list.reportdate,
          testcode: list.testcode,
          gene: list.gene,
          functionalImpact: list.functionalImpact,
          transcript: list.transcript,
          exonIntro: list.exonIntro,
          nucleotideChange: list.nucleotideChange,
          aminoAcidChange: list.aminoAcidChange,
          zygosity: list.zygosity,
          vafPercent: list.vafPercent,
          references: list.reference,
          cosmicID: list.cosmicID
        });
      });

      this.excel.exportAsExcelFile(excelLists, 'report');
    });

  }

  showMenu(): void {
    this.menu1 = true;
    this.menu2 = false;
    this.menu3 = false;
  }

  showMenu2(): void {
    this.menu1 = false;
    this.menu2 = true;
    this.menu3 = false;
  }

  showMenu3(): void {
    this.menu1 = false;
    this.menu2 = false;
    this.menu3 = true;
  }

  url(type: string): void {
    // event.preventDefault();
    // event.stopPropagation();
    this.menu1 = false;
    if (type === 'amlall') {
      this.dstore.setWhichstate('mainscreen');
      this.dstore.setSpecimentNo('');
      this.dstore.setPatientID('');
      this.dstore.setStatus('');
      this.dstore.setSheet('');
      this.dstore.setResearch('');
      this.dstore.setSearchStartDay('');
      this.dstore.setSearchEndDay('');
      this.dstore.setReceivedType('');
      this.router.navigate(['/diag', 'amlall', 'none']);

    } else if (type === 'lymphoma') {
      this.lymStore.setWhichstate('mainscreen');
      this.lymStore.setSpecimentNo('');
      this.lymStore.setPatientID('');
      this.lymStore.setStatus('');
      this.lymStore.setSheet('');
      this.lymStore.setResearch('');
      this.lymStore.setSearchStartDay('');
      this.lymStore.setSearchEndDay('');
      this.lymStore.setReceivedType('');
      this.router.navigate(['/diag', 'lymphoma']);

    } else if (type === 'mdsmpn') {
      this.mdsStore.setWhichstate('mainscreen');
      this.mdsStore.setSpecimentNo('');
      this.mdsStore.setPatientID('');
      this.mdsStore.setStatus('');
      this.mdsStore.setSheet('');
      this.mdsStore.setResearch('');
      this.mdsStore.setSearchStartDay('');
      this.mdsStore.setSearchEndDay('');
      this.mdsStore.setReceivedType('');
      this.router.navigate(['/diag', 'mdsmpn', 'none']);

    } else if (type === 'hereditary') {
      this.geneStore.setWhichstate('mainscreen');
      this.geneStore.setSpecimentNo('');
      this.geneStore.setPatientID('');
      this.geneStore.setStatus('');
      this.geneStore.setSheet('');
      this.geneStore.setResearch('');
      this.geneStore.setSearchStartDay('');
      this.geneStore.setSearchEndDay('');
      this.geneStore.setReceivedType('');
      this.router.navigate(['/diag', 'hereditary', 'none']);

    } else if (type === 'sequencing') {
      this.seqStore.setWhichstate('mainscreen');
      this.seqStore.setSpecimentNo('');
      this.seqStore.setPatientID('');
      this.seqStore.setStatus('');
      this.seqStore.setSheet('');
      this.seqStore.setResearch('');
      this.seqStore.setSearchStartDay('');
      this.seqStore.setSearchEndDay('');
      this.seqStore.setReceivedType('');
      this.router.navigate(['/diag', 'sequencing', 'none']);

    } else if (type === 'mlpa') {
      this.mlpaStore.setWhichstate('mainscreen');
      this.mlpaStore.setSpecimentNo('');
      this.mlpaStore.setPatientID('');
      this.mlpaStore.setStatus('');
      this.mlpaStore.setSheet('');
      this.mlpaStore.setResearch('');
      this.mlpaStore.setSearchStartDay('');
      this.mlpaStore.setSearchEndDay('');
      this.mlpaStore.setReceivedType('');
      this.router.navigate(['/diag', 'mlpa', 'none']);

    } else if (type === 'users') {
      this.router.navigate(['/diag', 'manageusers']);
    } else if (type === 'reportmgn') {
      this.router.navigate(['/diag', 'reportmgn']);
    }
  }

  url3(type: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.menu3 = false;
    if (type === 'users') {
      this.router.navigate(['/diag', 'manageusers']);
    } else if (type === 'reportmgn') {
      this.router.navigate(['/diag', 'reportmgn']);
    }
  }

  igtcr(): void {
    this.router.navigate(['/diag', 'igtcrMainLists']);
  }

  jspdf(): void {
    this.router.navigate(['/diag', 'jspdf']);
  }


  link(url: string): void {
    // event.preventDefault();
    // event.stopPropagation();
    // this.menu2 = false;
    let item = {
      url: '/diag/' + url + 'Component'
    };
    this.router.navigateByUrl(item.url);
  }

  toggleMenu(): any {
    if (this.menu1) {
      return { display: 'inline-block' };
    } else {
      return { display: 'none' };
    }
  }

  toggleMenu2(): any {
    if (this.menu2) {
      return { display: 'inline-block' };
    } else {
      return { display: 'none' };
    }
  }

  toggleMenu3(): any {
    if (this.menu3) {
      return { display: 'inline-block' };
    } else {
      return { display: 'none' };
    }
  }

  goBack(): void {
    this.router.navigate(['/diag']);
  }




}
