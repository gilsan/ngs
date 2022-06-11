import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { LimtStore } from '../lims.store';

@Component({
  selector: 'app-extra-excel-upload',
  templateUrl: './extraExcelUpload.component.html',
  styleUrls: ['./extraExcelUpload.component.scss']
})
export class ExtraExcelUploadComponent {

  @ViewChild('uploadfile') uploadfile: ElementRef;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onWrongFile = new EventEmitter<void>();
  uploadfileList: string[] = [];
  isActive: boolean;

  constructor(private limtStore: LimtStore) {}

  onConfirm(): void {
    this.onSelected.emit(null);
    this.uploadfileList = [];
  }

  onCancel(): void {
    this.onCanceled.emit(null);
    this.uploadfileList = [];
  }

  onDragOver(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = true;
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = false;
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

  }

  onFileSelect(event: any): void {

    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;

    if (event.target.files.length > 0) {
      // tslint:disable-next-line:prefer-for-of
      for ( let i = 0; i < event.target.files.length; i++) {
        const filename = event.target.files[i].name;
        const file = event.target.files[i];
        this.uploadfileList.push(filename);
        const firstDivideFilename = filename.split('.')[0];
        const secondDivideFilename = firstDivideFilename.split('_');


        if (secondDivideFilename.includes('QubitData')) {
          this.qubitData(file);
        } else if (secondDivideFilename.includes('RNAseP')) {
          this.rNAseP(file);
        } else {
          const qPCRname = secondDivideFilename[1].split(' ')[1];
          if (qPCRname === 'qPCR') {
            this.qPCR(file);
          }
        }
      }
    }

    this.onDroppedFile(event.target.files);
   //  console.log('[73][화일선택]', this.uploadfileList);

  }

  rNAseP(file: File): void {
    let currR: number;
    const wellposition: string[] = [];
    const samplename: string[] = [];
    const ct: string[] = [];
    const quantity: string[] = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = reader.result;

      const wb = XLSX.read(fileData, { type: 'array' });

      const sheet = wb.Sheets.Results;

      const range = XLSX.utils.decode_range(sheet['!ref']); // 범위값 얻음
      for (let R = range.s.r; R <= range.e.r; ++R) {

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellref = XLSX.utils.encode_cell({ c: C, r: R }); //   A1 참조
          if (!sheet[cellref]) { continue; } // 없으면게속
          const cell = sheet[cellref];

          if (C === 1) {

            if (cell.v === 'Well Position') {
               currR = R;
            }
            if ( R > currR ) {
              wellposition.push(cell.v);
            }
          } else if (C === 3) {
            if ( R > currR ) { samplename.push(cell.v); }
          } else if (C === 8) {
            if ( R > currR ) {  ct.push(cell.v); }
          } else if (C === 11) {
            if ( R > currR ) {  quantity.push(cell.v); }
          }
        }
      }

      if (wellposition.length) {
        this.limtStore.setRNAsePWellPosition(wellposition);
      }
      if (samplename.length) {
        this.limtStore.setRNAsepSampleName(samplename);
      }

      if (ct.length) {
        this.limtStore.setRNAsepCT(ct);
      }

      if (quantity.length) {
        this.limtStore.setRNAsepQuantity(quantity);
      }
    //  console.log('[135] ', wellposition, samplename, ct, quantity );

    };
    reader.readAsArrayBuffer(file);
  }

  qPCR(file: File): void {
    let currR: number;
    const wellposition: string[] = [];
    const quantity: string[] = [];
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = reader.result;

      const wb = XLSX.read(fileData, { type: 'array' });
      const sheet = wb.Sheets.Results;
      console.log('[165] ', wb );
      const range = XLSX.utils.decode_range(sheet['!ref']); // 범위값 얻음
      for (let R = range.s.r; R <= range.e.r; ++R) {

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellref = XLSX.utils.encode_cell({ c: C, r: R }); //   A1 참조
          if (!sheet[cellref]) { continue; } // 없으면게속
          const cell = sheet[cellref];
          if (C === 1) {
            if (cell.v === 'Well Position') {
              currR = R;
           }
            if ( R > currR ) {
             wellposition.push(cell.v);
           }
          } else if (C === 11) {
            if ( R > currR ) {
              quantity.push(cell.v);
            }
          }


        }
      }

      if (wellposition.length) {
        this.limtStore.setqPCRWellPosition(wellposition);
      }

      if (quantity.length) {
        this.limtStore.setqPCRQuantity(quantity);
      }

    };
    reader.readAsArrayBuffer(file);
  }

  qubitData(file: File): void {
    let currR: number;
    const assay: string[] = [];
    const original: string[] = [];
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = reader.result;

      const wb = XLSX.read(fileData, { type: 'array' });

      const sheet = wb.Sheets.Results;

      const range = XLSX.utils.decode_range(sheet['!ref']); // 범위값 얻음
      for (let R = range.s.r; R <= range.e.r; ++R) {

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellref = XLSX.utils.encode_cell({ c: C, r: R }); //   A1 참조
          if (!sheet[cellref]) { continue; } // 없으면게속
          const cell = sheet[cellref];

          if (C === 1) {

            if (cell.v === 'Assay Name') {
              currR = R;
           }
            if ( R > currR ) {
             assay.push(cell.v);
           }
          } else if (C === 6) {
            if ( R > currR ) {
              original.push(cell.v);
            }
          }
        }
      }

      if (assay.length) {
        this.limtStore.setqubitDataAssay(assay);
      }

      if (original.length) {
        this.limtStore.setqubitDatOrigin(original);
      }


    };
    reader.readAsArrayBuffer(file);
  }







}
