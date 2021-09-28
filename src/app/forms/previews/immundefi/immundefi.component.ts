import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IAFormVariant, IComment, IImmundefi, IPatient } from 'src/app/home/models/patients';

@Component({
  selector: 'app-immundefi',
  templateUrl: './immundefi.component.html',
  styleUrls: ['./immundefi.component.scss']
})
export class ImmundefiComponent implements OnInit {

  @Input() patientInfo: IPatient;
  @Input() immundefi: IAFormVariant[];
  @Input() comments: IComment[];
  @Input() result: string;
  @Input() title: string;
  @Output() closemodal = new EventEmitter<void>();
  constructor() { }

  ngOnInit(): void {
    console.log(this.immundefi);
  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}
