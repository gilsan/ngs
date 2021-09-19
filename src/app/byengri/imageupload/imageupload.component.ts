import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Subject } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { FileUploadService } from 'src/app/home/services/file-upload.service';
import { RearchStorePathService } from '../mainpa_services/store.path.service';
import { IFilteredOriginData } from '../models/patients';
import { UploadResponse } from '../models/uploadfile';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { IGeneTire } from './../models/patients';

@Component({
  selector: 'app-imageupload',
  templateUrl: './imageupload.component.html',
  styleUrls: ['./imageupload.component.scss']
})
export class ImageuploadComponent implements OnInit {

  @ViewChild('uploadfile') uploadfile: ElementRef;
  @Input() pathologyNo: string;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onWrongFile = new EventEmitter<void>();

  upload: UploadResponse = new UploadResponse();


  filename: string;
  filenames = [];

  uploadfileList: string[] = [];


  fields: string[] = [];

  constructor(

    private uploadfileService: FileUploadService,


  ) { }


  ngOnInit(): void {
    this.uploadfileList = [];

  }


  onConfirm(): void {

    this.onSelected.emit(null);
    // 파일 업로드후 초기화
    this.uploadfileList = [];
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
  }

  onCancel(): void {

    this.onCanceled.emit(null);
    // 파일 취소후 초기화
    this.uploadfileList = [];
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
  }

  onDragOver(event: any): void {

    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: any): void {

    event.preventDefault();
    event.stopPropagation();
    // console.log('[96][upload][onDrop] ', event);
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      this.onDroppedFile(droppedFiles);
    }

  }

  onDroppedFile(droppedFiles: any): void {

    const formData = new FormData();
    for (const item of droppedFiles) {
      formData.append('imagefiles', item);
    }

    console.log('[102][검체번호] formData: ===> ', this.pathologyNo);
    formData.append('pathologyNum', this.pathologyNo);


    this.uploadfileService.pathImageUpload(formData)
      .pipe(
        filter(item => item.files !== undefined),
        filter(item => item.files.length > 0)
      )
      .subscribe(result => {
        console.log('[112] ==>', result);
        this.upload = result;
        this.upload.files.forEach(item => {
          const { filename } = item;
          this.uploadfileList.push(filename);
        });
      });

  }

  onFileSelect(event: Event): any {

    // console.log(event);
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    //  console.log(files, files.length);
    if (files.length > 0) {
      // tslint:disable-next-line:prefer-for-of
      // for (let i = 0; i < files.length; i++) {
      //   this.filename = files[i].name;
      //   const file = files[i];
      // }

      this.onDroppedFile(files);

    }


  }


}
