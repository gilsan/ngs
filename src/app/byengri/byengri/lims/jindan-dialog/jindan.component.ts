import { Component, Inject } from '@angular/core';
import {   MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-jindan',
  templateUrl: './jindan.component.html',
  styleUrls: ['./jindan.component.scss']
})
export class JindanComponent   {

  inputDialogRef: MatDialogRef<any>;

  constructor(

    public dialogRef: MatDialogRef<JindanComponent>,
    @Inject(MAT_DIALOG_DATA) public msg: string,
  ) {}


// 생성 다이얼로그
save(comment: string): void {
  this.dialogRef.close({comment});
  }

cancel(comment: string = 'none'): void {
    this.dialogRef.close({comment});
  }





}
