import { Component, Input, OnInit } from '@angular/core';
import { Ilymphoma, IPatient, IProfile } from 'src/app/home/models/patients';



@Component({
  selector: 'app-lymphomapreview',
  templateUrl: './lymphomaPreview.component.html',
  styleUrls: ['./lymphomaPreview.component.scss']
})
export class LymphomaPreviewComponent implements OnInit {

  @Input() result: string;
  @Input() patientInfo: IPatient;
  @Input() profile: IProfile;
  @Input() lymphoma: Ilymphoma;


  constructor() { }

  ngOnInit(): void {
    console.log('', this.result);
    console.log('', this.patientInfo);
    console.log('', this.profile);
    console.log('', this.lymphoma);
  }

}
