import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { Ipolymorphism } from '../../models/patients';
import { FilteredService } from '../../services/filtered.service';
import { ExcelService } from 'src/app/home/services/excelservice';
@Component({
  selector: 'app-blacklist',
  templateUrl: './blacklist.component.html',
  styleUrls: ['./blacklist.component.scss']
})
export class BlacklistComponent implements OnInit {

  lists$: Observable<Ipolymorphism[]>;
  lists: Ipolymorphism[];
  listIpolymorphism: Ipolymorphism[];
  ipolymorphism: Ipolymorphism = { id: '', gene: '', amino_acid_change: '', nucleotide_change: '', reason: '' };

  genes: string;
  curPage: number;
  totPage: number;
  pageLine: number;
  totRecords: number;

  polymorphismList: Ipolymorphism[];

  @ViewChild('status') status: ElementRef;
  @ViewChildren('gene, aminoacid, nucleotide, reason') newPath: QueryList<ElementRef>;

  constructor(
    private filteredService: FilteredService,
    private excel: ExcelService,
  ) { }

  ngOnInit(): void {
    this.init();
  }


  excelDownload(): void {
    console.log('excel', this.polymorphismList);
    this.excel.exportAsExcelFile(this.polymorphismList, 'polymorphism');
  }

  insertRow(): void {
    this.lists.push({ id: '', gene: '', amino_acid_change: '', nucleotide_change: '', reason: '' });
  }

  init(): void {
    this.totRecords = 0;
    this.lists$ = this.filteredService.getPolymorphism();
    this.lists$.subscribe((data) => {
      this.polymorphismList = data;
      console.log('[48][blacklist 목록]', this.polymorphismList);
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.polymorphismList.length / 10);
      this.pageLine = 0;
      this.totRecords = this.polymorphismList.length;
    });
  }


  search(gene: string = '', amino: string = '', nucleotide: string = ''): void {
    this.totRecords = 0;
    this.lists$ = this.filteredService.searchPolymorphism(gene, amino, nucleotide);
    this.lists$.subscribe((data) => {
      // console.log('[62][blacklist 검색]', data);
      this.polymorphismList = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.polymorphismList.length / 10);
      this.pageLine = 0;
      this.totRecords = this.polymorphismList.length;
    });
  }

  goPage(page: string): void {
    if (page === '<' && this.pageLine > 0) {
      this.pageLine--;
      this.curPage = this.pageLine * 10 - 1;
      if (this.curPage < 1) { this.curPage = 1; }
    } else if (page === '>' && this.pageLine < Math.ceil(this.totPage / 10) - 1) {
      this.pageLine++;
      this.curPage = this.pageLine * 10 + 1;
    } else {
      if (page !== '<' && page !== '>') {
        this.curPage = Number(page);
      }
    }
    page = this.curPage + '';
    this.lists = this.polymorphismList.slice((Number(page) - 1) * 10, (Number(page)) * 10);
  }

  updateRow(id: number): void {
    const list = [];
    this.newPath.forEach((data, index) => {
      list.push(data.nativeElement.value);
    });


    this.ipolymorphism.gene = list[0];
    this.ipolymorphism.amino_acid_change = list[1];
    this.ipolymorphism.nucleotide_change = list[2];
    this.ipolymorphism.reason = list[3];

    if (id >= (this.lists.length - 1)) {
      const tempId = parseInt(this.listIpolymorphism[this.listIpolymorphism.length - 1].id, 0);
      this.ipolymorphism.id = (tempId + 1).toString();
      this.filteredService.insertPolymorphism(this.ipolymorphism)
        .subscribe(data => {
          this.init();
          alert('추가 되었습니다.');
        });
    } else {
      this.ipolymorphism.id = (this.lists[id].id).toString();
      this.filteredService.updatePolymorphism(this.ipolymorphism)
        .subscribe(data => {
          this.init();
          alert('수정 되었습니다.');
        });
    }
  }

  deleteRow(id: number): void {
    const idx = this.lists[id].id;
    this.filteredService.deletePolymorphism(parseInt(idx, 0)).subscribe(data => {
      this.init();
      alert('삭제 되었습니다.');
    });
  }


}
