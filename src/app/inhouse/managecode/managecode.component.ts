import { Component, OnInit } from '@angular/core';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ICodecomment, ICodement } from '../models/comments';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  code = 'none';

  constructor(
    private defaultService: CodeDefaultValue,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadForm();
  }

  loadData(): void {
    this.defaultService.getCodeLists().subscribe(data => {
      this.lists = data;
      console.log('[36] ', this.lists);
      this.findReportLists(this.type);
    });
  }

  findReportLists(type: string): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.clear();
    this.code = 'none';
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
      this.enableDisable = false;
    } else {
      this.enableDisable = true;
    }

  }

  testcode(code: string): void {
    // console.log(code);
    this.report = this.reportLists.filter(list => list.code === code)[0].report;
    if (code === 'none') {
      this.enableDisable = true;
    } else {
      this.code = code;
      this.enableDisable = false;
      const control = this.tablerowForm.get('tableRows') as FormArray;
      control.clear();
      this.lists.filter(list => list.code === code).forEach(list => {
        this.commentsRows().push(this.createCommentRow(list));
      });

      this.commentClear();
    }

  }
  ///////////////////////////////////////
  showHide(): boolean {
    return this.enableDisable;
  }

  save(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const rowData: ICodement = control.at(i).value;
    const idx = this.lists.findIndex(list => list.id === rowData.id);
    this.lists[idx] = rowData;
    console.log('[84][저장]', rowData);

    if (rowData.id === 'N') {
      this.defaultService.codeinsertItem(this.type, rowData)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
        });
    } else {
      this.defaultService.codeupdateItem(this.type, rowData)
        .subscribe(data => {
          this.snackBar.open('수정 했습니다.', '닫기', { duration: 3000 });
        });
    }

  }

  ///////////////////////////////////////
  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([]),
      commentRows: this.fb.array([])
    });
  }
  createCommentRow(ment: ICodement): FormGroup {
    return this.fb.group({
      id: ment.id,
      code: ment.code,
      report: ment.report,
      type: ment.type,
    });
  }

  newCommentRow(): FormGroup {
    return this.fb.group({
      id: 'N',
      code: '',
      report: '',
      type: this.type,
    });
  }

  commentsRows(): FormArray {
    return this.tablerowForm.get('tableRows') as FormArray;
  }

  addNewCommentRow(): void {
    this.commentsRows().push(this.newCommentRow());
    this.mentsRow().push(this.newMentRow());
  }

  removeCommentRow(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      const control = this.tablerowForm.get('tableRows') as FormArray;
      const rowData: ICodement = control.at(i).value;
      this.defaultService.codedeleteItem(rowData.id)
        .subscribe(data => {
          this.commentsRows().removeAt(i);
          this.snackBar.open('삭제 했습니다.', '닫기', { duration: 3000 });
        });
    } else {
      return;
    }
  }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }
  //////////////////////////////////////////////////////////////
  createMentRow(ment: ICodecomment): FormGroup {
    return this.fb.group({
      id: ment.id,
      code: ment.code,
      comment: ment.comment,
      type: ment.type,
    });
  }

  newMentRow(): FormGroup {
    return this.fb.group({
      id: 'N',
      code: this.code,
      comment: '',
      type: this.type,
    });
  }

  mentsRow(): FormArray {
    return this.tablerowForm.get('commentRows') as FormArray;
  }

  addNewMentRow(): void {
    this.mentsRow().push(this.newMentRow());
  }

  commentClear(): void {
    const commentControl = this.tablerowForm.get('commentRows') as FormArray;
    commentControl.clear();
  }

  commentSave(i: number): void {

  }

  commentDelete(i: number): void {

  }





  /////////////////////////////////////////////////////////////

  edit(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
  }

  cancel(i: number): void {
    this.code = 'none';
    this.reportLists.forEach(list => {
      this.commentsRows().push(this.createCommentRow(list));
    });
  }



}
