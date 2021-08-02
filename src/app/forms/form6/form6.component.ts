import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form6',
  templateUrl: './form6.component.html',
  styleUrls: ['./form6.component.scss']
})
export class Form6Component implements OnInit {

  tsvLists = '';
  preview = false;
  recheck;
  examin;
  firstReportDay;
  lastReportDay;
  requestDate;
  tablerowForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

  previewToggle(): void { }

  excelDownload(): void { }

  tableScroll(evt): void { }

  resizeHeight(): void { }

  tableHeader(): void { }

  dvSort(): void { }

  addRow(): void { }

  droped(evt): void { }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }


}
