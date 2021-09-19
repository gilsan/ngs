import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PathologyService } from '../../services/pathology.service';

import { map, take } from 'rxjs/operators';
import { IPatient } from '../../models/patients';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { emrUrl } from 'src/app/config';

@Component({
  selector: 'app-sequencingreport',
  templateUrl: './sequencingreport.component.html',
  styleUrls: ['./sequencingreport.component.scss']
})
export class SequencingreportComponent implements OnInit {

  patientInfo: IPatient;
  pathologyNum: string;
  img1 = '';
  img2 = '';
  img3 = '';
  path = '';
  private apiUrl = emrUrl;

  constructor(
    private route: ActivatedRoute,
    private pathologyService: PathologyService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.route.paramMap.pipe(
      map(route => route.get('id')),
      take(1)
    ).subscribe(pathologyNum => {

      this.pathologyNum = pathologyNum; // 검체번호 저장
      try {
        this.patientInfo = this.pathologyService.patientInfo.filter(item => item.pathology_num === pathologyNum)[0];
        if (this.patientInfo.img1.length > 0) {
          const tempArr = this.patientInfo.img1.split('/');
          this.img1 = tempArr[4];
          this.path = tempArr[0] + '/' + tempArr[1] + '/' + tempArr[2] + '/' + tempArr[3];
        }
        if (this.patientInfo.img2.length > 0) {
          const tempArr = this.patientInfo.img2.split('/');
          this.img2 = tempArr[4];
          this.path = tempArr[0] + '/' + tempArr[1] + '/' + tempArr[2] + '/' + tempArr[3];
        }
        if (this.patientInfo.img3.length > 0) {
          const tempArr = this.patientInfo.img3.split('/');
          this.img3 = tempArr[4];
        }
        // console.log(this.patientInfo);
        // console.log(this.path);
        // console.log(this.img1);

      } catch (err) {
        console.log(err);
      }


    });
  }


  getUrl(type: string): SafeResourceUrl {
    let url = '';
    if (type === 'img1') {
      url = this.apiUrl + '/showImage?path=' + this.path + '&filename=' + this.img1;
    } else if (type === 'img2') {
      url = this.apiUrl + '/showImage?path=' + this.path + '&filename=' + this.img2;
    } else if (type === 'img3') {
      url = this.apiUrl + '/showImage?path=' + this.path + '&filename=' + this.img3;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
