import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../forms/store.current';
import { PatientsListService } from './services/patientslist';
import { StorePathService } from '../byengri/store.path.service';

import { MatDialog } from '@angular/material/dialog';

import { ManageUsersService } from 'src/app/home/services/manageUsers.service';
import { IPasswd } from '../byengri/models/patients';
import { DiagpasswdchangeComponent } from './diagpasswdchange/diagpasswdchange.component';
import { filter, map, tap } from 'rxjs/operators';
import { ExcelAddListService } from './services/excelAddList';
import { IExcelData } from './models/patients';
import { ExcelService } from '../services/excel.service';
import { SubSink } from 'subsink';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private subs = new SubSink();

  userid: string;
  username: string;
  dept = '진검';
  work = '';
  passwdInfo: IPasswd;

  constructor(
    private router: Router,
    private dstore: StoreService,
    private patientsListService: PatientsListService,
    private store: StorePathService,
    public dialog: MatDialog,
    private service: ManageUsersService,
    private excelService: ExcelAddListService,
    private excel: ExcelService,
  ) { }

  ngOnInit(): void {
    const userinfo = localStorage.getItem('diaguser');
    this.userid = JSON.parse(userinfo).userid;
    const pw = JSON.parse(userinfo).pw;

    console.log(this.userid, pw);
    this.service.getManageUsersList('', '', this.userid, '', 'D')
      .pipe(
        map(values => values.filter(val => val.user_id === this.userid && val.password === pw)),
        map(datas => datas.map(data => {
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
    console.log('로그아웃');
    this.startToday();
    this.endToday();
    localStorage.removeItem('userpart');
    localStorage.removeItem('diaguser');
    this.router.navigateByUrl('/login');
    this.dstore.setamlPatientID('');
    this.dstore.setamlSpecimenID('');
    this.dstore.setStatus('');
    this.dstore.setSheet('');
    this.dstore.setWhichstate('mainscreen');
    this.dstore.setSearchStartDay('');
    this.dstore.setSearchEndDay('');
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
    console.log('home logout:', this.store.getSearchStartDay());
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
    console.log('home logout:', this.store.getSearchEndDay());
  }

  link(url: string): void {
    let item = {
      url: '/diag/' + url + 'Component'
    };
    this.router.navigateByUrl(item.url);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DiagpasswdchangeComponent, {
      height: '480px',
      width: '800px',
      disableClose: true,
      data: {
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
            }
          });
      }
    });
  }

  excelDownload(): void {

    this.subs.sink = this.excelService.excelList().subscribe((lists: IExcelData[]) => {
      console.log(lists);
      const excelLists: IExcelData[] = [];

      
      excelLists.push({
        name: "환자명",
        gender: "성별",
        age: "나이",
        patientID: "등록번호",
        acceptdate: "검사일시",
        reportdate: "저장일시",
        testcode: "결과지 구분",
        gene: "gene",
        functionalImpact: "functional_Impact",
        transcript: "transcript",
        exonIntro: "exonIntro",
        nucleotideChange: "nucleotideChange",
        aminoAcidChange: "aminoAcidChange",
        zygosity: "zygosity",
        vafPercent: "vafPercent",
        references: "references",
        cosmicID: "cosmicID"
      });

      lists.forEach(list => {
        excelLists.push({
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
          references: list.references,
          cosmicID: list.cosmicID
        });
      });
      this.excel.exportAsExcelFile(excelLists, 'report');
    });

  }




}
