import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { SequencingService } from '../../services/sequencing.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IESS } from '../../models/patients';
import { ILIST, Lists } from '../../byengri/essensDNAMent';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-tier',
  templateUrl: './tier.component.html',
  styleUrls: ['./tier.component.scss']
})
export class TierComponent implements OnInit {
  myControl = new FormControl();
  tablerowForm: FormGroup;

  curPage = 1;
  totPage = 0;
  pageLine = 0;
  totRecords = 0;
  lists: IESS[] = [];
  listTiers: IESS[] = [];
  listTotal: ILIST[] = [];
  ess: IESS[] = [];
  // filteredOptions: Observable<IESS[]>;

  constructor(
    private sequencingService: SequencingService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadForm();
    this.loadData();
    this.myControl.valueChanges.pipe(
       startWith(''),
       map(value => this._filter(value)),
     );
  }

  private _filter(value: string): IESS[] {
    const filterValue = value.toLowerCase();
    return this.listTiers.filter(option => option.title.toLowerCase().includes(filterValue));
  }

  loadData(): void {
    this.sequencingService.getEssTitle()
      .subscribe(data => {
        this.listTiers = data;
        console.log(this.listTiers);
        this.listTiers = this.listTiers.sort((a, b) => {
          const x = a.title; const y = b.title;
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });

        this.totRecords = this.listTiers.length;
        this.totPage = Math.ceil(this.listTiers.length / 10);

        this.lists = this.listTiers.slice(0, 10);
        this.makeRow(this.lists);
      });
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }

  makeRow(lists: IESS[]): void {
    lists.forEach(list => {
      this.commentsRows().push(this.createCommentRow(list));
    });
  }
  ///////////////////////////////////////////////
  createCommentRow(list: IESS): FormGroup {
    return this.fb.group({
      id: list.id,
      title: list.title,
      mutation: list.mutation,
      amplification: list.amplification,
      fusion: list.fusion
    });
  }

  newCommentRow(): FormGroup {
    return this.fb.group({
      id: 'N',
      title: '',
      mutation: '',
      amplification: '',
      fusion: ''
    });
  }

  commentsRows(): FormArray {
    return this.tablerowForm.get('tableRows') as FormArray;
  }

  addNewCommentRow(): void {
    this.commentsRows().push(this.newCommentRow());

  }
  save(i: number): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const rowData: IESS = control.at(i).value;
    console.log(rowData);
    const id = rowData.id;
    if (id === 'N') {
      this.sequencingService.getEssInsert(rowData).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
        this.commentsRows().clear();
        this.loadData();
      });
    } else {
      this.sequencingService.getEssUpdate(rowData).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
      });
    }
  }

  removeCommentRow(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      const control = this.tablerowForm.get('tableRows') as FormArray;
      const rowData: IESS = control.at(i).value;
      this.commentsRows().removeAt(i);
      console.log('[136][삭제]', control.getRawValue());
      this.sequencingService.getEssDelete(rowData.id)
        .subscribe(data => {
          this.commentsRows().removeAt(i);
          this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
        });
    } else {
      return;
    }

  }

  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }

  insertRow(): void {
    this.commentsRows().push(this.newCommentRow());
  }
  ///////////////////////////////////////////////
  goPage(page: string): void {
    if (page === '<' && this.pageLine > 0) {
      this.pageLine--;
      this.curPage = this.pageLine * 10 - 1;
      if (this.curPage < 1) { this.curPage = 1 };
    } else if (page === '>' && this.pageLine < Math.ceil(this.totPage / 10) - 1) {
      this.pageLine++;
      this.curPage = this.pageLine * 10 + 1;
    } else {
      if (page !== '<' && page !== '>') { this.curPage = Number(page); }
    }
    page = this.curPage + '';
    this.lists = this.listTiers.slice((Number(page) - 1) * 10, (Number(page)) * 10);
    this.commentsRows().clear();
    this.makeRow(this.lists);
  }

  search(title: string): void {

    const result = this.listTiers.filter(list => list.title === title);
    console.log('[175][]', result);

    this.totRecords = result.length;
    this.totPage = Math.ceil(result.length / 10);
    this.curPage = 1;
    this.pageLine = 0;
    this.commentsRows().clear();
    if (result.length) {
      this.makeRow(result);
    } else {
      this.listTiers = [];
      this.loadData();
    }

  }


  addNew(): void {
    this.listTotal = Lists;
    let mutation = '';
    let amplification = '';
    let fusion = '';
    let title = '';

    // console.log(this.listTotal);
    this.listTotal.forEach(item => {
      title = '';
      title = item.title;
      const contents = item.content;
      contents.forEach(list => {

        if (list.type === 'Mutation') {
          mutation = list.data[0];
        } else if (list.type === 'Amplification') {
          amplification = list.data[0];
        } else if (list.type === 'Fusion') {
          fusion = list.data[0];
        }
      });
      this.ess.push({ title: item.title, mutation, amplification, fusion });
      mutation = '';
      amplification = '';
      fusion = '';
    });

    this.ess.forEach(item => {

      this.sequencingService.getEssInsert(item).subscribe(data => console.log(data));
    });
  }

}
