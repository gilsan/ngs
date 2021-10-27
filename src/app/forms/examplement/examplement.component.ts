import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ICodecomment } from 'src/app/inhouse/models/comments';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';

export interface DialogData {
  type: string;
  code: string;
}
@Component({
  selector: 'app-examplement',
  templateUrl: './examplement.component.html',
  styleUrls: ['./examplement.component.scss']
})
export class ExamplementComponent implements OnInit {

  lists: ICodecomment[] = [];

  constructor(
    public dialogRef: MatDialogRef<ExamplementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private defaultService: CodeDefaultValue,
  ) { }

  ngOnInit(): void {

    this.defaultService.getCommentLists(this.data.type, this.data.code)
      .subscribe(data => {
        console.log('[21][받은데이터]', data);
        this.lists = data;
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  selectedComment(i: number): void {
    this.dialogRef.close(this.lists[i].comment);
  }

}
