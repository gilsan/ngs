import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPatient, ISequence } from 'src/app/home/models/patients';

@Component({
  selector: 'app-sequencing',
  templateUrl: './sequencing.component.html',
  styleUrls: ['./sequencing.component.scss']
})
export class SequencingComponent implements OnInit {

  @Input() patientInfo: IPatient;
  @Input() sequence: ISequence;
  @Input() result: string;
  @Input() title: string;
  @Output() closemodal = new EventEmitter<void>();
  constructor() { }

  ngOnInit(): void {
  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}
