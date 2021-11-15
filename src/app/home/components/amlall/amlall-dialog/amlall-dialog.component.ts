import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ResearchService } from 'src/app/home/services/research.service';



export interface ILIST {
  regdate: string;
  name: string;
  age: string;
  gender: string;
  patientid: string;
  testname: string;
  sheetname: string;
  specimenno: string;
  tsvname?: string;
}


@Component({
  selector: 'app-amlall-dialog',
  templateUrl: './amlall-dialog.component.html',
  styleUrls: ['./amlall-dialog.component.scss']
})
export class AmlallDialogComponent implements OnInit {

  showReport = false;
  isVisible = true;
  selectedRow: number;
  specimenno = '';
  tablerowForm: FormGroup;
  testname = ['AML', 'ALL'];
  lists: ILIST[] = [];

  constructor(
    private dialogRef: MatDialogRef<AmlallDialogComponent>,
    private fb: FormBuilder,
    private router: Router,
    private researchService: ResearchService
  ) { }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });

  }

  ///////////////////////////////////////////////
  createRow(list: ILIST): FormGroup {
    return this.fb.group({
      regdate: [list.regdate],
      name: [list.name],
      age: [list.age],
      gender: [list.gender],
      patientid: [list.patientid],
      testname: [list.testname],
      sheetname: [list.sheetname],
      specimenno: [list.specimenno],
      tsvname: [list.tsvname]
    });
  }

  addNewRow(row: ILIST): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }

  addRow(): void {
    this.showReport = false;
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.addTableRowGroup());
  }

  addTableRowGroup(): FormGroup {
    return this.fb.group({
      regdate: [this.today()],
      name: [''],
      age: [''],
      gender: [''],
      patientid: [''],
      testname: [''],
      sheetname: [''],
      specimenno: [''],
      tsvname: ['']
    });
  }

  deleteRow(index: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.removeAt(index);
  }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }
  //////////////////////////////////////////////////////////////////////////////////

  goSheet(i: number): void {
    this.dialogRef.close();
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[i];
    console.log(row);
    this.researchService.setData(row.name, row.age, row.gender, row.testname, row.patientid);
    this.router.navigate(['/diag', 'researchall']);

  }

  close(): void {
    this.dialogRef.close();
  }

  goUploadpage(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[i];
    console.log('[104]', row);
    if (row.specimenno === '') {
      alert('검사코드를 입력해 주십시요.');
    } else {
      this.selectedRow = i;
      this.showReport = !this.showReport;
      this.isVisible = !this.isVisible;
      this.specimenno = row.specimenno;
    }

  }

  onSelected(tsvfilename: string): void {
    console.log(tsvfilename, this.selectedRow);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.at(this.selectedRow).patchValue({ tsvname: tsvfilename });
    this.isVisible = true;
    this.showReport = false;
  }

  onCanceled(): void {
    this.isVisible = true;
  }

  checkStatus(i: number): boolean {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[i];
    if (row.tsvname.length) {
      return true;
    }
    return false;
  }

  changetype(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[i];



    console.log('[156][changetype]', row);
    if (row.testname === 'AML') {
      control.at(i).patchValue({ sheetname: 'Acute Myeloid Leukemia NGS' });
    } else if (row.testname === 'ALL') {
      control.at(i).patchValue({ sheetname: 'Acute Lymphoblastic Leukemia NGS' });
    }
  }

  today(): string {
    const today = new Date();
    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    return now;
  }



}
