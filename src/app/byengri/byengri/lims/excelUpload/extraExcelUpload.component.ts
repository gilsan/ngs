import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-extra-excel-upload',
  templateUrl: './extraExcelUpload.component.html',
  styleUrls: ['./extraExcelUpload.component.scss']
})
export class ExtraExcelUploadComponent {

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onWrongFile = new EventEmitter<void>();
  uploadfileList: string[] = [];

  onConfirm(): void {
    this.onSelected.emit(null);
  }

  onCancel(): void {
    this.onCanceled.emit(null);
  }

  onDragOver(evt: Event): void {}
  onDrop(evt: Event): void {}
  onDragLeave(evt: Event): void {}
  onFileSelect(evt: Event): void {

  }





}
