import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Subject } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { FileUploadService } from 'src/app/home/services/file-upload.service';
import { RearchStorePathService } from '../mainpa_services/store.path.service';
import { IFilteredOriginData, IGENO } from '../models/patients';
import { UploadResponse } from '../models/uploadfile';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { IGeneTire } from './../models/patients';

// 25.08.05 파일 유형추가
import { environment } from '../../../environments/environment';


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
  percentage: string;
  mapd: string;
  TotalMappedFusionPanelReads: string;
  status$ = new Subject();
  
  status = [];
  filteredOriginData: IFilteredOriginData[] = [];
  prelevalentMutation = [];
  clinically = [];
  
  //25.08.06 aminoAcidChange 추가
  //clinically2: { gene: string, seq: string, tier: string, frequency: string }[] = [];
  clinically2: { gene: string, seq: string, tier: string, frequency: string, aminoAcidChange? : string }[] = [];
  clinical: IGeneTire[] = [];
  prevalent = [];
  prevalent2: { gene: string, seq: string }[] = [];
  uploadfileList: string[] = [];

  tumorType: string;
  burden: string;

  fields: string[] = [];
  geno: IGENO[] = [];

  // 25.08.05 파일 유형추가
  instcd =  environment.instcd;
  vincent = '017';
  incheon = '016';

  constructor(
    // private fileUploadService: PathologyService,
    private pathologyService: PathologyService,
    private uploadfileService: FileUploadService,
    private store: StorePathService,
    private researchStore: RearchStorePathService,
    private router: Router,
    private route: ActivatedRoute,

  ) { }

  // 25.08.06 amino acid change 함수 추가
  private oneToThreeLetterMap: { [key: string]: string } = {
    A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp',
    C: 'Cys', Q: 'Gln', E: 'Glu', G: 'Gly',
    H: 'His', I: 'Ile', L: 'Leu', K: 'Lys',
    M: 'Met', F: 'Phe', P: 'Pro', S: 'Ser',
    T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val',
    '*': 'Ter'
  };

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

    console.log('[130][화일선택]', event.target.fileList);
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    // console.log(files);
    if (event.target.files.length > 0) {
      const filename = event.target.files[0].name;
      const file = event.target.files[0];

      console.log('[fileupload][병리 파일명][96]', filename);
      if (filename === 'Statistic.txt') {
        // this.Statistic(file);
      } else {
        const diseaseFilename = filename.split('_');
        this.diseaseNumber = diseaseFilename[0];
        console.log('[fileupload][병리 파일분류][159]', diseaseFilename);
        // this.pathologyNum = this.pathologyService.getPathologyNum();

        if (this.research === 'research') {
          this.pathologyNum = this.researchStore.getPathologyNo();
        } else {
          this.pathologyNum = this.store.getPathologyNo();
        }

        // console.log('[162][pathologyNum]', this.pathologyNum);
        this.type = this.pathologyService.getType();

        // 25.08.05 파일 유형추가
        //if (diseaseFilename.includes('RNA') || diseaseFilename.includes('Non-Filtered')) {
        if (diseaseFilename.includes('Non-Filtered')) {
          console.log('[215]', 'Non-Filtered');
          this.nonefilter(file);
        } else if (diseaseFilename.includes('All') || diseaseFilename.includes('All (1)') || diseaseFilename.includes('OR.tsv')) {
          console.log('[219]', 'OR');
          this.fileType = 'OR';
          this.allOR(file);
        // 25.08.05 파일 유형추가
        } else if (diseaseFilename.includes('RNA') ) {
          console.log('[224]', 'IR-RNA');
          this.fileType = 'IR2';
          this.donefilter(file);
        } else {
          console.log('[228]', 'IR');
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

        // 25.08.05 파일 유형추가
        //if (diseaseFilename.includes('RNA') || diseaseFilename.includes('Non-Filtered')) {
          if (diseaseFilename.includes('Non-Filtered')) {
            console.log('[215]', 'Non-Filtered');
            this.nonefilter(file);
          } else if (diseaseFilename.includes('All') || diseaseFilename.includes('All (1)') || diseaseFilename.includes('OR.tsv')) {
            console.log('[219]', 'OR');
            this.fileType = 'OR';
            this.allOR(file);
          // 25.08.05 파일 유형추가
          } else if (diseaseFilename.includes('RNA') ) {
            console.log('[224]', 'IR-RNA');
            this.fileType = 'IR2';
            this.donefilter(file);
          } else {
            console.log('[228]', 'IR');
            this.fileType = 'IR';
            this.donefilter(file);
          }
      }

      this.onDroppedFile(files);
    }

  }

  // 25.08.06 amino acid change 함수 추가
  // 25.08.26 받는 문자열 정규화 처리 추가
  convertAminoacid(change: string | null | undefined): string {
    
    // 25.08.26 받는 문자열 (change)가 undefined, null, 빈 문자열이면 그대로 반환
    if (!change) return change || '';

    const match = change.match(/^([A-Z*])(\d+)([A-Z*])$/);
    console.log('[333]match=', match);
    if (!match) return change;
  
    const [, from, pos, to] = match;
    const from3 = this.oneToThreeLetterMap[from] || from;
    const to3 = this.oneToThreeLetterMap[to] || to;
  
    return `p.${from3}${pos}${to3}`;
  }

   /** 25.08.29
   * 문자열을 특정 규칙으로 분리
   * "a [a=;b]; c d" => ["a [a=;b]", "c d"]
   * 규칙:
   * 1. [] 안의 내용은 보호
   * 2. [] 밖의 ; 로만 분리
   * 3. 공백 제거
   */
  splitStringWithBrackets(input:string , separator: string = ';') : string[] {
    const result = [];
    let buffer = '';
    let isInsideBracket = false;

    for (const char of input) {
      if (char === '[') {
        isInsideBracket = true;
        buffer += char;
      } else if (char === ']') {
        isInsideBracket = false;
        buffer += char;
      } else if (char === separator && !isInsideBracket) {
        pushBuffer();
      } else {
        buffer += char;
      }
    }

    pushBuffer(); // 마지막 남은 버퍼 처리

    function pushBuffer() {
      const trimmed = buffer.trim();
      if (trimmed) result.push(trimmed);
      buffer = '';
    }

    return result;
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
      let tierExist = false;
      let mutExist = false;

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

      let existGenes = -1; // 0
      let existTier = -1;  // 2
      let existFrequency = -1; // 3  
      let existTrans = -1; // 4   
      let existRatio = -1; // 5   
      let existThisTyoe = -1;  // 6
      let existOtherType = -1; // 7
      let existTrial = -1;  // 8
      
      const data2 = data.splice(idxNo, 1);
      //console.log('[394][data2] ===> ', data2);
      console.log('[336][Tumor 존재여부] ===> ', this.burden);
      data.filter(list => list[0] !== 'Public data sources included in relevant therapies')
        .forEach((list, index) => {
          
          //console.log('[343][list] ===> ', list);
        
          if (list[0].length > 0) {

            if (list[0].trim() === 'Sample Cancer Type') {
              this.tumorType = list[1].trim();
            }

            // 25.08.05
            //if (list[0] === 'Genomic Alteration' && (list[1] === 'Gene Name')) {
            if (list[0] === 'Genomic Alteration' && 
                    (list[1] === 'Gene Name' || list[1] === 'Classification' || list[1] === 'Tier')
            ) {
              
              if (count > 0) {
                status = false;
              } else {

                this.fields = list;

                existFrequency = this.findGenePostion('Allele Frequency');
                existGenes = this.findGenePostion('Genomic Alteration');
                existTier = this.findGenePostion('Tier');
                existTrial = this.findGenePostion('Clinical Trials');  // 8
                existThisTyoe = this.findGenePostion('Relevant Therapies In this cancer type');  // 6
                existOtherType = this.findGenePostion('Relevant Therapies In other cancer type'); // 7
                existTrans = this.findGenePostion('Transcript'); // 4
                existRatio = this.findGenePostion('Mut/WT Ratio'); // 5
  
                console.log('[424] gene ', existFrequency, existGenes, existTier, 
                                              existTrial, existThisTyoe, existOtherType, existTrans);
              
                status = true;
                start = index + 1;    
              }
              count++;
            }
           // console.log('[359] ==> ', list [0], status);
            // 있는 파일도 있고, 없는 파일도 있음
            const temp1 = list[0].split('(');
            
            // 25.05.23 list가 3 이상인 경우 true로 변경
            if (list.length > 2) {
              if (temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1] && list[1].length === 0) {
                status = true;
              }
              
              //console.log('[397][TierExist] ==> ', list[2].toLowerCase());
              //console.log('[397][TierExist] ==> ', list[1].toLowerCase());
              
              // 25.08.05
              //if (list[2] === 'tier') {
              if (existTier) {
                tierExist = true;
              } else {
                tierExist = false;
              }
              
              // 25.08.05
              //if (list[4] === 'Mut/WT Ratio') {
              if (existRatio) {
                mutExist = true;
              } 
              
              //console.log('[375][TierExist] ==> ', list[2], list[5], list[6], list[7], tierExist, mutExist, status);
              if (!tierExist && !mutExist) {

                // 25.08.05
                //if (list[4] === undefined || list[4].length === 0) {
                if (existTrans === -1 ) {
                  status = false;
                }
              } else if (tierExist && mutExist) {
                // 25.08.05
                //if (list[6] === undefined || list[6].length === 0) {
                if (existTrial === -1 ) {
                  status = false;
                }
              } else if (!tierExist && mutExist) {
                // 25.08.05
                //if (list[6] === undefined || list[6].length === 0) {
                if (existTrial === -1 ) {
                  status = false;
                }
              } else if (tierExist && !mutExist) {
                // 25.08.05
                //if (list[6] === undefined || list[6].length === 0) {
                if (existTrial === -1 ) {
                  status = false;
                }
              }
              
              let trial2 = '';  // 8
              if (existTrial !== -1) {
                trial2 = list[existTrial];
              }

              // 25.08.05 trial이 없으면 멈춘다
              if (trial2 === '')
              {
                status = false;
              }
            }
            else {
              status = false;
            }
            // 25.05.23 list가 3이상인 경우 true로 변경
         
            // console.log('[390] ==> ', list[5], list[6]);
            //console.log('[391] =====>', index, start, status, list);

            if (index >= start && status && temp1[0].trim() !== 'Tumor Mutational Burden') {
              
              console.log('[391] =====>', index, start, status, list);

              // 25.08.05
              //const len = this.checkListNum(list[0]); //유전자수 
              let len = 0; //유전자수
              let gene = ''; //유전자
              let frequency = '';      
              let tier2 = ''; // 2
              let trans = ''; // 4 
              let ratio = ''; // 5  
              let thisTyoe = '';  // 6
              let otherType = ''; // 7
              let trial = '';  // 8

              if (existGenes !== -1) {
                len = this.checkListNum(list[existGenes]); //유전자수
                gene = list[existGenes];
              }

              if (existFrequency !== -1) {
                frequency = list[existFrequency];
              }

              if (existTier !== -1) {
                tier2 = list[existTier];
              }

              if (existTrial !== -1) {
                trial = list[existTrial];
              }

              if (existTrans !== -1) {
                trans = list[existTrans];
              }

              if (existRatio !== -1) {
                ratio = list[existRatio];
              }

              if (existThisTyoe !== -1) {
                thisTyoe = list[existThisTyoe];
              }

              if (existOtherType !== -1) {
                otherType = list[existOtherType];
              }

              if (len > 0) {

                //console.log('[391] =====>', len, gene);

                /* 25.08.05
                if (!tierExist && !mutExist) {
                  this.geno.push({ gene: list[0], relevant1: list[4], relevant2: list[5], trial: list[6] });
                } else if (!tierExist && mutExist) {
                  this.geno.push({ gene: list[0], relevant1: list[6], relevant2: list[7], trial: '' });
                } else if (tierExist && mutExist) {
                  this.geno.push({ gene: list[0], relevant1: list[4], relevant2: list[5], trial: '' });
                }
                */
                if (!tierExist && !mutExist) {
                  this.geno.push({ gene: gene, relevant1: trans, relevant2: otherType, trial: trial });
                } else if (!tierExist && mutExist) {
                  this.geno.push({ gene: gene, relevant1: ratio, relevant2: thisTyoe, trial: '' });
                } else if (tierExist && mutExist) {
                  this.geno.push({ gene: gene, relevant1: trans, relevant2: otherType, trial: '' });
                }

                //console.log('[402][GENO]', list, this.geno, len, count);

                console.log('[402][GENO]', list, len, count);
                if (len === 1) {
                  //const filteredlist = list[0].trim().split(' ');
                  const filteredlist = gene.trim().split(' ');
                  
                  let tier = '';
                  
                  // 25.08.05
                  //if (list[2].length > 0) tierExist = true;
                  //if (tierExist) {                
                  //  tier = list[2].substring(0, list[2].length - 1);                                   
                  if (tier2 !== '') { 
                    //  console.group('[406] ===>',tierExist, list);                  
                    tier = tier2.substring(0, tier2.length - 1);
                  }

                  // filteredlist 길이
                  const filteredlistLen = filteredlist.length;

                  console.log('[418] ===>', filteredlist);

                  // 25.08.05
                  //if (filteredlistLen >= 2 && list[0].length) {  //
                  if (filteredlistLen >= 2 && gene.length) {  //
                  //    if (filteredlist[1] !== 'deletion' && filteredlist[1] !== 'stable') { 2022.06.01 수정
                    if (  filteredlist[1] !== 'stable') {

                      // 25.08.-06 aminoAcidChange 추가
                      //this.clinical.push({ gene: filteredlist[0], tier, frequency: list[3] });  // 티어
                    
                      //this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString(), tier, frequency: list[3]}); // 신규
                    
                      this.clinical.push({ gene: filteredlist[0], tier, frequency: frequency, 
                                            aminoAcidChange: this.convertAminoacid (filteredlist[1] ) });  // 티어
                    
                      this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString(), tier, frequency: frequency, 
                                                aminoAcidChange: this.convertAminoacid (filteredlist[1]) }); // 신규
                    
                      clinicallyCount++;
                      list[0] = '';
                      console.log('[420] ===>', this.clinical, this.clinically, this.clinically2);
                    }

                    // 25.08.05
                    //if (filteredlist.includes('exon') && filteredlist[1] === 'exon' && list[0].length) {
                    if (filteredlist.includes('exon') && filteredlist[1] === 'exon' && gene.length) {

                      // 25.08.05
                      ///this.clinically.push(list[0]);
                      this.clinically.push(list[0]);

                      // 25.08.-06 aminoAcidChange 추가
                      //this.clinical.push({ gene: filteredlist[0].trim(), tier, frequency: list[3] });
                      //this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString(), tier,frequency: list[3]   }); // 신규
                      this.clinical.push({ gene: filteredlist[0].trim(), tier, frequency: frequency, 
                                            aminoAcidChange: this.convertAminoacid (filteredlist[1])  });
                      
                      // 25.08.05
                      //this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString(), tier,frequency: list[3], 
                      this.clinically2.push({ gene: gene.trim(), seq: clinicallyCount.toString(), tier,frequency: frequency, 
                                              aminoAcidChange: this.convertAminoacid (filteredlist[1])    }); // 신규
                      
                      clinicallyCount++;
                      list[0] = '';

                      console.log('[451] ===>', this.clinical, this.clinically, this.clinically2);
                    }

                  } else if (filteredlistLen === 4) {
                    if (filteredlist.includes('exon')) {

                      // 25.08.05
                      //this.clinically.push(list[0]);
                      this.clinically.push(gene);
                      
                      // 25.08.-06 aminoAcidChange 추가
                      //this.clinical.push({ gene: filteredlist[0].trim(), tier, frequency: list[3] });
                      //this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString(), tier, frequency: list[3] }); // 신규
                      this.clinical.push({ gene: filteredlist[0].trim(), tier, frequency: frequency, 
                                            aminoAcidChange: this.convertAminoacid (filteredlist[1] ) });
                      
                      // 25.08.05
                      //this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString(), tier, frequency: list[3], 
                      this.clinically2.push({ gene: list[0].trim(), seq: clinicallyCount.toString(), tier, frequency: frequency, 
                                            aminoAcidChange: this.convertAminoacid (filteredlist[1])  }); // 신규
                      
                      clinicallyCount++;
                      list[0] = '';

                    }
                  }

                } else if (len > 1) {
                  //  구분자를 ; ==> , 변경 21.5.7
                  //  구분자를 . ==> ; 변경 25.8.6
                  
                  //const tempGene = list[0].split(',');
                  //const tempfre = list[3].split('(')[0].split(',');

                  // 25.08.29 [;] [=;] split 하지 않는다
                  //const tempGene = gene.split(';');
                  const tempGene = this.splitStringWithBrackets (gene, ';');
                  let tempfre = [' ', ' '];

                  if (frequency !== '') {
                    // 25.08.29 frequency 가 1개일 경우 막음
                    //tempfre = frequency.split('(')[0].split(';');
                    
                    let [first = '', second = ''] = frequency.split('(')[0].split(';');
                    tempfre = [first, second];
                  }
                  
                  console.log('==== [346][네번째][tempGene]', list, tempfre, tempGene );
                  // 25.08.05 for bug
                  //for (let i = 0; i < tempGene.length - 1; i++) {
                  for (let i = 0; i < tempGene.length ; i++) {

                    console.log('==== [346][네번째][tempGene]', i, tempGene[i], tempfre[i]);
                  
                    // 25.08.05
                    //const onetier = list[2].substring(0, list[2].length - 1);
                    let onetier = '';
                    if (tier2 !== '') {
                      onetier = tier2.substring(0, tier2.length - 1);
                    }
                    const tempfilteredlist = tempGene[i].trim().split(' ');

                  // if (tempfilteredlist[1] !== 'deletion') {
                    this.clinically.push(tempGene[i].trim());
                    
                    // 25.08.-06 aminoAcidChange 추가
                    //this.clinical.push({ gene: tempfilteredlist[0], tier: onetier, frequency: tempfre[i].trim() }); // 원본 tempfre[i].trim()
                    //this.clinically2.push({ gene: tempGene[i].trim(), seq: clinicallyCount.toString(), tier: onetier, frequency: list[3] }); // 신규
                    this.clinical.push({ gene: tempfilteredlist[0], tier: onetier, frequency: tempfre[i].trim(), 
                                            aminoAcidChange: this.convertAminoacid (tempfilteredlist[1] ) }); // 원본 tempfre[i].trim()
                    this.clinically2.push({ gene: tempfilteredlist[0], seq: clinicallyCount.toString(), tier: onetier, frequency: list[3], 
                                            aminoAcidChange: this.convertAminoacid (tempfilteredlist[1] ) }); // 신규
                    
                    clinicallyCount++;
                  // }
                  } // End of for loop
                }
              } else {
                console.log('[451] ===>', list);
              }

            }  // End of Clinically if

            if (count === 2) { }

            if (list[0].trim() === 'Prevalent cancer biomarkers without relevant evidence based on included data sources') {
              status = false; // 2022.11.25 수정
              nextline = index + 1;
            }

            if (nextline === index) {
              // this.prevalent = list[0].replace(/&gt;/g, '>').split(';').filter(item => {
              //   const member = item.trim().split(' ');
              //   return member[1] !== 'deletion';
              // });  // 2022.06.01  수정
              //console.log(' ######[501][prevelant] list[0]=', list[0]);
         
              this.prevalent = list[0].replace(/&gt;/g, '>').split(';'); // 2022.06.01  수정            
              this.prevalent.forEach((item, idx) => {
                this.prevalent2.push({ gene: item.replace(/"/g, '').trim(), seq: idx.toString() });
              });

            }
          }
        });  // End of ForEach


      // this.pathologyService.setClinically(this.clinically, this.pathologyNum)
      this.pathologyService.setClinically2(this.clinically2, this.pathologyNum)
        .pipe(
          concatMap(() => this.pathologyService.setTumortype(this.tumorType, this.pathologyNum)),
          concatMap(() => this.pathologyService.setPrevalent2(this.prevalent2, this.pathologyNum)),
          concatMap(() => this.pathologyService.setTumorMutationalBurden(this.burden, this.pathologyNum)),
          concatMap(() => this.pathologyService.setClinical(this.clinical, this.pathologyNum)),
          concatMap(() => this.pathologyService.setGenomic(this.geno, this.pathologyNum))
        ).subscribe(result => {

          this.clinically = [];
          this.tumorType = '';
          this.clinical = [];
          this.prevalent = [];
          this.burden = '';
          this.clinically2 = [];
          this.prevalent2 = [];
          this.geno = [];
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
      console.log('==== [495][nonfilter]', lists);
      lists.forEach(list => {
        const msiList = list.split('##')[1].split('=');
        console.log('==== [488][nonfilter]', msiList);
        if (msiList[0] === 'sampleDiseaseType') {
          this.type = msiList[1].replace(/(\r\n|\r)/gm, '');
          this.pathologyService.setTumortype(this.type, this.pathologyNum);
          this.status$.next('type');
        } else if (msiList[0] === 'CellularityAsAFractionBetween0-1') {
          this.percentage = (parseFloat(msiList[1]) * 100).toFixed(0);
          this.status$.next('percentage');
        } else if (msiList[0] === 'mapd') {
          this.mapd = msiList[1];
        } else if (msiList[0] === 'TotalMappedFusionPanelReads') {
          this.TotalMappedFusionPanelReads = msiList[1];
        }
      });
      // console.log('[504] ', this.percentage, this.mapd, this.TotalMappedFusionPanelReads);
      this.pathologyService.setTumorCellPercentage(this.percentage.toString(), this.pathologyNum ); // 퍼센트
      // mapd,TotalMappedFusionPanelReads 를 statecontrol 에 등록
      this.pathologyService.setMapd(this.pathologyNum, this.mapd , this.TotalMappedFusionPanelReads);
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

          // 2021-10-30 % Frequency ==> Allele Frequency % 로 변경
          const existFrequency = this.findGenePostion('Allele Frequency %');
          // 25.08.05 파일 유형 추가
          const existGenes = this.findGenePostion('Genes');
          // 25.08.05 파일 유형 추가
          const existAmino = this.findGenePostion('Amino Acid Change');

          //console.log('==== [615][filteredOriginData] ', list, index);
          // 25.07.29
          // ir 파일에는  'Genes' 'Genes (Exons)' 필드가 존재한다
          // 현재 'Genes (Exons)' 로 gene를 검색한다.

          console.log('[DEBUG] gene ', existFrequency, existGenes, existAmino);

          // 25.08.05 파일 유형 추가
          if (existGenes !== -1) {
            
            if (existFrequency !== -1) {

              this.filteredOriginData.push({
                locus: list[this.findGenePostion('Locus')]?.trim() || '',
                readcount: list[this.findGenePostion('Read Counts')]?.trim() || '',
                OncomineVariant: list[this.findGenePostion('Oncomine Variant Class')]?.trim() || '',
                oncomine: list[this.findGenePostion('Oncomine Gene Class')]?.trim() || '',
                type: list[this.findGenePostion('Type')]?.trim() || '',

                // 25.08.05
                gene: (() => {
                  const fieldName = [this.vincent, this.incheon].includes(this.instcd)  ? 'Genes' : 'Genes (Exons)';
                  const idx = this.findGenePostion(fieldName);
                  const value = list[idx];

                  // 🔍 디버깅 로그
                  console.log(`[DEBUG] gene fieldName: ${fieldName}, index: ${idx}, value:`, value);

                  return value?.trim() || '';
                })(),
                aminoAcidChange: list[this.findGenePostion('Amino Acid Change')]?.trim() || '',
                coding: list[this.findGenePostion('Coding')]?.trim() || '',
                frequency: list[this.findGenePostion('Allele Frequency %')]?.trim() || '',
                comsmicID: list[this.findGenePostion('Variant ID')]?.trim() || '',
                cytoband: list[this.findGenePostion('CytoBand')]?.trim() || '',
                variantID: list[this.findGenePostion('Variant ID')]?.trim() || '',
                variantName: list[this.findGenePostion('Variant Name')]?.trim() || '',
                pathologyNum: this.pathologyNum,
                transcript: list[this.findGenePostion('Transcript')]?.trim() || '',
              
                /*

                */
              });
              // 🔍 디버깅 로그
              console.log(`[687] Type value:`, list[this.findGenePostion('Type')]?.trim() || '');
            } else {
              this.filteredOriginData.push({
                locus: list[this.findGenePostion('Locus')].trim(),
                readcount: list[this.findGenePostion('Read Counts')].trim(),
                OncomineVariant: list[this.findGenePostion('Oncomine Variant Class')].trim(),
                oncomine: list[this.findGenePostion('Oncomine Gene Class')].trim(),
                type: list[this.findGenePostion('Type')].trim(),
                gene: [this.vincent, this.incheon].includes(this.instcd) ?  list[this.findGenePostion('Genes')].trim() : list[this.findGenePostion('Genes (Exons)')].trim(),
                aminoAcidChange: list[this.findGenePostion('Amino Acid Change')].trim(),
                coding: list[this.findGenePostion('Coding')].trim(),
                frequency: list[this.findGenePostion('% Frequency')].trim(),
                comsmicID: list[this.findGenePostion('Variant ID')].trim(),
                cytoband: list[this.findGenePostion('CytoBand')].trim(),
                variantID: list[this.findGenePostion('Variant ID')].trim(),
                variantName: list[this.findGenePostion('Variant Name')].trim(),
                pathologyNum: this.pathologyNum,
                transcript: list[this.findGenePostion('Transcript')].trim()
              });

              
              // 🔍 디버깅 로그
              console.log(`[808] Type value:`, list[this.findGenePostion('Type')]?.trim() || '');
            } 
          } else {

            // 25.08.05 파일 유형 추가
            if (existAmino !== -1) {

              if (existFrequency !== -1) {

                this.filteredOriginData.push({
                  locus: list[this.findGenePostion('Locus')]?.trim() || '',
                  readcount: list[this.findGenePostion('Read Counts')]?.trim() || '',
                  OncomineVariant: list[this.findGenePostion('Oncomine Variant Class')]?.trim() || '',
                  oncomine: list[this.findGenePostion('Oncomine Gene Class')]?.trim() || '',
                  type: list[this.findGenePostion('Type')]?.trim() || '',
  
                  // 25.08.05
                  gene: (() => {
                    const fieldName = [this.vincent, this.incheon].includes(this.instcd)  ? 'Genes' : 'Genes (Exons)';
                    const idx = this.findGenePostion(fieldName);
                    const value = list[idx];
  
                    // 🔍 디버깅 로그
                    console.log(`[DEBUG] gene fieldName: ${fieldName}, index: ${idx}, value:`, value);
  
                    return value?.trim() || '';
                  })(),
                  aminoAcidChange: list[this.findGenePostion('Amino Acid Change')]?.trim() || '',
                  coding: list[this.findGenePostion('Coding')]?.trim() || '',
                  frequency: list[this.findGenePostion('Allele Frequency %')]?.trim() || '',
                  comsmicID: list[this.findGenePostion('Variant ID')]?.trim() || '',
                  cytoband: list[this.findGenePostion('CytoBand')]?.trim() || '',
                  variantID: list[this.findGenePostion('Variant ID')]?.trim() || '',
                  variantName: list[this.findGenePostion('Variant Name')]?.trim() || '',
                  pathologyNum: this.pathologyNum,
                  transcript: list[this.findGenePostion('Transcript')]?.trim() || '',
                
                  /*
  
                  */
                });
                // 🔍 디버깅 로그
                console.log(`[687] Type value:`, list[this.findGenePostion('Type')]?.trim() || '');
              } else {
                this.filteredOriginData.push({
                  locus: list[this.findGenePostion('Locus')].trim(),
                  readcount: list[this.findGenePostion('Read Counts')].trim(),
                  OncomineVariant: list[this.findGenePostion('Oncomine Variant Class')].trim(),
                  oncomine: list[this.findGenePostion('Oncomine Gene Class')].trim(),
                  type: list[this.findGenePostion('Type')].trim(),
                  gene: [this.vincent, this.incheon].includes(this.instcd) ?  list[this.findGenePostion('Genes')].trim() : list[this.findGenePostion('Genes (Exons)')].trim(),
                  aminoAcidChange: list[this.findGenePostion('Amino Acid Change')].trim(),
                  coding: list[this.findGenePostion('Coding')].trim(),
                  frequency: list[this.findGenePostion('% Frequency')].trim(),
                  comsmicID: list[this.findGenePostion('Variant ID')].trim(),
                  cytoband: list[this.findGenePostion('CytoBand')].trim(),
                  variantID: list[this.findGenePostion('Variant ID')].trim(),
                  variantName: list[this.findGenePostion('Variant Name')].trim(),
                  pathologyNum: this.pathologyNum,
                  transcript: list[this.findGenePostion('Transcript')].trim()
                });
              }
            } else {

              this.filteredOriginData.push({
                locus: list[this.findGenePostion('Locus')].trim(),
                readcount: list[this.findGenePostion('Read Counts')].trim(),
                OncomineVariant: list[this.findGenePostion('Oncomine Variant Class')].trim(),
                oncomine: list[this.findGenePostion('Oncomine Gene Class')].trim(),
                type: list[this.findGenePostion('Type')].trim(),
                gene: list[this.findGenePostion('Genes (Exons)')].trim(),
                aminoAcidChange: '',
                coding: '',
                frequency: '',
                comsmicID: list[this.findGenePostion('Variant ID')].trim(),
                cytoband: '',
                variantID: list[this.findGenePostion('Variant ID')].trim(),
                variantName: '',
                pathologyNum: this.pathologyNum,
                transcript: ''
              });
            }
        }


          //}

        }

      });

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

          this.status$.next('msi');
        }
      });
      this.pathologyService.setMSIScore(this.msiScore + '(' + this.msiUnit + ')', this.pathologyNum);


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

    return scenarios;
  }

  // 갯수확인
  checkListNum(genes: string): number {

    // 구분자를 ; ==> , 변경
    //console.log('[834] =====>', genes,  );
            
    // 25.08.06 구분자를 , ==> , 변경
    //const num = genes.split(',');

    // 25.08.29 [;] [=;] split 하지 않는다
    //const num = genes.split(';');
    const num = this.splitStringWithBrackets (genes, ';');

    //console.log('[834] =====>', num,  num.length );

    return num.length;
  }

  /*

  *///
  // 유전자의 위치 찿음
  findGenePostion(item: string): number {
    return this.fields.findIndex(field => field === item);
  }


}
