import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IComments } from '../models/comments';
import { CommentsService } from 'src/app/services/comments.service';
import { ExcelService } from 'src/app/home/services/excelservice';
@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @ViewChild('type') type: ElementRef;
  @ViewChild('selectedtype') selectedtype: ElementRef;
  constructor(
    private commentsService: CommentsService,
    private excel: ExcelService,
  ) { }
  lists$: Observable<IComments[]>;
  lists: IComments[];
  listComments: IComments[];
  benignInfo: IComments;

  genes: string;
  curPage: number;
  totPage: number;
  pageLine: number;
  totRecords: number;

  selectType = '';

  private apiUrl = emrUrl;

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.search('', 'AMLALL');
  }

  deleteRow(id: string, type: string, gene: string): void {
    if (id === "") {
      const result = confirm('삭제 하시겠습니까?');
      if (result) {
        this.lists = this.lists.slice(0, this.lists.length - 1);
      }
    } else {
      const result = confirm(type + '-' + gene + '를 삭제 하시겠습니까?');
      if (result) {
        this.commentsService.deleteCommentsList(id, gene)
          .subscribe((data) => {
            console.log('[170][benign 삭제]', data);
            alert("삭제 되었습니다.");
            const typeVal = this.type.nativeElement.value;
            this.search('', typeVal);
          });
      }
    }
  }

  updateRow(id: string): void {
    let typeVal: string;
    // const commentsType: HTMLInputElement = document.getElementById('type' + id) as HTMLInputElement;
    const gene: HTMLInputElement = document.getElementById('gene' + id) as HTMLInputElement;
    const comment: HTMLInputElement = document.getElementById('comment' + id) as HTMLInputElement;
    const reference: HTMLInputElement = document.getElementById('reference' + id) as HTMLInputElement;
    // tslint:disable-next-line:variable-name
    const variant_id: HTMLInputElement = document.getElementById('variant_id' + id) as HTMLInputElement;


    // if (commentsType.value === '' && id !== '') {
    //   alert('Type 값은 필수 입니다.');
    //   return;
    // }

    if (gene.value === '') {
      alert('gene 값은 필수 입니다.');
      return;
    }
    if (comment.value === '') {
      alert('comment 값은 필수 입니다.');
      return;
    }
    if (reference.value === '') {
      alert('reference 값은 필수 입니다.');
      return;
    }
    // const typeVal = this.type.nativeElement.value;
    const typeval = this.selectedtype.nativeElement.value;
    if (typeval === 'AML' || typeval === 'AML') {
      typeVal = 'AMLALL';
    }
    if (typeval === '') {
      alert('Type 값은 필수 입니다.');
      return;
    }

    console.log(id, typeval, gene.value, variant_id.value, comment.value, reference.value, typeVal);
    if (id !== '') {
      this.commentsService.updateCommentsList(id, typeval, gene.value, variant_id.value, comment.value, reference.value, typeVal)
        .subscribe((data) => {
          console.log('[170][benign 수정]', data);
          alert('수정 되었습니다.');
          this.search(gene.value, typeVal);
        });
    } else {
      this.commentsService.insertCommentsList(this.selectType, id, typeval,
        gene.value, variant_id.value, comment.value, reference.value, typeVal)
        .subscribe((data) => {
          console.log('[170][benign 저장]', data);
          alert('저장 되었습니다.');
          this.search(gene.value, typeVal);
        });
    }

  }

  insertRow(): void {
    this.lists.push({ 'id': '', 'type': '', 'gene': '', 'variant_id': '', 'comment': '', 'reference': '' });
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
    this.lists = this.listComments.slice((Number(page) - 1) * 10, (Number(page)) * 10);
  }

  search(genes: string, type: string): void {
    if (type === 'TOTAL') {
      type = '';
    }
    this.totRecords = 0;
    this.lists$ = this.commentsService.getCommentsList(genes, type);
    this.lists$.subscribe((data) => {
      // console.log('[146][benign 검색]', data);
      this.lists = data;
      this.mapping();
      this.listComments = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listComments.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listComments.length;
    });

  }

  excelDownload(): void {
    // console.log('excel', this.listMutations);
    this.excel.exportAsExcelFile(this.listComments, 'comments');
  }

  findComments(type: string): void {
    this.selectType = type;
    this.totRecords = 0;
    if (type === 'TOTAL') {
      this.lists$ = this.commentsService.getCommentsList('', '');
    } else {
      this.lists$ = this.commentsService.getCommentsList('', type);
    }

    this.lists$.subscribe((data) => {
      //   console.log('[170][benign 검색]', data);
      this.lists = data;
      this.mapping();
      this.listComments = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listComments.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listComments.length;
    });
  }

  mapping(): void {
    this.lists.forEach(item => {
      if (item.type === 'AML') {
        item.display = 'AML';
      } else if (item.type === 'MDS') {
        item.display = 'MDSMPN';
      } else if (item.type === 'LYM') {
        item.display = '악성림프종/형질세포종';
      } else if (item.type === 'Genetic') {
        item.display = '유전성 유전질환';
      } else if (item.type === 'ALL') {
        item.display = 'ALL';
      }
    });
  }

}
