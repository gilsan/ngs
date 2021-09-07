import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPatient } from 'src/app/home/models/patients';
import { IData } from '../../mlpa/form5.component';

@Component({
  selector: 'app-mlpapreview',
  templateUrl: './mlpapreview.component.html',
  styleUrls: ['./mlpapreview.component.scss']
})
export class MlpapreviewComponent implements OnInit {

  @Input() type: string;
  @Input() patientInfo: IPatient;
  @Input() title: string;
  @Input() request: string;
  @Input() result: string;
  @Input() resultStatus: string;
  @Input() mlpaData1: IData[];
  @Input() mlpaData2: IData[];
  @Input() conclusion: string;
  @Input() comment: string;
  @Output() closemodal = new EventEmitter<void>();
  constructor() { }

  showTable3: boolean;
  showTable4: boolean;
  ngOnInit(): void {
    console.log(this.request, this.result, this.resultStatus);
    if (this.type === 'type3') {
      this.showTable3 = true;
      this.showTable4 = false;
    } else if (this.type === 'type4') {
      this.showTable3 = false;
      this.showTable4 = true;
    }
  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}

