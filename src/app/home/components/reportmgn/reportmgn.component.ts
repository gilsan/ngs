import { Component, OnInit } from '@angular/core';
import { ReportService } from './reportmgn.service';

@Component({
  selector: 'app-reportmgn',
  templateUrl: './reportmgn.component.html',
  styleUrls: ['./reportmgn.component.scss']
})
export class ReportmgnComponent implements OnInit {

  amlChecker = '';
  amlReader = '';
  lymChecker = '';
  lymReader = '';
  mdsChecker = '';
  mdsReader = '';
  genChecker = '';
  genReader = '';
  seqChecker = '';
  seqReader = '';
  mlpaChecker = '';
  mlpaReader = '';


  constructor(
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
  }

  save(type: string, checker: string, reader: string): void {
    this.reportService.getListUpdate(type, checker, reader)
      .subscribe(data => {
        alert('저장 하였습니다.');
      });
  }

  retrive(type: string): void {
    this.reportService.getLists(type)
      .subscribe((data) => {

        this.display(type, data[0].checker, data[0].reader);
      });
  }

  display(type: string, checker: string, reader: string): void {
    if (type === 'AMLALL') {
      this.amlChecker = checker;
      this.amlReader = reader;
    } else if (type === 'LYM') {
      this.lymChecker = checker;
      this.lymReader = reader;
    } else if (type === 'MDS') {
      this.mdsChecker = checker;
      this.mdsReader = reader;
    } else if (type === 'Genetic') {
      this.genChecker = checker;
      this.genReader = reader;
    } else if (type === 'SEQ') {
      this.seqChecker = checker;
      this.seqReader = reader;
    } else if (type === 'MLPA') {
      this.mlpaChecker = checker;
      this.mlpaReader = reader;
    }
  }

}
