import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { UploadResponse } from '../../models/uploadfile';
import { FileUploadService } from '../../services/file-upload.service';

import * as XLSX from 'xlsx';
import { IAFormVariant, IComment, IPatient, IProfile } from '../../models/patients';
import { DetectedVariantsService } from '../../services/detectedVariants';
import { SubSink } from 'subsink';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

export interface Idv {
  type: string;
  gene: string;
  functionalImpact: string;
  transcript: string;
  exonIntro: string;
  nucleotideChang: string;
  aminoAcidChange: string;
  zygosity: string;
  vafPercent: string;
  references: string;
  cosmicID: string;
}


@Component({
  selector: 'app-xlxsupload',
  templateUrl: './xlxsupload.component.html',
  styleUrls: ['./xlxsupload.component.scss']
})
export class XlxsuploadComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  testedid: string;

  @ViewChild('uploadfile') uploadfile: ElementRef;

  @Input() patientid: string;
  @Input() specimenNo: string;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();


  profile: IProfile = { leukemia: '', flt3itd: '', chron: '' };
  patientInfo: IPatient = {
    name: '',
    patientID: '',
    age: '',
    gender: '',
    testedNum: '',
    leukemiaAssociatedFusion: '',
    leukemiaassociatedfusion: '',
    IKZK1Deletion: '',
    FLT3ITD: '',
    bonemarrow: '',
    diagnosis: '',
    genetictest: '',
    chromosomalAnalysis: '',
    chromosomalanalysis: '',
    targetDisease: '',
    method: '',
    accept_date: '',
    specimen: '',
    detected: '',
    request: '',
    tsvFilteredFilename: '',
    path: '',
    //  createDate:  0000-00-00,
    tsvFilteredStatus: '',
    //  tsvFilteredDate: 0000-00-00,
    bamFilename: '',
    sendEMRDate: '',
    report_date: '',
    specimenNo: '',
    test_code: '',
    screenstatus: '',
    recheck: '',
    examin: '',
  };

  comments: IComment[] = [];
  formData: IAFormVariant[] = [];

  constructor(
    private fileUploadService: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private variantsService: DetectedVariantsService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(route => route.get('id'))
    ).subscribe(data => {
      this.testedid = data;
    });
  }

  // tslint:disable-next-line: typedef
  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = true;
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = false;
  }

  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      this.onDroppedFile(droppedFiles);
    }
    this.isActive = false;
  }

  onDroppedFile(droppedFiles: any): void {
    const formData = new FormData();
    for (const item of droppedFiles) {
      formData.append('userfiles', item);
    }
    formData.append('testedID', this.testedid);

    this.fileUploadService.fileUpload(formData)
      .subscribe(result => {
        this.upload = result;
      });
  }

  onSelectedFile(event: any): any {
    if (event.target.files.length > 0) {
      // this.onDroppedFile(event.target.files);
      const file = event.target.files[0];
      this.readExcelfile(file);

    }
  }

  onCancel(): void {
    this.onCanceled.emit(null);
    // // 파일 취소후 초기화
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
  }

  onConfirm(): void {
    this.onSelected.emit(null);
    // // 파일 업로드후 초기화
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
  }

  readExcelfile(file: File): void {
    let data;
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = reader.result;
      const wb = XLSX.read(fileData, { type: 'binary' });
      const sheet = wb.SheetNames[0];

      const rowObj = XLSX.utils.sheet_to_csv(wb.Sheets[sheet]);
      const datas = this.loadData(this.removeBackslach(rowObj));
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < datas.length; i++) {
        this.formData.push({
          gene: datas[i][0],
          functionalImpact: datas[i][1],
          transcript: datas[i][2],
          exonIntro: datas[i][3],
          nucleotideChange: datas[i][4],
          aminoAcidChange: datas[i][5],
          zygosity: datas[i][6],
          vafPercent: datas[i][7],
          references: datas[i][8],
          cosmicID: datas[i][9],
          checked: false,
          cnt: '',
          id: '',
          igv: '',
          sanger: '',
          type: '',
        });
      }


      this.subs.sink = this.variantsService.screenTempSave(this.specimenNo, this.formData,
        this.comments, this.profile, '', this.patientInfo)
        .subscribe(data => {
          console.log(data);
          console.log(this.formData);
          console.log(this.specimenNo);
        });
    };

    data = [];
    reader.readAsBinaryString(file);
  }

  removeBackslach(data: string): string {
    const arr = data.split('\r');
    const newArr = [];
    let newel: string;

    for (const el of arr) {
      if (el.charAt(0) === '\n') {
        // newel = el.substring(1);
        // \n 을 한칸 공백으로
        newel = el.substring(0, 0) + ' ' + el.substring(1);
        newArr.push(newel);
      } else {
        newArr.push(el);
      }
    }
    return newArr.join('');
  }


  goHome(): void {
    this.router.navigate(['/diag']);
  }


  loadData(file: ArrayBuffer | string): any {

    let rowCount = 0;
    let tempCount = 0;
    let state = true;
    const scenarios = [];
    let cleanData = [];
    this.parse_tsv(file, (row) => {
      rowCount++;
      if (rowCount >= 0) {
        if (row[0].charAt(0) === '"' || row[0].charAt(0) === '*') {
          state = false;
        } else {
          tempCount = rowCount;
        }

        if (tempCount === rowCount && state) {
          for (const el of row) {
            cleanData.push(el.replace(/\"/g, ''));
          }
          scenarios.push(cleanData);
          cleanData = [];
        }

      }
    });
    return scenarios;
  }
  /* ----------------------------------------------------------------
  gene: "JAK2"
  functionalImpact: "Pathogenic"
  transcript: "NM_004972.4"
  exonIntro: "E14"
  nucleotideChange: "c.1849G>T"
  aminoAcidChange: "p.Val617Phe"
  zygosity:
  vafPercent: "43.40"
  references: "rs77375493"
  cosmicID: "COSM12600"
  checked: true
  cnt: "1"
  id: null
  igv: ""
  sanger: ""
  status: "OLD"
  type: "M"



  */

  parse_tsv(s, f): void {
    let tempIndex = 10000;
    let count = 0;
    let state = false;
    let ixEnd = 0;
    let tempArr = [];
    for (let ix = 0; ix < s.length; ix = ixEnd + 1) {
      ixEnd = s.indexOf('\n', ix);
      if (ixEnd === -1) {
        ixEnd = s.length;
      }
      const row = s.substring(ix, ixEnd).split(',');
      if (row[0] === 'Gene') {
        tempIndex = ix + 1;
        count++;
      }
      if (ix > tempIndex) {
        state = true;
      }

      if (count > 0 && state) {
        for (const el of row) {
          if (el !== '') {
            tempArr.push(el);
          }
        }
        if (tempArr.length > 0) {
          f(row);
        }
        tempArr = [];
      }
    }
  }


}
