import { Component, OnInit } from '@angular/core';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ICodement } from '../models/comments';

@Component({
  selector: 'app-managecode',
  templateUrl: './managecode.component.html',
  styleUrls: ['./managecode.component.scss']
})
export class ManagecodeComponent implements OnInit {

  type = 'none';
  lists: ICodement[] = [];
  reportLists: ICodement[] = [];
  report = '';
  tablerowForm: FormGroup;
  enableDisable = true;
  // testCode = '';

  constructor(
    private defaultService: CodeDefaultValue,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadForm();
  }

  loadData(): void {
    this.defaultService.getCodeLists().subscribe(data => {
      this.lists = data;
      // console.log(this.lists);
      this.findReportLists(this.type);
    });
  }

  findReportLists(type: string): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.clear();
    this.type = type;
    this.reportLists = this.lists.filter(list => list.type === type);
    this.reportLists = this.reportLists.sort((a, b) => {
      const x = a.report; const y = b.report;
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    if (type !== 'none') {
      this.reportLists.forEach(list => {
        this.commentsRows().push(this.createCommentRow(list));
      });
    }

  }

  testcode(code: string): void {
    console.log(code);
    this.report = this.reportLists.filter(list => list.code === code)[0].report;
    if (code === 'none') {
      this.enableDisable = true;
    } else {
      // this.testCode = code;
      this.enableDisable = !this.enableDisable;
      const control = this.tablerowForm.get('tableRows') as FormArray;
      control.clear();
      this.reportLists = this.lists.filter(list => list.code === code);
      this.reportLists.forEach(list => {
        this.commentsRows().push(this.createCommentRow(list));
      });
    }

  }
  ///////////////////////////////////////
  showHide(): boolean {
    return this.enableDisable;
  }

  ///////////////////////////////////////
  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }
  createCommentRow(ment: ICodement): FormGroup {
    return this.fb.group({
      id: ment.id,
      code: ment.code,
      report: ment.report,
      comment: ment.comment,
      type: ment.type
    });
  }

  newCommentRow(): FormGroup {
    return this.fb.group({
      id: 'N',
      code: '',
      report: '',
      comment: '',
      type: this.type
    });
  }

  commentsRows(): FormArray {
    return this.tablerowForm.get('tableRows') as FormArray;
  }

  addNewCommentRow(): void {
    this.commentsRows().push(this.newCommentRow());

  }

  removeCommentRow(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      this.commentsRows().removeAt(i);
    } else {
      return;
    }


  }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }


  //////////////////////////////////////////////////////////////







}
