import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UploadResponse } from '../../models/uploadfile';
import { FileUploadService } from '../../services/file-upload.service';
@Component({
  selector: 'app-tsvupload',
  templateUrl: './tsvupload.component.html',
  styleUrls: ['./tsvupload.component.scss']
})
export class TsvuploadComponent implements OnInit {

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  testedid: string;

  @ViewChild('uploadfile') uploadfile: ElementRef;

  @Input() patientid: string;
  @Input() specimenNo: string;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();

  constructor(
    private fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    // console.log('[28][ tsvupload][]', this.patientid, this.specimenNo);
  }

  onConfirm(): void {
    this.onSelected.emit(null);
    // 파일 업로드후 초기화
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
  }

  onCancel(): void {
    this.onCanceled.emit(null);
    // 파일 취소후 초기화
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
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
    // console.log('[58][tsvupload]', this.specimenNo, this.patientid);
    const formData = new FormData();
    for (const item of droppedFiles) {
      formData.append('userfiles', item);
    }
    // testedid 찿기
    this.testedid = this.specimenNo;
    formData.append('testedID', this.testedid);

    this.fileUploadService.fileUpload(formData)
      .subscribe(result => {
        this.upload = result;
      });
  }


  onSelectedFile(event: any): void {
    console.log('[][tsvupload]', this.patientid);
    console.log('[][tsvupload]', event.target.files[0].name);
    console.log('[86][tsvupload] ', event.target.files[0].name.indexOf(this.patientid));
    const result = event.target.files[0].name.indexOf(this.patientid);
    if (result !== -1) {
      this.onDroppedFile(event.target.files);
    } else {
      alert('환자정보가 일치하지 않아 파일등록이 이루어지지 않았습니다.');
      this.uploadfile.nativeElement.value = '';
      return;
    }
  }


  onSelectedFile2(event: any): void {
    // console.log('[82][tsvupload] ', event.target.files[0].name);
    let patientid = '';
    let extension = '';
    let splitedList = [];
    if (event.target.files.length > 0) {
      const tempSave = event.target.files[0].name.split('.');
      extension = tempSave[tempSave.length - 1];
      // console.log(extension);
      if (extension === 'xlsx') {
        tempSave.forEach(item => {
          const idx = item.indexOf('_');
          if (idx !== -1) {
            patientid = item.split('_')[4];
            splitedList = [...splitedList, ...item.split(['_'])];
          } else {
            splitedList.push(item);
          }
        });
        // patientid = event.target.files[0].name.split('_')[4].split('.')[0];
      } else if (extension === 'tsv') {
        patientid = event.target.files[0].name.split('_')[1];
      } else if (extension === 'txt') {
        patientid = event.target.files[0].name.split('-')[1];
      }
      // console.log('[109][tsvupload] ', splitedList);
      let filenameList;
      if (extension === 'txt') {
        filenameList = event.target.files[0].name.split('.')[0].split('-');
      } else if (extension === 'xlsx') {
        filenameList = splitedList;
      } else {
        filenameList = event.target.files[0].name.split('.')[0].split('_');
      }

      // console.log('[105][tsvupload] ', patientid, filenameList);
      if (filenameList.includes(this.patientid)) {
        this.onDroppedFile(event.target.files);
      } else {
        alert(' 환자번호 ' + this.patientid + '와 파일명의 환자번호 ' + patientid + '가 일치하지 않습니다.');
        this.uploadfile.nativeElement.value = '';
        return;
      }

      /*
       if (this.patientid === patientid) {
         this.onDroppedFile(event.target.files);
       } else {
         patientid = event.target.files[0].name.split('-')[1];
         if (this.patientid === patientid) {
           this.onDroppedFile(event.target.files);
         } else {

           patientid = event.target.files[0].name.split('_')[2];
           if (this.patientid === patientid) {
             this.onDroppedFile(event.target.files);
           } else {
             patientid = event.target.files[0].name.split('-')[2];
             console.log( '[109]', patientid);
             if (this.patientid === patientid) {
               this.onDroppedFile(event.target.files);
             } else {
               alert(' 환자번호 ' + this.patientid + '와 파일명의 환자번호 ' + patientid + '가 일치하지 않습니다.');
               this.uploadfile.nativeElement.value = '';
               return;
             }
           }

         }

       }
       */
    }

  }


}
