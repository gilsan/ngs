import { Component, OnInit } from '@angular/core';
import { emrUrl } from 'src/app/config';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { ICode } from '../models/artifacts';

@Component({
  selector: 'app-managecode',
  templateUrl: './managecode.component.html',
  styleUrls: ['./managecode.component.scss']
})
export class ManagecodeComponent implements OnInit {

  private apiUrl = emrUrl;
  type = 'SEQ';
  lists: ICode[] = [];
  reportLists: ICode[] = [];
  constructor(
    private defaultService: CodeDefaultValue,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.defaultService.getCodeLists().subscribe(data => {
      this.lists = data;
      this.findReportLists(this.type);
    });
  }

  findReportLists(type: string): void {
    this.type = type;
    this.reportLists = this.lists.filter(list => list.type === type);
    this.reportLists = this.reportLists.sort((a, b) => {
      const x = a.report; const y = b.report;
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

}
