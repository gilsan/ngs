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
  disAble = true;
  code = 'none';
  show = true;
  exshow = false;

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
      // console.log('[36] ', this.lists);
      this.findReportLists(this.type);
    });
  }

  findReportLists(type: string): void {
    // const control = this.tablerowForm.get('tableRows') as FormArray;
    // control.clear();
    this.tablerowsClear();
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
      this.disAble = false;
    } else {
      this.disAble = true;
    }

  }

  testcode(code: string): void {
    // console.log(code);
    this.report = this.reportLists.filter(list => list.code === code)[0].report;
    if (code === 'none') {
      this.disAble = true;
    } else {
      this.code = code;
      this.disAble = true;

      this.tablerowsClear();
      this.lists.filter(list => list.code === code).forEach(list => {
        this.commentsRows().push(this.createCommentRow(list));
      });

      this.commentClear();
    }

  }
  ///////////////////////////////////////
  showHide(): boolean {
    return this.disAble;
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

  newSave(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const rowData: ICodement = control.at(i).value;
    this.code = 'none';
    this.disAble = false;
    this.show = true;
    this.exshow = false;


    this.reportLists = [...this.reportLists, rowData];
    this.reportLists.forEach(list => {
      this.commentsRows().push(this.createCommentRow(list));
    });

    // readingcomment
    const commentControl = this.tablerowForm.get('commentRows') as FormArray;
    const commentFormData = commentControl.getRawValue();
    for (const el of commentFormData) {
      el.code = rowData.code;
    }

    console.log('[129][신규저장]', commentFormData, rowData);
    this.defaultService.commentinsertItem(commentFormData).subscribe(data => {
      console.log('[131][판독문저장]');
      this.commentClear();

    });

    this.defaultService.codeinsertItem(this.type, rowData).subscribe(data => {
      this.tablerowsClear();
    });
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

  // 신규추가
  addNewCommentRow(): void {
    this.tablerowsClear();
    this.commentClear();
    this.code = 'new';
    this.disAble = true;
    this.exshow = true;
    this.show = false;
    this.commentsRows().push(this.newCommentRow());
    this.mentsRow().push(this.newMentRow());
  }

  // 예문신규추가
  addNewExampleRow(): void {
    this.mentsRow().push(this.newMentRow());
  }

  // 예문출력
  displayExample(lists: ICodecomment[]): void {
    lists.forEach(list => {
      this.mentsRow().push(this.createMentRow(list));
    });
  }

  // 예문삭제
  deletExampleRow(i: number): void {
    this.mentsRow().removeAt(i);
  }

  // 보고서 보기
  showExample(): void {
    this.exshow = true;
  }

  // 예문보기 선택시
  getExampleLists(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.at(i).value;
    this.defaultService.getCommentLists(this.type, formData.code)
      .subscribe(lists => {
        console.log('[195][예문보기] ', lists)
      });
  }

  removeCommentRow(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      const control = this.tablerowForm.get('tableRows') as FormArray;
      const rowData: ICodement = control.at(i).value;
      this.commentClear();

      this.defaultService.codedeleteItem(rowData.id)
        .subscribe(data => {
          this.commentsRows().removeAt(i);
          this.snackBar.open('삭제 했습니다.', '닫기', { duration: 3000 });
        });
    } else {
      return;
    }
  }

  tablerowsClear(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.clear();
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
    this.disAble = false;
    this.show = true;
    this.exshow = false;
    this.tablerowsClear();
    this.commentClear();
    this.reportLists.forEach(list => {
      this.commentsRows().push(this.createCommentRow(list));
    });
  }





  ///////////////////////////////////////////////////////////////////

}
