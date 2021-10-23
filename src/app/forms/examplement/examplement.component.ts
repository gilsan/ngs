import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-examplement',
  templateUrl: './examplement.component.html',
  styleUrls: ['./examplement.component.scss']
})
export class ExamplementComponent implements OnInit {



  constructor(
    public dialogRef: MatDialogRef<ExamplementComponent>,

  ) { }

  ngOnInit(): void {

  }

  cancel(): void {
    this.dialogRef.close();
  }

}
