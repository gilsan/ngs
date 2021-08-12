import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IAFormVariant, Ilymphoma, IPatient, IProfile } from 'src/app/home/models/patients';



@Component({
  selector: 'app-lymphomapreview',
  templateUrl: './lymphomaPreview.component.html',
  styleUrls: ['./lymphomaPreview.component.scss']
})
export class LymphomaPreviewComponent implements OnInit {

  @Input() result: string;
  @Input() patientInfo: IPatient;
  @Input() profile: IProfile;
  @Input() lymphoma: IAFormVariant;
  @Input() methods: string;
  @Output() closemodal = new EventEmitter<void>();

  resultStatus: string;
  constructor() { }

  ngOnInit(): void {
    this.resultStatus = this.result;
  }

  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}
