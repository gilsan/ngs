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
  @Input() analyzedgene: string;
  @Output() closemodal = new EventEmitter<void>();
  constructor() { }

  ngOnInit(): void {

  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}
