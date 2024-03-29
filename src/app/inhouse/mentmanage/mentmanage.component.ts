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
  columnShow = true;
  mlpaCase = true;

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
        // console.log('[47]', lists);
        this.lists = lists;
        this.findLists(this.type);
      });
  }


  findLists(type: string): void {
    this.type = type;
    this.reportLists = this.lists.filter(list => list.type === type);
    this.reportLists = this.reportLists.sort((a, b) => {
      const x = a.report; const y = b.report;
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    this.reportLists.forEach(list => {
      this.commentsRows().push(this.createCommentRow(list));
    });

  }

  testcode(code: string, type: string): void {

    if (code === 'none') {
      this.commentsRows().clear();
      this.findLists(this.type);
    } else {
      this.code = code;
      // console.log('[78][testcode]', this.reportLists.filter(list => list.code === code && list.type === type));
      this.report = this.reportLists.filter(list => list.code === code && list.type === type)[0].report;
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
      comment: ment.comment,
      comment1: ment.comment1,
      comment2: ment.comment2,
      type: ment.type,
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
      comment: '',
      comment1: '',
      comment2: '',
      type: this.selected,
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
  findTypeLists(type: string, code: string): void {
    console.log(type);
    if (type === 'AMLALL') {
      this.selected = 'AMLALL';
      this.columnShow = true;
      this.mlpaCase = true;
    } else if (type === 'MDS') {
      this.selected = 'MDS';
      this.columnShow = true;
      this.mlpaCase = true;
    } else if (type === 'LYM') {
      this.selected = 'LYM';
      this.columnShow = true;
      this.mlpaCase = true;
    } else if (type === 'Genetic') {
      this.selected = 'Genetic';
      this.columnShow = false;
      this.mlpaCase = true;
    } else if (type === 'SEQ') {
      this.selected = 'SEQ';
      this.columnShow = true;
      this.mlpaCase = true;
    } else if (type === 'MLPA') {
      this.selected = 'MLPA';
      this.columnShow = true;
      this.mlpaCase = false;
    } else if (type === 'none') {
      this.selected = 'none';
      this.columnShow = true;
      this.mlpaCase = true;
    }
    this.code = code;
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
      alert('검체코드가 없습니다.');
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
    this.code = rowData.code;
    console.log('[206][cancel]', rowData, this.code);
    if (this.code === 'N') {
      const idx = this.lists.findIndex(list => list.id === rowData.id);
      console.log('[206]', i, this.lists[idx]);
      control.at(i).patchValue({ ...this.lists[idx], mode: 'D' });
    } else {
      this.testcode(this.code, this.selected);
    }
  }


}
