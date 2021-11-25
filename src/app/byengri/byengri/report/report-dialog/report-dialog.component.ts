import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IFU, IITEM, IMU } from 'src/app/byengri/models/item-move.model';
import { SequencingService } from 'src/app/byengri/services/sequencing.service';


@Component({
  selector: 'app-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss']
})
export class ReportDialogComponent implements OnInit {

  tablerowForm: FormGroup;
  mufuLists: IITEM[] = [];
  title = '';
  disabled = true;
  constructor(
    private dialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private rowData: any,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private sequencingService: SequencingService
  ) { }

  ngOnInit(): void {
    this.loadForm();
    this.loadRowData();
  }

  loadRowData(): void {
    console.log('[26]', this.rowData);
    if (this.rowData.itemType === 'MU') {
      this.mufuLists.push({
        id: null, date: this.today(), gene: this.rowData.gene, amino: this.rowData.aminoAcidChange,
        direction: this.rowData.direction, comment: '', isSaved: false, pathologyNum: this.rowData.pathologyNum
      });
      this.title = 'Mutation';
    } else if (this.rowData.itemType === 'CP') {
      this.mufuLists.push({
        id: null, date: this.today(), gene: this.rowData.gene, amino: this.rowData.copynumber,
        direction: this.rowData.direction, comment: '', isSaved: false, pathologyNum: this.rowData.pathologyNum
      });
      this.title = 'Copy number alteration';
    } else if (this.rowData.itemType === 'FU') {
      this.mufuLists.push({
        id: null, date: this.today(), gene: this.rowData.gene, amino: this.rowData.breakpoint,
        direction: this.rowData.direction, comment: '', isSaved: false, pathologyNum: this.rowData.pathologyNum
      });
      this.title = 'Fusion';
    }

    this.mufuLists.forEach(list => {
      this.formControls().push(this.createRow(list));
    });
    this.loadStoredData(this.rowData.pathologyNum);
  }

  loadStoredData(pathologyNum: string): void {
    this.sequencingService.listMoveHistory(pathologyNum)
      .subscribe(data => {
        console.log('[디비에서 가져오기]', data);
        data.forEach(list => {
          this.formControls().push(this.createRow({
            id: list.id, date: list.date.replace(/T/g, ' '), gene: list.gene, amino: list.amino,
            direction: list.direction, comment: list.comment, isSaved: list.isSaved, pathologyNum: list.pathologyNum
          }));
        })
      });
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }

  ///////////////////////////////////////////////
  createRow(list: IITEM): FormGroup {
    return this.fb.group({
      id: [list.id],
      date: [list.date],
      gene: [list.gene],
      amino: [list.amino],
      direction: [list.direction],
      comment: [list.comment],
      pathologyNum: [list.pathologyNum],
      isSaved: [list.isSaved]
    });

  }

  addNewRow(row: IITEM): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }

  addRow(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.addTableRowGroup());
  }

  addTableRowGroup(): FormGroup {
    return this.fb.group({
      date: [this.today()],
      gene: [''],
      amino: [''],
      direction: [''],
      comment: [''],
      isSaved: [false]
    });
  }

  formControls(): FormArray {
    return this.tablerowForm.get('tableRows') as FormArray;
  }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }
  //////////////////////////////////////////////////////////////////////////////////
  close(): void {
    this.dialogRef.close();
    this.mufuLists = [];
  }

  today(): any {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const newmonth = month >= 10 ? month : '0' + month;
    const newday = day >= 10 ? day : '0' + day;
    const newhour = hour >= 10 ? hour : '0' + hour;
    const newminute = minute >= 10 ? minute : '0' + minute;
    const newsecond = second >= 10 ? second : '0' + second;

    return date.getFullYear() + '-' + newmonth + '-' + newday + ' ' + newhour + ':' + newminute + ':' + newsecond;
  }

  save(i: number): void {
    const pathologyNum = this.rowData.pathologyNum;
    const control = this.formControls();
    const rowdata: IITEM = control.at(i).value;
    console.log('[151][저장]', control.value);
    if (rowdata.id !== null) {
      this.sequencingService.updateMoveHistory(rowdata)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
          this.disabled = false;
        });
    } else {
      rowdata.isSaved = true;
      this.sequencingService.insertMoveHistory(rowdata)
        .subscribe(data => {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
          control.at(i).patchValue({ isSaved: true });
          this.disabled = false;
        });
    }
  }

  delete(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      const control = this.formControls();
      const rowdata = control.at(i).value;
      console.log('[173][삭제]', rowdata);
      if (rowdata.id === null) {
        control.removeAt(i);
        this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
      } else {
        this.sequencingService.deleteMoveHistory(rowdata.id)
          .subscribe(data => {
            control.removeAt(i);
            this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
          });
      }
    } else {
      return;
    }
  }

  moveItem(): void {
    this.dialogRef.close({ action: 'move' });
  }


}
