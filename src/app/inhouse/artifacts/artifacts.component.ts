import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IArtifacts } from '../models/artifacts';
import { ArtifactsService } from 'src/app/services/artifacts.service';
import { ExcelService } from 'src/app/home/services/excelservice';

@Component({
  selector: 'app-artifacts',
  templateUrl: './artifacts.component.html',
  styleUrls: ['./artifacts.component.scss']
})
export class ArtifactsComponent implements OnInit {

  constructor(
    private artifactsService: ArtifactsService,
    private excel: ExcelService,
  ) { }
  lists$: Observable<IArtifacts[]>;
  lists: IArtifacts[];
  listArtfacts: IArtifacts[];
  artifact: IArtifacts;

  genes: string;
  curPage: number;
  totPage: number;
  pageLine: number;
  totRecords: number;

  private apiUrl = emrUrl;

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.search('');
  }

  deleteRow(id: string, genes: string): void {

    if (id === "") {
      const result = confirm('삭제 하시겠습니까?');
      if (result) {
        this.lists = this.lists.slice(0, this.lists.length - 1);
      }
    } else {
      const result = confirm(genes + '을 삭제 하시겠습니까?');
      if (result) {
        this.artifactsService.deleteArtifactsList(id, genes)
          .subscribe((data) => {
            console.log('[170][benign 삭제]', data);
            alert("삭제 되었습니다.");
            this.search(genes);
          });
      }
    }
  }

  updateRow(id: string): void {

    const genes: HTMLInputElement = document.getElementById("genes" + id) as HTMLInputElement;
    const location: HTMLInputElement = document.getElementById("location" + id) as HTMLInputElement;
    const exon: HTMLInputElement = document.getElementById("exon" + id) as HTMLInputElement;
    const transcript: HTMLInputElement = document.getElementById("transcript" + id) as HTMLInputElement;
    const coding: HTMLInputElement = document.getElementById("coding" + id) as HTMLInputElement;
    const aminoAcidChange: HTMLInputElement = document.getElementById("aminoAcidChange" + id) as HTMLInputElement;

    if (genes.value == "") {
      alert("genes 값은 필수 입니다.");
      return;
    }

    if (location.value == "") {
      alert("location 값은 필수 입니다.");
      return;
    }
    if (exon.value == "") {
      alert("exon 값은 필수 입니다.");
      return;
    }
    if (coding.value == "") {
      alert("coding 값은 필수 입니다.");
      return;
    }
    if (aminoAcidChange.value == "") {
      alert("Amino Acid Change 값은 필수 입니다.");
      return;
    }


    if (id !== "") {
      this.artifactsService.updateArtifactsList(id, genes.value, location.value, exon.value, transcript.value,
        coding.value, aminoAcidChange.value)
        .subscribe((data) => {
          console.log('[170][benign 수정]', data);
          alert("수정 되었습니다.");
          this.search(genes.value);
        });
    } else {
      this.artifactsService.insertArtifactsList(id, genes.value, location.value, exon.value, transcript.value,
        coding.value, aminoAcidChange.value)
        .subscribe((data) => {
          console.log('[170][benign 저장]', data);
          alert("저장 되었습니다.");
          this.search(genes.value);
        });
    }
  }


  insertRow() {
    this.lists.push({ 'id': '', 'genes': '', 'location': '', 'exon': '', 'transcript': '', 'coding': '', 'amino_acid_change': '' });
  }

  goPage(page: string): void {
    if (page === "<" && this.pageLine > 0) {
      this.pageLine--;
      this.curPage = this.pageLine * 10 - 1;
      if (this.curPage < 1) this.curPage = 1;
    } else if (page === ">" && this.pageLine < Math.ceil(this.totPage / 10) - 1) {
      this.pageLine++;
      this.curPage = this.pageLine * 10 + 1;
    } else {
      if (page != "<" && page != ">")
        this.curPage = Number(page);
    }
    page = this.curPage + "";
    this.lists = this.listArtfacts.slice((Number(page) - 1) * 10, (Number(page)) * 10);
  }

  search(genes: string, coding: string = ''): void {

    this.totRecords = 0;
    this.lists$ = this.artifactsService.getArtifactsList(genes, coding);
    this.lists$.subscribe((data) => {
      // console.log('[170][benign 검색]', data);
      this.listArtfacts = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listArtfacts.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listArtfacts.length;
    });
  }

  excelDownload(): void {
    console.log('excel', this.listArtfacts);
    this.excel.exportAsExcelFile(this.listArtfacts, 'artfacts');
  }

}
