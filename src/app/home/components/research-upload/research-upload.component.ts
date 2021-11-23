import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { concatMap, tap } from 'rxjs/operators';
import { UploadResponse } from '../../models/uploadfile';
import { FileUploadService } from '../../services/file-upload.service';
import { ResearchService } from '../../services/research.service';

@Component({
  selector: 'app-research-upload',
  templateUrl: './research-upload.component.html',
  styleUrls: ['./research-upload.component.scss']
})
export class ResearchUploadComponent implements OnInit {

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  testedid: string;
  filename: string;
  @ViewChild('uploadfile') uploadfile: ElementRef;

  @Input() patientid: string;
  @Input() specimenNo: string;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelected = new EventEmitter<string>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();

  constructor(
    private fileUploadService: FileUploadService,
    private researchService: ResearchService,
  ) { }

  ngOnInit(): void {
    // console.log('[28][ tsvupload][]', this.specimenNo, this.patientid);
  }

  onConfirm(): void {
    this.onSelected.emit(this.filename);
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

    this.testedid = this.specimenNo;
    formData.append('testedID', this.testedid);
    console.log('[79][research-upload]', this.testedid);
    this.researchService.insertPatientBySpecimenno(this.testedid, this.patientid)
      .pipe(
        tap(data => console.log('[86]==> ', data)),
        concatMap(() => this.fileUploadService.fileUpload(formData))
      )
      .subscribe(result => {
        // this.upload = result;
      });

    // this.fileUploadService.fileUpload(formData)
    //   .subscribe(result => {
    //     this.upload = result;
    //   });
  }


  onSelectedFile(event: any): void {
    console.log('[86][tsvupload] ', event.target.files[0].name.indexOf(this.patientid));
    this.filename = event.target.files[0].name;
    this.onDroppedFile(event.target.files);

  }


  onSelectedFile2(event: any): void {

    let patientid = '';
    let extension = '';
    let splitedList = [];
    if (event.target.files.length > 0) {
      const tempSave = event.target.files[0].name.split('.');
      extension = tempSave[tempSave.length - 1];

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

      } else if (extension === 'tsv') {
        patientid = event.target.files[0].name.split('_')[1];
      } else if (extension === 'txt') {
        patientid = event.target.files[0].name.split('-')[1];
      }

      let filenameList;
      if (extension === 'txt') {
        filenameList = event.target.files[0].name.split('.')[0].split('-');
      } else if (extension === 'xlsx') {
        filenameList = splitedList;
      } else {
        filenameList = event.target.files[0].name.split('.')[0].split('_');
      }


      if (filenameList.includes(this.patientid)) {
        this.onDroppedFile(event.target.files);
      } else {
        alert(' 환자번호 ' + this.patientid + '와 파일명의 환자번호 ' + patientid + '가 일치하지 않습니다.');
        this.uploadfile.nativeElement.value = '';
        return;
      }


    }

  }

}


