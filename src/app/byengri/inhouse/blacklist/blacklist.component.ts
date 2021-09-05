import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Ipolymorphism } from '../../models/patients';
import { FilteredService } from '../../services/filtered.service';

@Component({
  selector: 'app-blacklist',
  templateUrl: './blacklist.component.html',
  styleUrls: ['./blacklist.component.scss']
})
export class BlacklistComponent implements OnInit {

  lists$: Observable<Ipolymorphism[]>;
  lists: Ipolymorphism[];
  listIpolymorphism: Ipolymorphism[];
  ipolymorphism: Ipolymorphism;


  genes: string;
  curPage: number;
  totPage: number;
  pageLine: number;
  totRecords: number;

  polymorphismList: Ipolymorphism[];

  constructor(
    private filteredService: FilteredService,
  ) { }

  ngOnInit(): void {
    this.search();
  }


  excelDownload(): void { }

  insertRow(): void { }

  search(genes: string = '', coding: string = ''): void {
    this.totRecords = 0;
    this.lists$ = this.filteredService.getPolymorphism();
    this.lists$.subscribe((data) => {
      // console.log('[170][benign 검색]', data);
      this.listIpolymorphism = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listIpolymorphism.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listIpolymorphism.length;
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
    // this.lists = this.listArtfacts.slice((Number(page) - 1) * 10, (Number(page)) * 10);
  }


}
