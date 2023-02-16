import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';


import { MatSnackBar } from '@angular/material/snack-bar';
import { IPatient } from 'src/app/home/models/patients';
import { filter } from 'rxjs/operators';
import { IRESARCHLIST } from '../../igtcr.model';
import { IgtcrService } from '../../igtcr.services';

@Component({
  selector: 'app-researchTcr-dialog',
  templateUrl: './researchTcr.component.html',
  styleUrls: ['./researchTcr.component.scss']
})
export class ResearchDialogComponent implements OnInit {

  testcodeExist = false;
  tsvFileExist = false;
  testName = '';
  isVisible = true;
  selectedRow: number = 0;
  specimenno = '';
  patientid = '';
  tablerowForm: FormGroup;

  resultName = ['LPE555', 'LPE556', 'LPE557'];
  gender = ['M', 'F'];
  lists: IRESARCHLIST[] = [];
  patientLists: IPatient[] = [];
  constructor(
    private dialogRef: MatDialogRef<ResearchDialogComponent>,
    private fb: FormBuilder,
    private router: Router,
    private researchService: IgtcrService,
    private snackBar: MatSnackBar,
  ) {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
   }

  ngOnInit(): void {

    this.loadLists();
  }



  loadLists(): void {
    let resultName = '';
    this.researchService.getPatientLists()
      .subscribe(data => {
        console.log('[56] ===> ', data);
        this.patientLists = data;
        if (data.length > 0) {
          const control = this.tablerowForm.get('tableRows') as FormArray;
          this.patientLists = data;
          this.patientLists.forEach(list => {
            if (list.test_code === 'LPE555' || list.test_code === 'LPE556' || list.test_code === 'LPE557') {
                resultName = 'IG-TCR';
              // console.log('[64]=> ', data);
              control.push(this.createRow({
                age: list.age,
                name: list.name,
                gender: list.gender,
                patientID: list.patientID,
                test_code: list.test_code,
                testname: resultName,
                reportTitle: list.reportTitle,
                specimenNo: list.specimenNo,
              }));
            }
          });
        }
      });
  }

  save(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[i];
    if (row.age === null || row.age.length === 0) {
      alert('나이 값은 필수 입니다.');
      return;
    } else if (row.name === null || row.name.length === 0) {
      alert('이름 값은 필수 입니다.');
      return;
    } else if (row.gender === null || row.gender.length === 0) {
      alert('성별 값은 필수 입니다.');
      return;
    } else if (row.patientID === null || row.patientID.length === 0) {
      alert('환자ID 값은 필수 입니다.');
      return;
    } else if (row.testname === null || row.testname.length === 0) {
      alert('검사명 값은 필수 입니다.');
      return;
    } else if (row.specimenNo === null || row.specimenNo.length === 0) {
      alert('검체번호 값은 필수 입니다.');
      return;
    }

    // console.log('[85]', row);

    if (row.isSaved) {

      this.researchService.updatePatientBySpecimenno(row)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
        });
    } else {

      this.researchService.insertNewPatient(row)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
          control.at(i).patchValue({ isSave: true });
        });
    }
  }

  deleteRow(index: number): void {
    const result = confirm('삭제 하시겠습니까?');
    if (result) {
      const control = this.tablerowForm.get('tableRows') as FormArray;
      const row = control.value[index];

      this.researchService.deletePatientBySpecimenno(row.specimenNo, row.patientID)
        .subscribe(data => {
          control.removeAt(index);
          this.snackBar.open('삭제 했습니다.', '닫기', { duration: 3000 });
        });
    }
  }

  cancelRow(index: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];
  }
  ///////////////////////////////////////////////
  createRow(list: IRESARCHLIST): FormGroup {
    return this.fb.group({
      name: [list.name],
      age: [list.age],
      gender: [list.gender],
      patientID: [list.patientID],
      test_code: [list.test_code],
      testname: [list.testname],
      reportTitle: [list.reportTitle],
      specimenNo: [list.specimenNo],
      isSaved: [true]
    });
  }

  addNewRow(row: IRESARCHLIST): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }

  addRow(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.addTableRowGroup());
  }

  addTableRowGroup(): FormGroup {
    return this.fb.group({
      name: [''],
      age: [''],
      gender: [''],
      patientID: [''],
      test_code: [''],
      testname: [''],
      reportTitle: [''],
      specimenNo: [''],
      isSaved: [false]
    });
  }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }
  //////////////////////////////////////////////////////////////////////////////////
  close(): void {
    this.dialogRef.close();
  }

  onCanceled(): void {
    this.isVisible = true;
  }

  changetype(i: number, option: string): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    // console.log('[200][changetype]', option);
    if (option === 'AML') {
      control.at(i).patchValue({ reportTitle: 'Acute Myeloid Leukemia NGS', test_code: 'LPE471', testname: option });
    } else if (option === 'ALL') {
      control.at(i).patchValue({ reportTitle: 'Acute Lymphoblastic Leukemia NGS', test_code: 'LPE472', testname: option });
    }
    console.log(control.at(i).value);
  }

  readonly(i: number): boolean {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.at(i).value;
    if (row.isSaved) {
      return true;
    }
    return false;
  }


}