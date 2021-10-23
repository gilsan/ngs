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



  selected = 'Genetic';
  tablerowForm: FormGroup;
  private subs = new SubSink();



  constructor(
    private fb: FormBuilder,
    private defaultService: CodeDefaultValue,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadForm();
    this.findLists(this.selected);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }


  findLists(type: string): void {
    this.defaultService.getLists(type)
      .subscribe(lists => {
        console.log(lists);
        lists.forEach(list => {
          this.commentsRows().push(this.createCommentRow(list));
        });
      });

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
    this.commentsRows().removeAt(i);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const rowData: IMent = control.at(i).value;
    this.defaultService.deleteItem(rowData.id)
      .subscribe(data => {
        this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
      });
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
    }
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.clear();
    this.findLists(this.selected);

  }
  save(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.at(i).patchValue({ mode: 'D' });
    const rowData: IMent = control.at(i).value;
    console.log('[130][저장]', rowData);
    if (rowData.id === 'N') {
      this.defaultService.insertItem(this.selected, rowData)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
        });
    } else {
      this.defaultService.updateItem(this.selected, rowData)
        .subscribe(data => {
          this.snackBar.open('수정 했습니다.', '닫기', { duration: 3000 });
        });
    }

  }

  edit(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.at(i).patchValue({ mode: 'E' });
  }

  cancel(i: number): void {
    this.commentsRows().removeAt(i);
  }


}
