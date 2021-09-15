import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { concatMap, map } from 'rxjs/operators';
import { UploadResponse } from '../../models/uploadfile';
import { FileUploadService } from '../../services/file-upload.service';

import * as XLSX from 'xlsx';
import { constants } from 'zlib';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.scss']
})
export class FileuploadComponent implements OnInit {

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  testedid: string;

  @Input() patientid: string;
  @Input() specimenNo: string;


  constructor(
    private fileUploadService: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
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
      .subscribe(result => {
        this.upload = result;
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
    let cleanData = [];
    const newDatas = [];
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = reader.result;
      const wb = XLSX.read(fileData, { type: 'binary' });
      const sheet = wb.SheetNames[0];

      const rowObj = XLSX.utils.sheet_to_csv(wb.Sheets[sheet]);
      // console.log(rowObj);
      console.log(rowObj.replace(/\r/g, ''));

      //const datas = this.loadData(rowObj);

      // for (const element of datas) {
      //   for (const el of element) {
      //     if (el !== '') {
      //       cleanData.push(el);
      //     }
      //   }
      //   if (cleanData.length > 0) {
      //     newDatas.push(cleanData);
      //   }
      //   cleanData = [];
      // }
      // console.log(newDatas);

    };

    data = [];
    reader.readAsBinaryString(file);
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
      console.log(data);
    };

    data = [];
    reader.readAsText(file);

  }

  loadData(file: ArrayBuffer | string): any {

    let rowCount = 0;
    const scenarios = [];
    this.parse_tsv(file, (row) => {
      rowCount++;
      if (rowCount >= 0) {
        scenarios.push(row);
      }
    });
    return scenarios;
  }

  parse_tsv(s, f): void {
    // s = s.replace(/,/g, ';');
    let tempIndex = 0;
    let count = 0;
    let state = false;
    let ixEnd = 0;

    for (let ix = 0; ix < s.length; ix = ixEnd + 1) {
      ixEnd = s.indexOf('\n', ix);
      if (ixEnd === -1) {
        ixEnd = s.length;
      }
      const row = s.substring(ix, ixEnd).split(',');
      // console.log(row);
      f(row);
      // if (row[0] === 'Gene') {
      //   tempIndex = ix + 1;
      //   count++;
      // }
      // if (ix >= tempIndex) {
      //   state = true;
      // }

      // if (count > 0 && state) {
      //   f(row);
      // }


    }
  }


}
