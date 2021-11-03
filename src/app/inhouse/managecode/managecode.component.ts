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
  workingcode = '';
  workingcodeShow = false;
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
      this.findReportLists(this.type);
    });
  }

  findReportLists(type: string): void {

    this.tablerowsClear();
    this.commentClear();
    this.code = 'none';
    this.type = type;
    this.workingcode = '';
    this.reportLists = this.lists.filter(list => list.type === type);
    this.reportLists = this.reportLists.sort((a, b) => {
      const x = a.code; const y = b.code;
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    if (type !== 'none') {
      this.reportLists.forEach(list => {
        this.commentsRows().push(this.createCommentRow(list));
      });
      this.disAble = false;
    } else {
      this.disAble = true;
      this.exshow = false;
    }

  }

  testcode(code: string): void {

    this.report = this.reportLists.filter(list => list.code === code)[0].report;
    if (code === 'none') {
      this.disAble = true;
    } else {
      this.workingcode = code;
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
    this.workingcode = '';

    if (rowData.id === 'N') {
      this.defaultService.codeinsertItem(this.type, rowData)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
        });
    } else {
      this.defaultService.codeupdateItem(this.type, rowData)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
        });
    }

    const commentControl = this.tablerowForm.get('commentRows') as FormArray;
    const commentFormData: ICodecomment[] = commentControl.getRawValue();
    console.log('[110][저장]', commentFormData);
    commentFormData.forEach(list => {
      if (list.id === 'N') {
        list.code = rowData.code;
        this.defaultService.commentinsertItem([list])
          .subscribe(data => {
            this.snackBar.open('저장 했습니다.', '닫기', { duration: 2000 });
          });
      } else {
        this.defaultService.commentupdateItem([list])
          .subscribe(data => {
            this.snackBar.open('저장 했습니다.', '닫기', { duration: 2000 });
          });
      }
    });
    this.commentClear();

  }

  newSave(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const rowData: ICodement = control.at(i).value;
    this.code = 'none';
    this.disAble = false;
    this.show = true;
    this.exshow = false;
    this.workingcode = '';
    // readingcomment
    const commentControl = this.tablerowForm.get('commentRows') as FormArray;
    const commentFormData = commentControl.getRawValue();
    for (const el of commentFormData) {
      el.code = rowData.code;
    }

    this.defaultService.commentinsertItem(commentFormData).subscribe(data => {
      this.commentClear();
    });

    this.defaultService.codeinsertItem(this.type, rowData).subscribe(data => {
      this.reportLists = [...this.reportLists, rowData];
      this.lists = [...this.lists, rowData];
      this.tablerowsClear();

      this.reportLists.forEach(list => {

        this.commentsRows().push(this.createCommentRow(list));
      });
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
    const commentControl = this.tablerowForm.get('commentRows') as FormArray;
    const commentFormData = commentControl.at(i).value;
    console.log('[222][예문삭제]', commentFormData);
    this.mentsRow().removeAt(i);
    this.defaultService.commentdeleteItem(commentFormData)
      .subscribe(data => {
        console.log('[225][예문삭제]', data);
      });

  }

  // 보고서 보기
  showExample(): void {
    this.exshow = true;
  }

  // 예문보기 선택시
  getExampleLists(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.at(i).value;
    console.log('[227]', formData);
    this.workingcode = formData.code;
    this.defaultService.getCommentLists(this.type, formData.code)
      .subscribe(lists => {
        console.log('[예문보기]', lists);
        this.commentClear();
        this.displayExample(lists);
        this.exshow = true;
      });
  }

  removeCommentRow(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      this.workingcode = '';
      const control = this.tablerowForm.get('tableRows') as FormArray;
      const rowData: ICodement = control.at(i).value;
      console.log('[242]', rowData);
      this.defaultService.codedeleteItem(rowData.id)
        .subscribe(data => {
          this.commentsRows().removeAt(i);
          this.snackBar.open('삭제 했습니다.', '닫기', { duration: 3000 });
          const idx = this.lists.findIndex(list => list.id === rowData.id);
          this.lists.splice(idx, 1);
          const index = this.reportLists.findIndex(list => list.id === rowData.id);
          this.reportLists.splice(index, 1);
        });

      const commentControl = this.tablerowForm.get('commentRows') as FormArray;
      const commentFormData: ICodecomment[] = commentControl.getRawValue();
      if (commentFormData.length > 0) {
        commentFormData.forEach(list => {
          if (list.id !== 'N') {
            this.defaultService.commentdeleteItem([list])
              .subscribe(data => {
                console.log('삭제');
              });
          }
        });
        this.commentClear();
      } else {
        this.defaultService.getCommentLists(this.type, rowData.code)
          .subscribe(data => {
            data.forEach(list => {
              this.defaultService.commentdeleteItem([list])
                .subscribe(item => console.log(item));
            });
          });
      }

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

  // commentSave(i: number): void {

  // }

  // commentDelete(i: number): void {

  // }

  /////////////////////////////////////////////////////////////

  edit(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
  }

  cancel(i: number): void {
    this.workingcode = '';
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
