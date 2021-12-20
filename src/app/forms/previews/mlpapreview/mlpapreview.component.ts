import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPatient } from 'src/app/home/models/patients';
import { IData } from '../../mlpa/form5.component';

@Component({
  selector: 'app-mlpapreview',
  templateUrl: './mlpapreview.component.html',
  styleUrls: ['./mlpapreview.component.scss']
})
export class MlpapreviewComponent implements OnInit {

  // @Input() type: string;
  @Input() patientInfo: IPatient;
  @Input() title: string;
  @Input() target: string;
  @Input() testmethod: string;
  @Input() analyzedgene: string;
  @Input() request: string;
  @Input() result: string;
  @Input() resultStatus: string;
  @Input() mlpaData1: IData[];
  @Input() mlpaData2: IData[];
  @Input() conclusion: string;
  @Input() comment: string;
  @Input() specimen: string;
  @Input() technique: string;
  @Output() closemodal = new EventEmitter<void>();
  type = 'type3';
  constructor() { }

  showTable3: boolean;
  showTable4: boolean;
  ngOnInit(): void {

    if (this.type === 'type3') {
      this.showTable3 = true;
      this.showTable4 = false;
    }

  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}

