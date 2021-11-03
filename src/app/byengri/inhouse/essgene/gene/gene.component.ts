import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { SequencingService } from 'src/app/byengri/services/sequencing.service';


export interface ICONTENT {
  type: string;
  data: string[];
}

export interface IROW {
  mutation: string;
  amplification: string;
  fusion: string;
}


@Component({
  selector: 'app-gene',
  templateUrl: './gene.component.html',
  styleUrls: ['./gene.component.scss']
})
export class GeneComponent implements OnInit {

  @Input() title: string;
  @Input() content: ICONTENT[];

  mutationLists: string[];
  amplificationLists: string[];
  fusionLists: string[];
  maxVal = [];
  maxLen = 0;
  lists: IROW[] = [];
  newLists: string[] = [];
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sequencingService: SequencingService
  ) { }

  ngOnInit(): void {
    this.init();
    this.loadForm();
    this.sequencingService.listObservable$
      .pipe(
        first()
      )
      .subscribe(data => {
        this.newLists.push(data);
        console.log('[52][신규생성]', this.newLists);
      });
  }

  init(): void {
    for (const el of this.content) {
      if (el.type === 'Mutation') {
        this.mutationLists = el.data;
      } else if (el.type === 'Amplification') {
        this.amplificationLists = el.data;
      } else if (el.type === 'Fusion') {
        this.fusionLists = el.data;
      }

    }

    this.maxVal.push(this.mutationLists.length);
    this.maxVal.push(this.amplificationLists.length);
    this.maxVal.push(this.fusionLists.length);

    this.maxVal.sort((a: number, b: number) => b - a);
    for (let i = 0; i < this.maxVal[0]; i++) {
      const mutation = this.mutationLists[i];
      const amplification = this.amplificationLists[i];
      const fusion = this.fusionLists[i];
      const temp = { mutation: '', amplification: '', fusion: '' };
      if (mutation !== undefined) {
        temp.mutation = mutation;
      }

      if (amplification !== undefined) {
        temp.amplification = amplification;
      }

      if (fusion !== undefined) {
        temp.fusion = fusion;
      }

      this.lists.push(temp);
    }

  }

  loadForm(): void {
    this.form = this.fb.group({
      tableRows: this.fb.array(this.lists.map(list => this.createRow(list)))
    });
  }

  addRow(): void {
    const control = this.form.get('tableRows') as FormArray;
    control.push(this.newRows());
  }

  deleteRow(index: number): void {
    const control = this.form.get('tableRows') as FormArray;
    control.removeAt(index);
  }
  ////////////////////////////////////////
  createRow(row: IROW): FormGroup {
    return this.fb.group({
      mutation: row.mutation,
      amplification: row.amplification,
      fusion: row.fusion,
    });
  }

  rows(): FormArray {
    return this.form.get('tableRows') as FormArray;
  }

  newRows(): FormGroup {
    return this.fb.group({
      mutation: '',
      amplification: '',
      fusion: ''
    });
  }

  addNewRow(row: IROW): void {
    const control = this.form.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }

  removeRow(i: number): void {
    this.rows().removeAt(i);
  }
  //////////////////////////////////////////
  changeCMutaion(i: number, value: string): void {
    const originalLen = this.mutationLists.length - 1;
    if (i > originalLen) {  // 신규
      this.mutationLists.push(value);
    } else {  // 기존
      this.mutationLists[i] = value;
    }
    console.log('[138][]', this.mutationLists, this.title);
  }

  changeCAmplification(i: number, value: string): void {
    console.log(i, this.title, value);
  }

  changeCFusion(i: number, value: string): void {

  }

  ///////////////////////////////////////////////////////////




}
