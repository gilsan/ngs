import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ResearchService } from 'src/app/home/services/research.service';
import { IRESARCHLIST, ITYPE } from 'src/app/home/models/research.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPatient } from 'src/app/home/models/patients';
import { combineLatest, } from 'rxjs';

@Component({
  selector: 'app-mlpa-dialog',
  templateUrl: './mlpa-dialog.component.html',
  styleUrls: ['./mlpa-dialog.component.scss']
})
export class MlpaDialogComponent implements OnInit {


  isVisible = true;

  tablerowForm: FormGroup;
  typeLists: ITYPE[] = [];
  resultName: string[] = [];
  gender = ['M', 'F'];
  lists: IRESARCHLIST[] = [];
  patientLists: IPatient[] = [];
  constructor(
    private dialogRef: MatDialogRef<MlpaDialogComponent>,
    private fb: FormBuilder,
    private router: Router,
    private researchService: ResearchService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadForm();
    this.loadLists();
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }

  loadLists(): void {
    const lists$ = this.researchService.getTestcodeByType('MLPA');
    const patientLists$ = this.researchService.getPatientLists();
    const control = this.tablerowForm.get('tableRows') as FormArray;
    combineLatest([lists$, patientLists$])
      .subscribe(([lists, patientLists]) => {
        this.typeLists = lists.sort((a, b) => {
          const x = a.report; const y = b.report;
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        this.typeLists.forEach(list => {
          this.resultName.push(list.report);
        });

        if (patientLists.length > 0) {
          patientLists.forEach(list => {
            const idx = this.typeLists.findIndex(type => type.code === list.test_code);
            if (idx !== -1) {
              // console.log(this.typeLists[idx]);
              const { code, report } = this.typeLists[idx];
              control.push(this.createRow({
                age: list.age,
                name: list.name,
                gender: list.gender,
                patientID: list.patientID,
                test_code: list.test_code,
                testname: code,
                reportTitle: report,
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

    if (row.isSaved) {
      // update
      this.researchService.updatePatientBySpecimenno(row)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
        });
    } else {
      this.researchService.insertNewPatient(row, 'MLPA')
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
    console.log(i, option);
    const idx = this.typeLists.findIndex(type => type.report === option);
    const code = this.typeLists[idx].code;
    control.at(i).patchValue({ reportTitle: option, test_code: code, testname: code });
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
