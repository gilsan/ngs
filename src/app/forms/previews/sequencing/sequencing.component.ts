import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPatient, ISequence } from 'src/app/home/models/patients';

@Component({
  selector: 'app-sequencing',
  templateUrl: './sequencing.component.html',
  styleUrls: ['./sequencing.component.scss']
})
export class SequencingComponent implements OnInit {

  @Input() patientInfo: IPatient;
  @Input() sequences: ISequence[];
  @Input() result: string;
  @Input() title: string;
  @Input() resultname: string;
  @Input() targetdisease: string;
  @Input() method: string;
  @Input() specimen: string;
  @Input() analyzedgene: string;
  @Input() variations: string;
  @Input() seqcomment: string;
  @Input() comment: string;
  @Input() comment1: string;
  @Input() comment2: string;
  @Output() closemodal = new EventEmitter<void>();
  constructor() { }

  ngOnInit(): void {

  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}
