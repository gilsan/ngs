import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { concatMap, map } from 'rxjs/operators';
import { UploadResponse } from '../../models/uploadfile';
import { FileUploadService } from '../../services/file-upload.service';

import * as XLSX from 'xlsx';
import { constants } from 'zlib';
import { IAFormVariant } from '../../models/patients';
import { ArtifactsService } from 'src/app/services/artifacts.service';
import { from } from 'rxjs';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

export interface IArtifact {
  id: string;
  genes: string;
  locat: string;
  exon: string;
  transcript: string;
  coding: string;
  aminoAcidChange: string;
  type: string;
}


@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.scss']
})
export class FileuploadComponent implements OnInit {

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  testedid: string;
  jsonMessage: any = null;
  artifacts: IArtifact[] = [];


  @Input() patientid: string;
  @Input() specimenNo: string;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();
  detactedVariants: IAFormVariant[] = [];

  constructor(
    private fileUploadService: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private artifactsService: ArtifactsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(route => route.get('id'))
    ).subscribe(data => {
      this.testedid = data;
    });
  }

  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = true;
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = false;
    // console.log('Drag leave');
  }

  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      this.onDroppedFile(droppedFiles);
    }
    this.isActive = false;
  }

  onDroppedFile(droppedFiles: any): void {
    const formData = new FormData();
    for (const item of droppedFiles) {
      formData.append('userfiles', item);
    }
    formData.append('testedID', this.testedid);

    this.fileUploadService.fileUpload(formData)
      .subscribe({
        next: (result) => {
        this.upload = result;
      },
      error: (errJson: any) => {
        // 여기서 안전하게 message만 추출) 
        console.log('업로드 오류:', this.jsonMessage);
        this.jsonMessage = errJson || '알 수 없는 오류';
      }
    });
  }

  onSelectedFile(event: any): any {
    if (event.target.files.length > 0) {
      // console.log('[70][onSelectedFile]', event.target.files[0].name);
      // this.onDroppedFile(event.target.files);
      const file = event.target.files[0];
      // this.excelfile(file);
      this.readExcelfile(file);

    }
  }

  readExcelfile(file: File): void {
    let data;
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = reader.result;
      const wb = XLSX.read(fileData, { type: 'binary' });
      const sheet = wb.SheetNames[0];

      const rowObj = XLSX.utils.sheet_to_csv(wb.Sheets[sheet]);

      const datas = this.loadData(this.removeBackslach(rowObj));
      // console.log(rowObj);
      this.artifactsLists(rowObj);


    };

    data = [];
    reader.readAsBinaryString(file);
  }

  artifactsLists(s: string): void {
    let ixEnd = 0;

    for (let ix = 0; ix < s.length; ix = ixEnd + 1) {
      ixEnd = s.indexOf('\n', ix);
      if (ixEnd === -1) {
        ixEnd = s.length;
      }
      const row = s.substring(ix, ixEnd).split(',');
      this.artifacts.push({
        id: '', genes: row[0], locat: '', exon: row[1],
        transcript: row[2], coding: row[3], aminoAcidChange: row[4], type: 'LYM'
      });
    }
    console.log(this.artifacts);
    from(this.artifacts)
      .pipe(
        concatMap(data => this.artifactsService.insertArtifactsList(
          data.id, data.genes, data.locat, data.exon, data.transcript, data.coding, data.aminoAcidChange, data.type
        ))
      )
      .subscribe();

    // public insertArtifactsList(id: string, genes: string, locat: string, exon: string, transcript:
    //   string, coding: string, aminoAcidChange: string, type: string):

  }

  removeBackslach(data: string): string {
    const arr = data.split('\r');
    const newArr = [];
    let newel: string;
    for (const el of arr) {
      if (el.charAt(0) === '\n') {
        newel = el.substring(1);
        newArr.push(newel);
      } else {
        newArr.push(el);
      }
    }

    return newArr.join('');
  }


  goHome(): void {
    this.router.navigate(['/diag']);
  }


  excelfile(file: File): void {
    let data;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];
      data = this.loadData(reader.result);
    };

    data = [];
    reader.readAsText(file);

  }

  loadData(file: ArrayBuffer | string): any {

    let rowCount = 0;
    let tempCount = 0;
    let state = true;
    const scenarios = [];
    this.parse_tsv(file, (row) => {
      rowCount++;
      if (rowCount >= 0) {
        if (row[0].charAt(0) === '"' || row[0].charAt(0) === '*') {
          state = false;
        } else {
          tempCount = rowCount;
        }

        if (tempCount === rowCount && state) {
          scenarios.push(row);
        }

      }
    });
    return scenarios;
  }

  parse_tsv(s, f): void {
    // s = s.replace(/,/g, ';');
    let tempIndex = 10000;
    let count = 0;
    let state = false;
    let ixEnd = 0;
    let tempArr = [];
    for (let ix = 0; ix < s.length; ix = ixEnd + 1) {
      ixEnd = s.indexOf('\n', ix);
      if (ixEnd === -1) {
        ixEnd = s.length;
      }
      const row = s.substring(ix, ixEnd).split(',');

      if (row[0] === 'Gene') {
        tempIndex = ix + 1;
        count++;
      }
      if (ix > tempIndex) {
        state = true;
      }

      if (count > 0 && state) {
        for (const el of row) {
          if (el !== '') {
            tempArr.push(el);
          }
        }
        if (tempArr.length > 0) {
          f(row);
        }
        tempArr = [];
      }
    }
  }


}
