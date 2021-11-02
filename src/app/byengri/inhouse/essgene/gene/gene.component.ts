import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';


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

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.init();
    this.loadForm();
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













}
