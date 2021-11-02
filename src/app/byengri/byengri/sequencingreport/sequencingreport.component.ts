import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PathologyService } from '../../services/pathology.service';

import { map, shareReplay, take, tap } from 'rxjs/operators';
import { IPatient } from '../../models/patients';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { emrUrl } from 'src/app/config';
import { SearchService } from '../../services/search.service';
import { SequencingService } from '../../services/sequencing.service';
import { IList } from '../../models/patients';

@Component({
  selector: 'app-sequencingreport',
  templateUrl: './sequencingreport.component.html',
  styleUrls: ['./sequencingreport.component.scss']
})
export class SequencingreportComponent implements OnInit {

  patientInfo: IPatient;
  pathologyNum: string;
  img1 = '';
  img2 = '';
  img3 = '';
  path = '';
  private apiUrl = emrUrl;

  examedno = 'none';  // 기사 ID
  examedname = 'none'; // 기사 이름
  checkeredno = 'none'; // 의사 ID
  checkername = 'none'; // 의사 이름
  examednoEMR: string;  // 기사 ID
  examednameEMR: string; // 기사 이름
  checkerednoEMR: string; // 의사 ID
  checkernameEMR: string; // 의사 이름

  examin = ''; // 검사자
  examinSeq: number;
  recheck = ''; // 확인자

  mt: IList[]; // 기사
  dt: IList[]; // 의사
  loginID: string; // 병리사 로그인

  reportday: string;
  screenstatus: string;
  mutation = '';

  title = '';
  descriptionCode = '';
  testCode = '';
  comments = '';

  prescriptioncode = [
    { code: 'PMO11007', title: 'EGFR exon 18,19,20,21 유전자 돌연변이 염기서열검사' },
    { code: 'PMO11017', title: 'C-Kit exon 9,11,13,17 유전자 돌연변이 염기서열검사' },
    { code: 'PMO11019', title: 'KRAS xon 2,3 유전자 돌연변이 염기서열검사' },
    { code: 'PMO11020', title: 'BRAF exon15(세포, 갑상선) 유전자 돌연변이 염기서열검사' },
    { code: 'PMO11042', title: 'TERT 프로모터 돌연변이 염기서열검사' },
    { code: 'PMO12054', title: 'BRAF exon15(조직, 갑상선유두암) 유전자 돌연변이 염기서열검사' },
    { code: 'PMO12057', title: 'BRAF exon15(전이성 대장직장암,혈액암,급여)유전자 돌연변이 염기서열검사' },
    { code: 'PMO12059', title: 'PDGFRA exon12,14,18 유전자 돌연변이 염기서열검사' },
    { code: 'PMO12060', title: 'NRAS(조직, 비급여) 유전자 돌연변이검사' }
  ];

  constructor(
    private route: ActivatedRoute,
    private pathologyService: PathologyService,
    private sanitizer: DomSanitizer,
    private searchService: SearchService,
    private router: Router,
    private sequencingService: SequencingService
  ) { }

  ngOnInit(): void {
    this.init();
    const user = JSON.parse(localStorage.getItem('pathuser'));
    this.loginID = user.userid;
    this.checker();
  }

  init(): void {
    this.route.paramMap.pipe(
      map(route => route.get('id')),
      take(1)
    ).subscribe(pathologyNum => {

      this.pathologyNum = pathologyNum; // 검체번호 저장
      try {
        this.patientInfo = this.pathologyService.patientInfo.filter(item => item.pathology_num === pathologyNum)[0];
        console.log('[73][환자정보] ', this.patientInfo, this.pathologyNum);
        this.descriptionCode = this.patientInfo.prescription_code;
        const idx = this.prescriptioncode.findIndex(list => list.code === this.descriptionCode);
        if (idx !== -1) {
          this.title = this.prescriptioncode.filter(list => list.code === this.descriptionCode)[0].title;
        }

        this.getSavedInfo(this.patientInfo.patientID);
        if (this.patientInfo.img1.length > 0) {
          const tempArr = this.patientInfo.img1.split('/');
          this.img1 = tempArr[4];
          this.path = tempArr[0] + '/' + tempArr[1] + '/' + tempArr[2] + '/' + tempArr[3];
        }
        if (this.patientInfo.img2.length > 0) {
          const tempArr = this.patientInfo.img2.split('/');
          this.img2 = tempArr[4];
          this.path = tempArr[0] + '/' + tempArr[1] + '/' + tempArr[2] + '/' + tempArr[3];
        }
        if (this.patientInfo.img3.length > 0) {
          const tempArr = this.patientInfo.img3.split('/');
          this.img3 = tempArr[4];
        }

        // 검체 검사자,확인자
        this.examin = this.patientInfo.examin; // 기사
        const exam = this.patientInfo.examin.split('_');
        this.examedno = exam[0];
        this.examedname = exam[1];
        this.recheck = this.patientInfo.recheck; // 의사
        const reck = this.patientInfo.recheck.split('_');
        this.checkeredno = reck[0];
        this.checkername = reck[1];

      } catch (err) {
        console.log(err);
      }
      this.getReportDate();

    });
  }

  getReportDate(): void {
    if (parseInt(this.patientInfo.screenstatus, 10) >= 1) {

      // 현재 상태정보 1: 저장, 3:EMR전송, 0: 시작
      this.screenstatus = this.patientInfo.screenstatus;
      // 저장일
      const tempReportday = this.patientInfo.report_date.slice(0, 10);
      if (parseInt(this.screenstatus, 10) === 1) {
        if (this.patientInfo.report_date === null || this.patientInfo.report_date === '' ||
          tempReportday === '1900-01-01') {
          this.reportday = this.today();
          // console.log('=== [281][1900-01-01]', tempReportday, this.reportday);
        } else {
          this.reportday = this.patientInfo.report_date.replace(/-/g, '.'); // 저장일
        }
      } else if (parseInt(this.screenstatus, 10) === 3) {
        if (this.patientInfo.sendEMRDate.toString() === null || this.patientInfo.sendEMRDate.toString() === '') {
          this.reportday = this.today();
        } else {
          this.reportday = this.patientInfo.sendEMRDate.toString().slice(0, 10).replace(/-/g, '.'); // EMR 전송일
        }
      } else {
        this.reportday = this.today();
      }

    } else {
      this.reportday = this.today();
    }
  }

  // 저장된 정보 검색
  getSavedInfo(patientid: string): void {
    this.sequencingService.listSequencing(patientid)
      .subscribe(data => {
        console.log('[152]', data);
        if (data.length > 0) {
          this.title = data[0].title;
          this.comments = data[0].comments;
          this.mutation = data[0].mutation;
        }


      });
  }

  getUrl(type: string): SafeResourceUrl {
    let url = '';
    if (type === 'img1') {
      url = this.apiUrl + '/showImage?path=' + this.path + '&filename=' + this.img1;
    } else if (type === 'img2') {
      url = this.apiUrl + '/showImage?path=' + this.path + '&filename=' + this.img2;
    } else if (type === 'img3') {
      url = this.apiUrl + '/showImage?path=' + this.path + '&filename=' + this.img3;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // 의사
  checked(rechecked: string): void {
    const reck = rechecked.split('_');
    this.checkeredno = reck[0];
    this.checkername = reck[1];

    this.patientInfo.recheck = rechecked;
    // console.log('[1690][Rechecked][의사]', this.checkername, this.checkeredno);
  }
  // 기사
  examimed(examin: string): void {
    const exam = examin.split('_');
    this.examedno = exam[0];
    this.examedname = exam[1];


    this.patientInfo.examin = examin;
    this.examin = examin;
    // console.log('[1705][Examine][기사]', exam, this.examedname, this.examedno);
  }


  checker(): void {
    const medi$ = this.searchService.listPath().pipe(
      // tap(data => console.log('[182][medi]', data)),
      shareReplay()
    );

    const mt$ = medi$.pipe(
      map(lists => lists.filter(list => list.part === 'T'))
    ).subscribe(mt => {
      this.mt = mt;


      if (Number(this.patientInfo.screenstatus) === 0) {
        this.mt.forEach(data => {
          if (data.user_id === this.loginID) {
            this.examedname = data.user_nm;
            this.examedno = data.user_id;

            this.patientInfo.examin = data.user_id + '_' + data.user_nm;
            this.examin = data.user_id + '_' + data.user_nm;

          }
        });
      }

    });

    const dt$ = medi$.pipe(
      map(lists => lists.filter(list => list.part === 'D')),
    ).subscribe(dt => {
      this.dt = dt;
    });

  }

  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '.' + newmon + '.' + newday;

    return now;
  }

  goBack(): void {
    this.router.navigate(['/pathology', 'sequencing']);
  }

  printScreen(): void {
    window.print();

  }

  save(): void {
    console.log(this.mutation,
      this.reportday,
      this.examin,
      this.recheck,
      this.patientInfo.patientID,
      this.title,
      this.descriptionCode,
      this.testCode,
      this.comments,
      this.patientInfo);

    this.sequencingService.insertSequencing(
      this.mutation,
      this.reportday,
      this.examin,
      this.recheck,
      this.patientInfo.patientID,
      this.title,
      this.descriptionCode,
      this.testCode,
      this.comments,
      this.patientInfo
    ).subscribe(data => {
      alert('저장 되었습니다.');
    });

  }

  // tslint:disable-next-line:typedef
  result(event) {
    this.mutation = event.srcElement.defaultValue;

  }

  radioStatus(type: string): boolean {
    if (type === this.mutation) {
      return true;
    }
    return false;
  }




}
