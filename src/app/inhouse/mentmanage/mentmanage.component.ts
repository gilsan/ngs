import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { SubSink } from 'subsink';
import { IMent } from '../models/artifacts';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mentmanage',
  templateUrl: './mentmanage.component.html',
  styleUrls: ['./mentmanage.component.scss']
})
export class MentmanageComponent implements OnInit, OnDestroy {

  selected = 'none';
  tablerowForm: FormGroup;
  private subs = new SubSink();
  type = '';
  lists: IMent[] = [];
  reportLists: IMent[] = [];
  report = '';
  code = 'N';
  constructor(
    private fb: FormBuilder,
    private defaultService: CodeDefaultValue,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadForm();
    this.loadData();

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }


  loadData(): void {
    this.defaultService.getLists()
      .subscribe(lists => {
        console.log('[47]', lists);
        this.lists = lists;
        this.findLists(this.type);
      });
  }


  findLists(type: string): void {
    this.type = type;
    console.log('[56]', type);

    this.reportLists = this.lists.filter(list => list.type === type);
    this.reportLists = this.reportLists.sort((a, b) => {
      const x = a.code; const y = b.code;
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    this.reportLists.forEach(list => {
      this.commentsRows().push(this.createCommentRow(list));
    });

  }

  testcode(code: string): void {
    console.log(code);
    if (code === 'none') {
      return;
    } else {
      this.code = code;
      this.report = this.reportLists.filter(list => list.code === code)[0].report;
      const control = this.tablerowForm.get('tableRows') as FormArray;
      control.clear();
      this.lists.filter(list => list.code === code).forEach(list => {
        this.commentsRows().push(this.createCommentRow(list));
      });
    }

  }


  createCommentRow(ment: IMent): FormGroup {
    return this.fb.group({
      code: ment.code,
      report: ment.report,
      target: ment.target,
      specimen: ment.specimen,
      analyzedgene: ment.analyzedgene,
      method: ment.method,
      comment1: ment.comment1,
      comment2: ment.comment2,
      mode: 'D',
      id: ment.id
    });
  }

  newCommentRow(): FormGroup {
    return this.fb.group({
      code: '',
      report: '',
      target: '',
      specimen: '',
      analyzedgene: '',
      method: '',
      comment1: '',
      comment2: '',
      mode: 'E',
      id: 'N'
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

      const control = this.tablerowForm.get('tableRows') as FormArray;
      const rowData: IMent = control.at(i).value;
      this.commentsRows().removeAt(i);
      console.log('[136][삭제]', control.getRawValue());
      this.defaultService.deleteItem(rowData.id)
        .subscribe(data => {
          this.commentsRows().removeAt(i);
          this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
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
  findTypeLists(type: string): void {
    console.log(type);
    if (type === 'Genetic') {
      this.selected = 'Genetic';
    } else if (type === 'SEQ') {
      this.selected = 'SEQ';
    } else if (type === 'MLPA') {
      this.selected = 'MLPA';
    } else if (type === 'none') {
      this.selected = 'none';
    }
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.clear();
    this.findLists(this.selected);

  }
  save(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.at(i).patchValue({ mode: 'D' });
    const rowData: IMent = control.at(i).value;
    const idx = this.lists.findIndex(list => list.id === rowData.id);
    this.lists[idx] = rowData;

    console.log('[130][저장]', rowData);

    if (rowData.code.length === 0) {
      alert('검체코드가 없습니다.')
    } else {
      if (rowData.id === 'N') {
        this.defaultService.insertItem(this.selected, rowData)
          .subscribe(data => {
            this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
          });
      } else {
        this.defaultService.updateItem(this.selected, rowData)
          .subscribe(data => {
            this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
          });
      }
    }

  }

  edit(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.at(i).patchValue({ mode: 'E' });
  }

  cancel(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const rowData = control.at(i).value;
    if (this.code === 'N') {
      const idx = this.lists.findIndex(list => list.id === rowData.id);
      console.log('[206]', i, this.lists[idx]);
      control.at(i).patchValue({ ...this.lists[idx], mode: 'D' });
    } else {
      this.testcode(this.code);
    }
  }


}
