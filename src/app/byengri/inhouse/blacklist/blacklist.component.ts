import { Component, OnInit } from '@angular/core';
import { Ipolymorphism } from '../../models/patients';
import { FilteredService } from '../../services/filtered.service';

@Component({
  selector: 'app-blacklist',
  templateUrl: './blacklist.component.html',
  styleUrls: ['./blacklist.component.scss']
})
export class BlacklistComponent implements OnInit {

  lists = [
    { gene: 'AURKA', amino_acid_change: 'p.lle57Val', nucleotide_change: 'c.169A>G', reason: 'UCSC common SNP' }
  ];
  genes: string;
  curPage: number = 0;
  totPage: number = 0;
  pageLine: number;
  totRecords: number;

  polymorphismList: Ipolymorphism[];

  constructor(
    private filteredService: FilteredService,
  ) { }

  ngOnInit(): void {
    this.filteredService.getPolymorphism()
      .subscribe(data => {
        this.polymorphismList = data;
        console.log(data);
      });
  }


  excelDownload(): void { }

  insertRow(): void { }

  search(genes: string, coding: string): void { }

}
