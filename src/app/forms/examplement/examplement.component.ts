import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ICodecomment } from 'src/app/inhouse/models/comments';
import { CodeDefaultValue } from 'src/app/services/codedefaultvalue';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-examplement',
  templateUrl: './examplement.component.html',
  styleUrls: ['./examplement.component.scss']
})
export class ExamplementComponent implements OnInit {

  lists: ICodecomment[] = [];
  tablerowForm: FormGroup;

  @Input() type: string;
  @Input() code: string;
  @Output() closemodal = new EventEmitter<void>();
  @Output() sendMent = new EventEmitter<string>();
  constructor(
    private defaultService: CodeDefaultValue,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadForm();
    this.defaultService.getCommentLists(this.type, this.code)
      .subscribe(data => {
        this.lists = data.sort((a, b) => parseInt(a.seq, 10) - parseInt(b.seq, 10));
        // console.log('[36][받은데이터][examplement]', this.type, this.code, this.lists);
        const control = this.tablerowForm.get('tableRows') as FormArray;
        this.lists.forEach(list => {
          control.push(this.createExam(list));
        });
      });
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }


  createExam(list: ICodecomment): FormGroup {
    // console.log('[617][][createMutaion][mutation]', mutation);
    return this.fb.group({
      id: list.id,
      comment: list.comment,
      code: list.code,
      seq: list.seq,
      type: list.type
    });
  }

  examLists(): FormArray {
    return this.tablerowForm.get('tableRows') as FormArray;
  }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }

  /////////////
  commentDroped(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;
    // console.log('[73][이동] ', event);
    const examControl = this.tablerowForm.get('tableRows') as FormArray;
    this.moveItemInCommentArray(examControl, from1, to);
  }

  moveItemInCommentArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const from2 = this.clamp(fromIndex, formArray.length - 1);
    const to2 = this.clamp(toIndex, formArray.length - 1);
    // console.log('[81][이동] ', from2, to2);
    if (from2 === to2) {
      return;
    }

    if (from2 < to2) {
      const diff = to2 - from2;
      if (diff === 1) {
        return;
      }
    }


    const len = formArray.length;

    const totalFormGroup = [];
    const newFormGroup = [];
    const previous = formArray.at(from2);
    const current = formArray.at(to2);


    for (let i = 0; i < len; i++) {
      totalFormGroup.push(formArray.at(i));
    }

    totalFormGroup.forEach((form, index) => {
      if (from2 > to2) {
        if (index === to2) {
          newFormGroup.push(previous);
          newFormGroup.push(current);
        } else if (index !== from2 && index !== to2) {
          newFormGroup.push(form);
        }
      } else if (from2 < to2 && (to2 - from2) > 1) {

        if (index === to2) {
          newFormGroup.push(previous);
          newFormGroup.push(form);
        } else if (index !== from2 && index !== to2) {
          newFormGroup.push(form);
        }
      }
    });

    for (let i = 0; i < len; i++) {
      formArray.setControl(i, newFormGroup[i]);
    }
  }

  /** Clamps a number between zero and a maximum. */
  clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
  }

  /////////////////////////////////////////////////////////
  cancel(): void {
    this.closemodal.emit(null);
  }

  selectedComment(i: number): void {
    // alert('결과지 Comments 에 예문이 추가되었습니다.');
    this.snackBar.open('결과지 Comments 에 예문이 추가되었습니다.', '닫기', { duration: 3000 });
    const ment = this.lists[i].comment;
    this.sendMent.emit(ment);
    console.log(ment);
  }

  seqSave(): void {
    let lists = [];
    const control = this.tablerowForm.get('tableRows') as FormArray;
    lists = control.getRawValue();

    for (let i = 0; i < lists.length; i++) {
      lists[i].seq = i + 1;
    }
    // console.log('[154][순서저장]', lists);
    this.defaultService.commentsequpdateItem(lists)
      .subscribe(data => {
        console.log('[150]', data);
        this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
      });

  }

  /*
  cancel(): void {
    this.dialogRef.close();
  }

  selectedComment(i: number): void {
    this.dialogRef.close(this.lists[i].comment);
  }
  */
}
