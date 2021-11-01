import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { ExcelService } from '../../services/excel.service';
import { SubSink } from 'subsink';
import { MatSnackBar } from '@angular/material/snack-bar';

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



@Component({
  selector: 'app-ngsexcel',
  templateUrl: './ngsexcel.component.html',
  styleUrls: ['./ngsexcel.component.scss']
})
export class NgsexcelComponent implements OnInit {

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
    console.log('[search]', start, end);

    this.subs.sink = this.linkService.search(start, end).subscribe((lists: any[]) => {
      console.log(lists);
      const excelLists: any[] = [];
      this.snackBar.open('정상적으로 다운로드 하였습니다.', '닫기', { duration: 3000 });
      excelLists.push({
        no: 'No',
        prescription_date: '검사일시',
        report_date: '저장일시',
        rel_pathology_num: '등록번호',
        pathology_num: '병리번호',
        pathological_dx: '관련병리번호\n(Tube number)',
        organ: 'Organ',
        diagnosis: 'Diagnosis',
        report_gb: '구분(C:PV/LPV 검출 유전자, P:VUS 검출 유전자)',
        gene: 'gene',
        amino_acid_change: 'variant(P) (참고:Amino acid change의미)',
        nucleotide_change: 'variant(N) (참고:Nucleotide change의미)',
        variant_allele_frequency: 'Allele Frequency'
      });

      const ngwidth = [{ width: 9 }, { width: 11 }, { width: 12 }, { width: 12 }, { width: 12 },
      { width: 25 }, { width: 9 }, { width: 9 }, { width: 42 }, { width: 9 },
      { width: 35 }, { width: 35 }, { width: 16 }
      ];

      lists.forEach((list, index) => {
        const count = index + 1;
        excelLists.push({
          no: count.toString(),
          prescription_date: list.orddd,
          report_date: list.lstreptdt,
          rel_pathology_num: list.pid,
          pathology_num: list.pathology_num,
          pathological_dx: list.rel_pathology_num,
          organ: list.organ,
          diagnosis: list.diagnosis,
          report_gb: list.report_gb,
          gene: list.gene,
          amino_acid_change: list.amino_acid_change,
          nucleotide_change: list.nucleotide_change,
          variant_allele_frequency: list.allele_frequency
        });
      });

      this.excel.exportAsExcelFile(excelLists, 'report', ngwidth);
    });


  }



}
