import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IPasswd, IPatient } from '../models/patients';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { MatDialog } from '@angular/material/dialog';
import { PwchangeComponent } from '../pwchange/pwchange.component';
import { ManageUsersService } from 'src/app/home/services/manageUsers.service';
import { map, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ExcelAddListService } from '../services/excelAddList';
import { ExcelService } from '../services/excel.service';

@Component({
  selector: 'app-byengri',
  templateUrl: './byengri.component.html',
  styleUrls: ['./byengri.component.scss']
})
export class ByengriComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  userid: string;
  username: string;
  dept = '병리';
  work = '';
  passwdInfo: IPasswd;

  constructor(
    private router: Router,
    private store: StorePathService,
    public dialog: MatDialog,
    private service: ManageUsersService,
    private excelService: ExcelAddListService,
    private excel: ExcelService,
  ) { }

  ngOnInit(): void {
    const userinfo = localStorage.getItem('pathuser');
    this.userid = JSON.parse(userinfo).userid;
    const pw = JSON.parse(userinfo).pw;

    this.service.getManageUsersList('', '', this.userid, '', 'P')
      .pipe(
        map(data => [data]),
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
            this.work = '임상병리사';
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
    localStorage.removeItem('userpart');
    localStorage.removeItem('pathuser');
    this.router.navigateByUrl('/login');
    // storage 시간동기화
    this.startToday();
    this.endToday();
    this.store.setPathologyNo('');
    this.store.setPatientID('');
    this.store.setWhichstate('mainscreen');
    this.store.setSearchStartDay('');
    this.store.setSearchEndDay('');
    this.store.setScrollyPosition(0);
  }

  goHome(): void {
    this.router.navigate(['/pathology']);
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

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PwchangeComponent, {
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
        this.service.updateMangeUser(id, this.userid, passwd, userNm, userGb, 'P', pickselect, part)
          .subscribe(val => {
            console.log(val.rowsAffected[0]);
            if (Number(val.rowsAffected[0]) === 1) {
              alert('변경 되었습니다.');
            }
          });
      }
    });
  }

  link(url: string): void {
    if (url === 'blacklist') {
      this.router.navigate(['pathology', 'blacklist']);
    } else if (url === 'orir') {
      this.router.navigate(['pathology', 'orir']);
    } else if (url === 'sequencing') {
      this.router.navigate(['pathology', 'sequencing']);
    }
  }


  excelDownload(): void {
    // event.preventDefault();
    // event.stopPropagation();
    // this.menu2 = false;

    this.subs.sink = this.excelService.excelList().subscribe((lists: any[]) => {
      console.log(lists);
      const excelLists: any[] = [];


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

  ngslink(): void {
    this.router.navigate(['/pathology', 'inhouse', 'ngsexcel']);
  }



}
