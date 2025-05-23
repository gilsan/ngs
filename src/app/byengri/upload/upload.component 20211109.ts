import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Subject } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { FileUploadService } from 'src/app/home/services/file-upload.service';
import { RearchStorePathService } from '../mainpa_services/store.path.service';
import { IFilteredOriginData } from '../models/patients';
import { UploadResponse } from '../models/uploadfile';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { IGeneTire } from '../models/patients';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {


  @Input() research = 'none';
  @ViewChild('uploadfile') uploadfile: ElementRef;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onWrongFile = new EventEmitter<void>();

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  pathologyNum: string;
  inputType: string; // N:신규입력, R: 재입력
  fileType: string;  // IR, OR
  diseaseNumber: string;
  mutationScore: string;
  msiScore: string;
  msiUnit: string;
  type: string;
  percentage: number;
  status$ = new Subject();
  status = [];
  filteredOriginData: IFilteredOriginData[] = [];
  prelevalentMutation = [];
  clinically = [];
  clinically2: { gene: string, seq: string }[] = [];
  clinical: IGeneTire[] = [];
  prevalent = [];
  prevalent2: { gene: string, seq: string }[] = [];
  uploadfileList: string[] = [];

  tumorType: string;
  burden: string;

  fields: string[] = [];

  constructor(
    // private fileUploadService: PathologyService,
    private pathologyService: PathologyService,
    private uploadfileService: FileUploadService,
    private store: StorePathService,
    private researchStore: RearchStorePathService,
    private router: Router,
    private route: ActivatedRoute,

  ) { }


  ngOnInit(): void {
    this.uploadfileList = [];
    this.tumorType = '';
    this.burden = '';
    // console.log('[55][upload][ngOnInit]', this.uploadfileList, this.research);

  }


  onConfirm(): void {

    this.onSelected.emit(null);
    // 파일 업로드후 초기화
    this.uploadfileList = [];
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
  }

  onCancel(): void {

    this.onCanceled.emit(null);
    // 파일 취소후 초기화
    this.uploadfileList = [];
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
    this.filteredOriginData = [];
    this.prelevalentMutation = [];
    this.clinically = [];
    this.clinical = [];
    this.prevalent = [];
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
    // console.log('Drag leave');
  }

  onDrop(event: any): void {

    event.preventDefault();
    event.stopPropagation();
    // console.log('[96][upload][onDrop] ', event);
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

    if (this.research === 'research') {
      this.pathologyNum = this.researchStore.getPathologyNo();
      this.inputType = this.researchStore.getType();
    } else {
      this.pathologyNum = this.store.getPathologyNo();
      this.inputType = this.store.getType();
    }

    console.log('[144][검체번호] formData: ===> ', this.pathologyNum, this.inputType);
    formData.append('pathologyNum', this.pathologyNum);
    formData.append('type', this.inputType);
    formData.append('fileType', this.fileType);

    if (this.research === 'research') {
      this.uploadfileService.pathResearchDataUpload(formData)
        .pipe(
          filter(item => item.files !== undefined),
          filter(item => item.files.length > 0)
        )
        .subscribe(result => {
          this.upload = result;
          this.upload.files.forEach(item => {
            const { filename } = item;
            this.uploadfileList.push(filename);
          });
        });
    } else {
      this.uploadfileService.pathDataUpload(formData)
        .pipe(
          filter(item => item.files !== undefined),
          filter(item => item.files.length > 0)
        )
        .subscribe(result => {
          this.upload = result;
          this.upload.files.forEach(item => {
            const { filename } = item;
            this.uploadfileList.push(filename);
          });
        });

    }



  }

  onSelectedFile(event: any): void {

    // console.log('[130][화일선택]', event.target.fileList);
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    // console.log(files);
    if (event.target.files.length > 0) {
      const filename = event.target.files[0].name;
      const file = event.target.files[0];

      //  console.log('[fileupload][병리 파일명][96]', filename);
      if (filename === 'Statistic.txt') {
        // this.Statistic(file);
      } else {
        const diseaseFilename = filename.split('_');
        this.diseaseNumber = diseaseFilename[0];
        // console.log('[fileupload][병리 파일분류][159]', diseaseFilename);
        // this.pathologyNum = this.pathologyService.getPathologyNum();

        if (this.research === 'research') {
          this.pathologyNum = this.researchStore.getPathologyNo();
        } else {
          this.pathologyNum = this.store.getPathologyNo();
        }

        // console.log('[162][pathologyNum]', this.pathologyNum);
        this.type = this.pathologyService.getType();

        if (diseaseFilename.includes('RNA') || diseaseFilename.includes('Non-Filtered')) {
          this.nonefilter(file);
        } else if (diseaseFilename.includes('All') || diseaseFilename.includes('All (1)') || diseaseFilename.includes('OR.tsv')) {
          this.fileType = 'OR';
          this.allOR(file);
        } else {
          this.fileType = 'IR';
          this.donefilter(file);
        }
      }

      this.onDroppedFile(event.target.files);
      // alert('파일이 등록 되었습니다.');


    }
  }

  onFileSelect(event: Event): any {

    // console.log(event);
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    //  console.log(files, files.length);
    if (files.length > 0) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < files.length; i++) {
        const filename = files[i].name;
        const file = files[i];

        const diseaseFilename = filename.split('_');
        this.diseaseNumber = diseaseFilename[0];
        // console.log('[fileupload][병리 파일분류][192]', diseaseFilename);
        // this.pathologyNum = this.pathologyService.getPathologyNum();

        if (this.research === 'research') {
          this.pathologyNum = this.researchStore.getPathologyNo();
        } else {
          this.pathologyNum = this.store.getPathologyNo();
        }


        if (this.pathologyNum === undefined || this.pathologyNum === null) {
          // this.pathologyNum = this.store.getPathologyNo();
          if (this.research === 'research') {
            this.pathologyNum = this.researchStore.getPathologyNo();
          } else {
            this.pathologyNum = this.store.getPathologyNo();
          }
        }
        // console.log('[234][upload][선택한 환자 병리번호 pathologyNum]', this.pathologyNum);
        this.type = this.pathologyService.getType();
        if (this.type === undefined) {
          if (this.research === 'research') {
            this.type = this.researchStore.getType();
          } else {
            this.type = this.store.getType();
          }
        }

        if (diseaseFilename.includes('RNA') || diseaseFilename.includes('Non-Filtered')) {
          this.nonefilter(file);
        } else if (diseaseFilename.includes('All') || diseaseFilename.includes('All (1)') || diseaseFilename.includes('OR.tsv')) {
          this.fileType = 'OR';
          this.allOR(file);
        } else {
          this.fileType = 'IR';
          this.donefilter(file);
        }
      }

      this.onDroppedFile(files);


    }


  }

  // 보고서/결과지에 표시할 "tumor mutation burden" => 9.44
  // tslint:disable-next-line: typedef
  allOR(file: File) {

    const reader = new FileReader();
    let data;
    reader.onload = (e) => {
      const lists = [];
      data = this.loadData(reader.result);

      let start = 0;
      let status = false;
      let count = 0;
      let nextline;
      let clinicallyCount = 0;
      let tempSave = 'none';
      let tumorBurden = false;
      let idxNo = 0;

      data.filter(list => list[0] !== 'Public data sources included in relevant therapies')
        .forEach((list, index) => {
          if (list[0].length > 0) {
            const temp1 = list[0].split('(');
            if ((temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1]) ||
              (list[0] === 'Tumor Mutational Burden' && list[1] !== undefined)) {

              if (temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1]) {
                const temp2 = temp1[1].split(' ');
                if (temp2[1] === 'Mut/Mb') {
                  // status = false;
                  // start = index;
                  this.burden = temp2[0];
                  idxNo = index;
                }
              }

              if (list[0] === 'Tumor Mutational Burden' && list[1] !== undefined) {
                const burden = list[1].split(' ');
                if (burden[1] === 'Mut/Mb') {
                  this.burden = burden[0];
                  idxNo = index;
                }
              }
            }
          }
        });

      const data2 = data.splice(idxNo, 1);
      console.log('[336][Tumor 존재여부] ===> ', this.burden);
      data.filter(list => list[0] !== 'Public data sources included in relevant therapies')
        .forEach((list, index) => {
          // console.log('[338][]', list[0]);

          if (list[0].length > 0) {

            if (list[0].trim() === 'Sample Cancer Type') {
              this.tumorType = list[1].trim();
              // this.pathologyService.setTumortype(list[1].trim(), this.pathologyNum);
            }
            // const temp1 = list[0].split('(');


            // if ((temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1]) ||
            //   (list[0] === 'Tumor Mutational Burden' && list[1] !== undefined)) {
            //   if (tempSave === 'none') {
            //     tempSave = 'Genomic';
            //   } else if (tempSave === 'Genomic') {
            //     tempSave = 'Tumor';
            //   }

            // } else if (list[0] === 'Genomic Alteration' && (list[1] === 'Gene Name')) {
            //   if (tempSave === 'none') {
            //     tempSave = 'Genomic';
            //   } else if (tempSave === 'Genomic') {
            //     tempSave = 'Tumor';
            //   }
            // }


            // if (tempSave === 'Tumor') {
            //   if (temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1]) {
            //     const temp2 = temp1[1].split(' ');
            //     if (temp2[1] === 'Mut/Mb') {
            //       status = false;
            //       start = index;

            //       this.burden = temp2[0];
            //       // console.log('[193][burden] ', this.burden);
            //     }

            //     if (count > 0) {
            //       status = false;
            //     } else {
            //       status = true;
            //       start = index + 1;
            //     }
            //     count++;
            //   }

            //   if (list[0] === 'Tumor Mutational Burden' && list[1] !== undefined) {
            //     const burden = list[1].split(' ');
            //     if (burden[1] === 'Mut/Mb') {
            //       this.burden = burden[0];
            //     }

            //     if (count > 0) {
            //       status = false;
            //     } else {
            //       status = true;
            //       start = index + 1;
            //     }
            //     count++;
            //   }
            // } else if (tempSave === 'Genomic') {
            //   if (temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1]) {
            //     const temp2 = temp1[1].split(' ');
            //     if (temp2[1] === 'Mut/Mb') {
            //       status = false;
            //       start = index;
            //       this.burden = temp2[0];
            //       // console.log('[193][burden] ', this.burden);
            //     }
            //   }

            //   if (list[0] === 'Tumor Mutational Burden' && list[1] !== undefined) {
            //     const burden = list[1].split(' ');
            //     if (burden[1] === 'Mut/Mb') {
            //       this.burden = burden[0];
            //     }
            //   }
            // }
            // Tumor Mutational Burden 없는 경우
            // console.log('[399][Tumor 존재여부] ===> ', tumorBurden, this.burden);
            // if (!tumorBurden) {
            //   tempSave = 'Tumor';
            // }

            if (list[0] === 'Genomic Alteration' && (list[1] === 'Gene Name')) {
              if (count > 0) {
                status = false;
              } else {
                status = true;
                start = index + 1;
              }
              count++;
            }

            if (list[4] === undefined || list[4].length === 0) {
              status = false;
            }

            if (index >= start && status) {
              const len = this.checkListNum(list[0]);

              if (len === 1) {
                const filteredlist = list[0].trim().split(' ');
                const tier = list[2].substring(0, list[2].length - 1);
                // filteredlist 길이
                const filteredlistLen = filteredlist.length;
                if (filteredlistLen >= 2 && list[0].length) {  //
                  if (filteredlist[1] !== 'deletion' && filteredlist[1] !== 'stable') {

                    this.clinical.push({ gene: filteredlist[0], tier, frequency: list[3] });  // 티어
                    this.clinically.push(list[0]); // 유전자
                    this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString() }); // 신규
                    clinicallyCount++;
                    list[0] = '';

                  }

                  if (filteredlist.includes('exon') && filteredlist[1] === 'exon' && list[0].length) {
                    this.clinical.push({ gene: filteredlist[0].trim(), tier, frequency: list[3] });
                    this.clinically.push(list[0]);
                    this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString() }); // 신규
                    clinicallyCount++;
                    list[0] = '';

                  }

                } else if (filteredlistLen === 4) {
                  if (filteredlist.includes('exon')) {
                    this.clinical.push({ gene: filteredlist[0].trim(), tier, frequency: list[3] });
                    this.clinically.push(list[0]);
                    this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString() }); // 신규
                    clinicallyCount++;
                    list[0] = '';

                  }
                }

              } else if (len > 1) {
                //  구분자를 ; ==> , 변경 21.5.7
                const tempGene = list[0].split(',');
                const tempfre = list[3].split('(')[0].split(',');
                // console.log('==== [346][네번째][tempGene]', list, tempfre);
                for (let i = 0; i < tempGene.length - 1; i++) {
                  const onetier = list[2].substring(0, list[2].length - 1);
                  const tempfilteredlist = tempGene[i].trim().split(' ');

                  if (tempfilteredlist[1] !== 'deletion') {
                    this.clinical.push({ gene: tempfilteredlist[0], tier: onetier, frequency: tempfre[i].trim() }); // 원본 tempfre[i].trim()
                    this.clinically.push(tempGene[i].trim());
                    this.clinically2.push({ gene: tempGene[i].trim(), seq: clinicallyCount.toString() }); // 신규
                    clinicallyCount++;
                  }
                } // End of for loop

              }

            }  // End of Clinically if

            if (count === 2) { }

            if (list[0].trim() === 'Prevalent cancer biomarkers without relevant evidence based on included data sources') {

              nextline = index + 1;
            }

            if (nextline === index) {
              this.prevalent = list[0].replace(/&gt;/g, '>').split(';').filter(item => {
                const member = item.trim().split(' ');
                // console.log('[362][prevalent]', this.prevalent);
                return member[1] !== 'deletion';

              });
              // console.log('===== [330][prevalent][전]', this.prevalent);
              this.prevalent.forEach((item, idx) => {
                this.prevalent2.push({ gene: item.trim(), seq: idx.toString() });
              });
              // console.log('===== [333][prevalent][후]', this.prevalent2);
            }
          }
        });  // End of ForEach
      // console.log('==== [325][디비전송]' + '[clinically2]' + this.clinically2 + ' [prevalent2]' + this.prevalent2);
      // from(this.clinically)
      //   .pipe(
      //     map(clinicallydata => [clinicallydata]),
      //     concatMap(item => this.pathologyService.setClinically(item, this.pathologyNum))
      //   ).subscribe(result => {
      //     this.clinically = [];
      //   });

      // this.pathologyService.setClinically(this.clinically, this.pathologyNum)
      this.pathologyService.setClinically2(this.clinically2, this.pathologyNum)
        .pipe(
          concatMap(() => this.pathologyService.setTumortype(this.tumorType, this.pathologyNum)),
          concatMap(() => this.pathologyService.setPrevalent2(this.prevalent2, this.pathologyNum)),
          concatMap(() => this.pathologyService.setTumorMutationalBurden(this.burden, this.pathologyNum)),
          concatMap(() => this.pathologyService.setClinical(this.clinical, this.pathologyNum))

        ).subscribe(result => {
          // console.log(result);
          this.clinically = [];
          this.tumorType = '';
          this.clinical = [];
          this.prevalent = [];
          this.burden = '';
          this.clinically2 = [];
          this.prevalent2 = [];
        });

    };
    data = [];
    reader.readAsText(file);
  }

  nonefilter(file: File): void {

    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];
      const data = this.loadData(reader.result);
      data.forEach(item => {
        const checkshap = item.toString().indexOf('#');
        if (checkshap !== -1) {
          lists.push(item[0]);
        }
      });
      console.log('==== [382][nonfilter]', lists);
      lists.forEach(list => {
        const msiList = list.split('##')[1].split('=');
        console.log('==== [398][nonfilter]', msiList);
        if (msiList[0] === 'sampleDiseaseType') {
          this.type = msiList[1].replace(/(\r\n|\r)/gm, '');
          this.pathologyService.setTumortype(this.type, this.pathologyNum);
          this.status$.next('type');
        } else if (msiList[0] === 'CellularityAsAFractionBetween0-1') {
          this.percentage = parseFloat(msiList[1]) * 100;

          this.status$.next('percentage');
        }
      });

      this.pathologyService.setTumorCellPercentage(this.percentage.toString(), this.pathologyNum); // 퍼센트
    };
    reader.readAsText(file);

  }

  donefilter(file: File): any {
    let loadDataIndex: number;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];
      const data = this.loadData(reader.result);
      this.filteredOriginData = [];
      loadDataIndex = data.findIndex(list => list.includes('Locus'));

      /**
       * IR 파일이 아닐경우 에러메세지 보냄.
       */
      if (!data[loadDataIndex].includes('Locus')) {

        alert('IR 파일명이 맞는지 확인해 주세요.\n ' + file.name);
        this.onWrongFile.emit(null);
        // 파일 취소후 초기화
        this.uploadfileList = [];
        this.upload.files = [];
        this.uploadfile.nativeElement.value = '';
        this.filteredOriginData = [];
        this.prelevalentMutation = [];
        this.clinically = [];
        this.clinical = [];
        this.prevalent = [];
        return false;

      }
      // console.log('==== [412][filteredOriginData] ', this.filteredOriginData);
      // 기본자료 수집
      data.forEach((list, index) => {
        if (index === loadDataIndex) {
          this.fields = list;
        }
        if (index >= loadDataIndex + 1) {
          // console.log('==== [532][UPLOAD][filteredOriginData] ', list);
          // 2021-10-30 % Frequency ==> Allele Frequency % 로 변경
          const existFrequency = this.findGenePostion('Allele Frequency %');
          if (existFrequency !== -1) {
            this.filteredOriginData.push({
              locus: list[this.findGenePostion('Locus')].trim(),
              readcount: list[this.findGenePostion('Read Counts')].trim(),
              OncomineVariant: list[this.findGenePostion('Oncomine Variant Class')].trim(),
              oncomine: list[this.findGenePostion('Oncomine Gene Class')].trim(),
              type: list[this.findGenePostion('Type')].trim(),
              gene: list[this.findGenePostion('Genes (Exons)')].trim(),
              aminoAcidChange: list[this.findGenePostion('Amino Acid Change')].trim(),
              coding: list[this.findGenePostion('Coding')].trim(),
              frequency: list[this.findGenePostion('Allele Frequency %')].trim(),
              comsmicID: list[this.findGenePostion('Variant ID')].trim(),
              cytoband: list[this.findGenePostion('CytoBand')].trim(),
              variantID: list[this.findGenePostion('Variant ID')].trim(),
              variantName: list[this.findGenePostion('Variant Name')].trim(),
              pathologyNum: this.pathologyNum,
              transcript: ''
              /*
              locus: list[0].trim(),
              readcount: list[21].trim(),
              OncomineVariant: list[12].trim(),
              oncomine: list[13].trim(),
              type: list[5].trim(),
              gene: list[9].trim(),
              aminoAcidChange: list[20].trim(),
              coding: list[35].trim(),
              frequency: list[19].trim(),
              comsmicID: list[30].trim(),
              cytoband: list[15].trim(),
              variantID: list[17].trim(),
              variantName: list[18].trim(),
              pathologyNum: this.pathologyNum,
              */
            });
          } else {
            this.filteredOriginData.push({
              locus: list[this.findGenePostion('Locus')].trim(),
              readcount: list[this.findGenePostion('Read Counts')].trim(),
              OncomineVariant: list[this.findGenePostion('Oncomine Variant Class')].trim(),
              oncomine: list[this.findGenePostion('Oncomine Gene Class')].trim(),
              type: list[this.findGenePostion('Type')].trim(),
              gene: list[this.findGenePostion('Genes (Exons)')].trim(),
              aminoAcidChange: list[this.findGenePostion('Amino Acid Change')].trim(),
              coding: list[this.findGenePostion('Coding')].trim(),
              frequency: list[this.findGenePostion('% Frequency')].trim(),
              comsmicID: list[this.findGenePostion('Variant ID')].trim(),
              cytoband: list[this.findGenePostion('CytoBand')].trim(),
              variantID: list[this.findGenePostion('Variant ID')].trim(),
              variantName: list[this.findGenePostion('Variant Name')].trim(),
              pathologyNum: this.pathologyNum,
              transcript: ''
            });

          }

          // console.log('==== [313][upload][filteredOriginData] ', this.filteredOriginData);
        }

      });
      // console.log('==== [465][upload][유전자 데이터 중복검색][filteredOriginData]  ===== \n ', this.filteredOriginData);
      this.pathologyService.setFilteredTSV(this.filteredOriginData);
      data.forEach(item => {
        const checkshap = item.toString().indexOf('#');
        if (checkshap !== -1) {
          lists.push(item[0]);
        }
      });
      // console.log('==== [461][upload][OR 유전자 데이터] ', lists);
      lists.forEach(list => {
        const msiList = list.split('##')[1].split('=');
        if (msiList[0] === 'MSI Status') {
          this.msiUnit = msiList[1];
        }
        if (msiList[0] === 'MSI Score') {
          this.msiScore = msiList[1];
          // this.pathologyService.setMSIScore(this.msiScore, this.pathologyNum);
          this.status$.next('msi');
        }
      });
      this.pathologyService.setMSIScore(this.msiScore + '(' + this.msiUnit + ')', this.pathologyNum);

      // console.log('[320][upload][msiScore]', this.msiScore);
    };

    reader.readAsText(file);

  }

  parse_tsv(s, f): void {
    s = s.replace(/,/g, ';');
    let ixEnd = 0;
    for (let ix = 0; ix < s.length; ix = ixEnd + 1) {
      ixEnd = s.indexOf('\n', ix);
      if (ixEnd === -1) {
        ixEnd = s.length;
      }
      const row = s.substring(ix, ixEnd).split('\t');
      f(row);
    }
  }

  // tslint:disable-next-line: typedef
  loadData(file: ArrayBuffer | string) {

    let rowCount = 0;
    const scenarios = [];
    this.parse_tsv(file, (row) => {
      rowCount++;
      if (rowCount >= 0) {
        scenarios.push(row);
      }
    });
    // console.log('=================\n, scenarios', scenarios);
    // console.log('===================\n');
    return scenarios;
  }

  // 갯수확인
  checkListNum(genes: string): number {
    // console.log('[585][genes[ ==> ', genes);
    // const re = /[\[\]=]/gi;  // BAP1 p.([V409=;Q410*]) c.1227_1228delGCinsTT 경우
    // // let tempfre  = [];
    // if (re.test(genes)) {
    //   const tempLen = genes.split(';');
    //   if (tempLen.length === 1) {
    //     return 1;
    //   }
    //   return tempLen.length;
    // }
    // 구분자를 ; ==> , 변경
    const num = genes.split(',');
    return num.length;
  }

  /*
             locus : Locus
             readcount : Read Counts
             OncomineVariant : Oncomine Variant Class
             oncomine : Oncomine Gene Class
             type  : Type
             gene : Genes (Exons), Genes
             aminoAcidChange : Amino Acid Chang
             coding  : Coding
             frequency : % Frequency
             comsmicID : Variant ID
             cytoband : CytoBand
             variantID : Variant ID
             variantName : Variant Name
             pathologyNum
  *///
  // 유전자의 위치 찿음
  findGenePostion(item: string): number {
    return this.fields.findIndex(field => field === item);
  }


}
