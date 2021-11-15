import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, from, Observable, of } from 'rxjs';

import {
  IComment, IDList, IExcelData, IFilteredTSV, IGeneCoding,
  IGeneList,
  IPatient, IProfile, IRecoverVariants
} from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IAFormVariant } from 'src/app/home/models/patients';
import { shareReplay, switchMap, tap, concatMap, map, filter, last } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { GENERAL, makeBForm, METHODS, METHODS516 } from 'src/app/home/models/bTypemodel';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { StoreService } from 'src/app/forms/store.current';
import { ExcelService } from 'src/app/home/services/excelservice';

import { MatDialog } from '@angular/material/dialog';
import { makeAForm } from 'src/app/home/models/aTypemodel';
import { UtilsService } from 'src/app/forms/commons/utils.service';
import { CommentsService } from 'src/app/services/comments.service';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AnalysisService } from 'src/app/forms/commons/analysis.service';
import { ClrCommonFormsModule } from '@clr/angular';
import { ExcelAddListService } from 'src/app/home/services/excelAddList';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResearchService } from 'src/app/home/services/research.service';



@Component({
  selector: 'app-all-dialog',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class ALLComponent implements OnInit, OnDestroy {


  @ViewChild('examine', { static: true }) examine: ElementRef;
  @ViewChild('rechecked', { static: true }) rechecked: ElementRef;

  requestDate: string; // 검사의뢰일
  form2TestedId: string;
  filteredTSV$: Observable<IFilteredTSV[]>;

  tsvLists: IFilteredTSV[] = [];
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
  geneCoding: IGeneCoding[];
  detactedVariants: IAFormVariant[] = [];
  recoverVariants: IRecoverVariants[] = [];
  checkboxStatus = []; // 체크박스 on 인것
  ngsData = [];
  private subs = new SubSink();

  resultStatus = 'Detected';
  fusion = '';
  flt3itd = '';
  chronmosomal = '';
  methods = METHODS;
  methods516 = METHODS516;
  general = GENERAL;
  indexNum = 0;
  selectedItem = 'mutation';
  tsvInfo: IFilteredTSV;
  profile: IProfile = { leukemia: '', flt3itd: '', chron: '' };
  // tslint:disable-next-line:variable-name
  variant_id: string;
  tempid: string;
  ment = '';

  mockData: IAFormVariant[] = [];

  tablerowForm: FormGroup;
  // singleCommentForm: FormGroup;
  control: FormArray;
  listForm: FormGroup;

  lists: IDList[];

  spcno = '';
  pid = '';
  examcd = '';
  userid = '';
  rsltdesc = '';
  screenstatus: string;
  specimenMsg: string;
  specimenMessage: string;

  comments: IComment[] = [];
  tempCommentGene = '';
  tempCommentVariants = '';
  tempCommentreference = '';
  tempCommentComment = '';
  vusstatus = false;
  // preview = true;
  isVisible = false;

  examin = '김지혜 M.T./이건동 M.T./'; // 검사자
  recheck = '김명신 M.D./김용구 M.D./김훈석 M.D./'; // 확인자

  animal: string;
  name: string;
  sendEMR = 0; // EMR 보낸 수
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일
  reportType: string; // AML ALL

  genelists: IGeneList[] = [];
  deleteRowNumber: number;
  // variant detect 선택값 저장소
  vdcount = 0;
  vd: { sequence: number, selectedname: string, gene: string }[] = [];

  // lastScrollTop = 0;
  // lastScrollLeft = 0;
  topScroll = false;
  // leftScroll = true;
  tsvVersion = '510'; // v5.10, v5.16 버전확인
  // tslint:disable-next-line:max-line-length
  vusmsg = `VUS는 ExAC, KRGDB등의 Population database에서 관찰되지 않았거나, 임상적 의의가 불분명합니다. 해당변이의 의의를 명확히 하기 위하여 환자의 buccal swab 검체로 germline variant 여부에 대한 확인이 필요 합니다.`;
  amlLuk: string[] = ['RUNX1-RUNX1T1', 'CBFB-MYH11', 'PML-RARA(bcr1)', 'PML-RARA(bcr2)',
    'PML-RARA(bcr3)', 'PML-RARA', 'KMT2A-MLLT3', 'DEK-NUP214', 'PBM15-MKL1', 'BCR-ABL1(e1a2)',
    'BCR-ABL1(b2a2)', 'BCR-ABL1(b3a2)', 'BCR-ABL1'];

  allLuk: string[] = ['BCR-ABL1(e1a2)', 'BCR-ABL1(b2a2)', 'BCR-ABL1(b3a2)', 'BCR-ABL1',
    'KMT2A-AFF1', 'KMT2A-MLLT1', 'KMT2A-MLLT3', 'ETV6-RUNX1', 'IGH-IL3', 'TCF3-PBX1'];

  functionalimpact: string[] = ['Pathogenic', 'Likely Pathogenic', 'VUS'];
  tempCount: string;
  maxHeight = 500;
  @ViewChild('commentbox') private commentbox: TemplateRef<any>;
  // @ViewChild('box100', { static: true }) box100: ElementRef;
  @ViewChild('table', { static: true }) table: ElementRef;
  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private fb: FormBuilder,
    private variantsService: DetectedVariantsService,
    private store: StoreService,

    public dialog: MatDialog,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private commentsService: CommentsService,
    private analysisService: AnalysisService,
    private excelService: ExcelAddListService,
    private snackBar: MatSnackBar,
    private researchService: ResearchService
  ) { }

  ngOnInit(): void {
    this.findType();

    // this.initLoad();
    // if (parseInt(this.screenstatus, 10) >= 1 || parseInt(this.screenstatus, 10) === 2) {
    //   this.recoverDetected();
    // } else if (parseInt(this.screenstatus, 10) === 0) {

    // } else {
    //   this.firstReportDay = '-';
    //   this.lastReportDay = '-';
    // }

    this.loadForm();

  } // End of ngOninit



  tableHeader(): {} {
    if (this.topScroll) {
      return { 'header-fix': true, 'td-fix': false };
    }
    return { 'header-fix': false, 'td-fix': true };
  }


  allLukemia(lukemia: string): void {
    console.log('[190][allLukemia][profile.leukemia]', this.profile.leukemia);
  }

  findType(): void {
    const list = this.researchService.getData();
    this.patientInfo.name = list.name;
    this.patientInfo.age = list.age;
    this.patientInfo.patientID = list.patientid;
    this.patientInfo.gender = list.gender;
    this.reportType = list.type;
    this.getGeneList(this.reportType);
  }

  loadForm(): void {
    // console.log('[205][loadForm] ', this.comments);
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list))),
      commentsRows: this.fb.array([])
    });
  }


  // ALL/AML 유전자 목록 가져오기
  getGeneList(type: string): any {
    this.utilsService.getGeneList(type).subscribe(data => {
      this.genelists = data;
    });
  }
  ////////////////////////////////////////
  recoverDetected(): void {
    // 디비에서 Detected variant_id 와 comments 가져오기
    this.subs.sink = this.variantsService.screenSelect(this.form2TestedId).subscribe(data => {
      console.log('[332][form2][recoverDetected][screen/query]', data);
      this.recoverVariants = data;
      this.recoverVariants.forEach((list, index) => this.vd.push({ sequence: index, selectedname: 'mutation', gene: list.gene }));
      // console.log('[335][form2][Detected variant_id]', this.recoverVariants);
      this.store.setDetactedVariants(data); // Detected variant 저장

      // VUS 메제시 확인 2021.4.7 추가
      this.vusmsg = this.patientInfo.vusmsg;
      // console.log('[383][recoverDetected][VUS메세지]', this.patientInfo.vusmsg, this.vusmsg);

      this.recoverVariants.forEach(item => {
        this.recoverVariant(item);  // 354

        // VUS 메제시 확인
        this.vusmsg = this.patientInfo.vusmsg;
        // console.log('[391][recoverDetected][VUS메세지]', this.patientInfo.vusmsg, this.vusmsg);
        if (item.functional_impact === 'VUS') {
          this.vusstatus = true;
          this.store.setVUSStatus(this.vusstatus);
        } else {
          this.vusmsg = '';
        }

      });
      this.putCheckboxInit(); // 체크박스 초기화
    });


    // 코멘트 가져오기
    this.subs.sink = this.variantsService.screenComment(this.form2TestedId)
      .subscribe(dbComments => {
        if (dbComments !== undefined && dbComments !== null && dbComments.length > 0) {

          dbComments.forEach(comment => {

            this.comments.push(
              {
                gene: comment.gene, comment: comment.comment,
                reference: comment.reference,
                variant_id: comment.variants
              }
            );
            this.commentsRows().push(this.createCommentRow(
              {
                gene: comment.gene, comment: comment.comment,
                reference: comment.reference,
                variant_id: comment.variants
              }
            ));
          });
          this.store.setComments(this.comments); // comments 저장
        }
      });

    // profile 가져오기
    if (this.reportType === 'AML') {
      this.subs.sink = this.analysisService.getAanlysisAMLInfo(this.form2TestedId)
        .subscribe(data => {
          if (data.length > 0) {
            this.profile.leukemia = data[0].leukemiaassociatedfusion;
            this.profile.flt3itd = data[0].FLT3ITD;
            this.profile.chron = data[0].chromosomalanalysis;
          } else {
            this.profile.leukemia = '';
            this.profile.flt3itd = '';
            this.profile.chron = '';
          }
          this.store.setProfile(this.profile); // profile 저장
        });
    }
    if (this.reportType === 'ALL') {
      this.subs.sink = this.analysisService.getAanlysisALLInfo(this.form2TestedId)
        .subscribe(data => {
          if (data.length > 0) {
            this.profile.leukemia = data[0].leukemiaassociatedfusion;
            this.profile.flt3itd = data[0].IKZK1Deletion;
            this.profile.chron = data[0].chromosomalanalysis;
          } else {
            this.profile.leukemia = '';
            this.profile.flt3itd = '';
            this.profile.chron = '';
          }
          this.store.setProfile(this.profile); // profile 저장
        });
    }

  }

  init(form2TestedId: string): void {
    if (this.form2TestedId) {

      if (this.patientInfo.vusmsg.length) {
        this.vusmsg = this.patientInfo.vusmsg;
      }

      this.variantsService.screenSelect(this.form2TestedId)
        .subscribe(data => {
          console.log('[429][저장된 데이터]', data);
          if (data.length > 0) {
            this.recoverVariants = data;

            this.recoverVariants.forEach((list, index) => this.vd.push({ sequence: index, selectedname: 'mutation', gene: list.gene }));
            this.store.setDetactedVariants(data); // Detected variant 저장
            this.recoverVariants.forEach(item => {

              this.recoverVariant(item);  // 354
              // VUS 메제시 확인
              this.vusmsg = this.patientInfo.vusmsg;

              if (item.functional_impact === 'VUS') {
                this.vusstatus = true;
                this.store.setVUSStatus(this.vusstatus);
              } else {
                this.vusmsg = ''; // vusmsg 가 저장 되어 있지 않으면 내용삭제 2021.11.01
              }
            });
            this.putCheckboxInit(); // 체크박스 초기화
            /////////////////////////////////////
            // 코멘트 가져오기
            this.subs.sink = this.variantsService.screenComment(this.form2TestedId)
              .subscribe(dbComments => {
                if (dbComments !== undefined && dbComments !== null && dbComments.length > 0) {
                  console.log('[457][COMMENT 가져오기]', dbComments);
                  dbComments.forEach(comment => {
                    // console.log('[291]', comment.reference);
                    this.comments.push(
                      {
                        gene: comment.gene, comment: comment.comment,
                        reference: comment.reference,
                        variant_id: comment.variants
                      }
                    );
                    this.commentsRows().push(this.createCommentRow(
                      {
                        gene: comment.gene, comment: comment.comment,
                        reference: comment.reference,
                        variant_id: comment.variants
                      }
                    ));
                  });
                  this.store.setComments(this.comments); // comments 저장
                }
              });
            ////////////////////////////////////
          }
        });


      // 검사자 정보 가져오기
      if (this.reportType === 'AML') {
        this.analysisService.getAanlysisAMLInfo(this.form2TestedId)
          .subscribe(data => {
            // console.log('========[568][AML]', data);
            if (data.length > 0) {
              this.profile.leukemia = data[0].leukemiaassociatedfusion;
              this.profile.flt3itd = data[0].FLT3ITD;
              this.profile.chron = data[0].chromosomalanalysis;
            } else {
              this.profile.leukemia = this.patientInfo.leukemiaassociatedfusion;
              this.profile.flt3itd = this.patientInfo.FLT3ITD;
              this.profile.chron = this.patientInfo.chromosomalanalysis;
            }
            this.store.setProfile(this.profile); // profile 저장
          });
      }

      if (this.reportType === 'ALL') {
        this.analysisService.getAanlysisALLInfo(this.form2TestedId)
          .subscribe(data => {
            // console.log('========[585][ALL]', data);
            if (data.length > 0) {
              this.profile.leukemia = data[0].leukemiaassociatedfusion;
              this.profile.flt3itd = data[0].IKZK1Deletion;
              this.profile.chron = data[0].chromosomalanalysis;
            } else {
              this.profile.leukemia = this.patientInfo.leukemiaassociatedfusion;
              this.profile.flt3itd = this.patientInfo.IKZK1Deletion;
              this.profile.chron = this.patientInfo.chromosomalanalysis;
            }
            this.store.setProfile(this.profile); // profile 저장
          });
      }

    } else {   // End of form2TestedId loop
      this.patientInfo = {
        id: 0,
        name: '',
        patientID: '',
        age: '',
        gender: '',
        testedNum: '',
        leukemiaAssociatedFusion: '',
        IKZK1Deletion: '',
        chromosomalAnalysis: '',
        targetDisease: '',
        method: '',
        accept_date: '',
        specimen: '',
        request: '',
        tsvFilteredFilename: '',
        FLT3ITD: '',
        specimenNo: '',
        screenstatus: '',
        examin: '',
        recheck: ''
      };
    }
  }

  // 검사일/검사보고일/수정보고일 관리
  setReportdaymgn(patientInfo: IPatient): void {
    // 전송횟수, 검사보고일, 수정보고일  저장
    console.log('[730][검사일/검사보고일/수정보고일 관리]', patientInfo);
    this.sendEMR = Number(patientInfo.sendEMR);
    if (patientInfo.sendEMRDate.length) {
      this.firstReportDay = patientInfo.sendEMRDate.replace(/-/g, '.').slice(0, 10);
    }
    if (this.sendEMR > 1) {
      this.lastReportDay = patientInfo.report_date.replace(/-/g, '.').slice(0, 10);
    } else if (this.sendEMR === 0) {
      this.firstReportDay = '-';
    }

    // 판독자 , 검사자
    if (patientInfo.examin.length) {
      this.examin = patientInfo.examin;
    }

    if (patientInfo.recheck.length) {
      this.recheck = patientInfo.recheck;
    }
    if (patientInfo.examin.length === 0 && patientInfo.recheck.length === 0) {

      this.subs.sink = this.utilsService.getListsDig('AMLALL')
        .subscribe(data => {
          console.log('[664][검사자]', data);
          this.examin = data[0].checker;
          this.recheck = data[0].reader;
        });
    }
  }

  // tslint:disable-next-line: typedef
  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  // tslint:disable-next-line:typedef
  result(event) {
    this.resultStatus = event.srcElement.defaultValue;

  }

  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }


  // 필터링된 tsv 파일 가져오기
  // tslint:disable-next-line: typedef
  getfiteredTSVlist(testedID: string) {
    this.filteredTSV$ = this.patientsListService.getFilteredTSVtList(testedID);
    this.subs.sink = this.filteredTSV$.subscribe(data => {
      this.tsvLists = data;
    });
  }

  // tslint:disable-next-line: typedef
  addVarient(type: string, item: IAFormVariant, gene: string, coding: string, tsv: IFilteredTSV, count: string, igv: string) {
    let tempvalue;
    let tempCount;

    if (parseInt(count, 10) > 1) {
      tempCount = count;
    } else {
      tempCount = '';
    }

    if (type === 'M') {
      tempvalue = {
        igv,
        sanger: '',
        type,
        cnt: tempCount,
        gene,
        functionalImpact: item.functional_impact,
        transcript: tsv.transcript.replace(/;/g, ','),
        exonIntro: 'E' + tsv.exon.replace(/;/g, ','),
        nucleotideChange: tsv.coding.replace(/;/g, ','),
        aminoAcidChange: tsv.amino_acid_change.replace(/;/g, ','),
        zygosity: 'Heterozygous',
        vafPercent: tsv.frequency.replace(/;/g, ','),
        reference: item.reference,
        cosmic_id: item.cosmic_id,
        gubun: 'AMLALL'
      };

    } else {
      tempvalue = {
        igv,
        sanger: '',
        type,
        cnt: '',
        gene,
        functionalImpact: '',
        transcript: tsv.transcript.replace(/;/g, ','),
        exonIntro: 'E' + tsv.exon.replace(/;/g, ','),
        nucleotideChange: tsv.coding.replace(/;/g, ','),
        aminoAcidChange: tsv.amino_acid_change.replace(/;/g, ','),
        zygosity: 'Heterozygous',
        vafPercent: tsv.frequency.replace(/;/g, ','),
        reference: '',
        cosmic_id: '',
        gubun: 'AMLALL'
      };
    }
    //
    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.store.setDetactedVariants(this.detactedVariants);
    this.addNewRow(tempvalue);

    this.checkboxStatus = [];
    for (let i = 0; i < this.detactedVariants.length; i++) {
      this.checkboxStatus.push(i);
    }

  }

  recoverVariant(item: IRecoverVariants): void {
    let tempvalue;
    tempvalue = {
      igv: item.igv,
      sanger: item.sanger,
      type: item.type,
      cnt: item.cnt,
      gene: item.gene,
      functionalImpact: item.functional_impact,
      transcript: item.transcript.replace(/;/g, ','),
      exonIntro: item.exon.replace(/;/g, ','),
      nucleotideChange: item.nucleotide_change.replace(/;/g, ','),
      aminoAcidChange: item.amino_acid_change.replace(/;/g, ','),
      zygosity: item.zygosity,
      vafPercent: item.vaf.replace(/;/g, ','),
      reference: item.reference,
      cosmic_id: item.cosmic_id,
      checked: item.checked,
      id: item.id,
      gubun: 'AMLALL'
    };

    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.addNewRow(tempvalue);

  }

  // 검사자 정보 가져오기
  // tslint:disable-next-line: typedef
  getPatientinfo(testid: string) {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.specimenNo === testid)[0];
    }
    return;
  }

  createRow(item: IAFormVariant): FormGroup {
    let checktype: boolean;
    if (String(item.checked) === 'false') {
      // console.log('==== [907][createRow]', item.id, item.gene, item.checked);
      checktype = false;
    } else {
      checktype = true;
    }

    if (item.type === 'New') {
      return this.fb.group({
        igv: [item.igv],
        sanger: [item.sanger],
        type: [item.type],
        cnt: [item.cnt],
        gene: [item.gene],
        functionalImpact: [item.functionalImpact],
        transcript: [item.transcript.replace(/;/g, ',')],
        exonIntro: [item.exonIntro.replace(/;/g, ',')],
        nucleotideChange: [item.nucleotideChange.replace(/;/g, ',')],
        aminoAcidChange: [item.aminoAcidChange.replace(/;/g, ',')],
        zygosity: [item.zygosity],
        vafPercent: [item.vafPercent.replace(/;/g, ',')],
        reference: [item.reference],
        cosmic_id: [item.cosmic_id],
        id: [item.id],
        checked: [checktype],
        status: ['NEW'],
        gubun: ['AMLALL']
      });
    }
    return this.fb.group({
      igv: [item.igv],
      sanger: [item.sanger],
      type: [item.type],
      cnt: [item.cnt],
      gene: [item.gene],
      functionalImpact: [item.functionalImpact],
      transcript: [item.transcript.replace(/;/g, ',')],
      exonIntro: [item.exonIntro.replace(/;/g, ',')],
      nucleotideChange: [item.nucleotideChange.replace(/;/g, ',')],
      aminoAcidChange: [item.aminoAcidChange.replace(/;/g, ',')],
      zygosity: [item.zygosity],
      vafPercent: [item.vafPercent.replace(/;/g, ',')],
      reference: [item.reference],
      cosmic_id: [item.cosmic_id],
      id: [item.id],
      checked: [checktype],
      status: ['OLD'],
      gubun: ['AMLALL']
    });
  }

  addNewRow(row: IAFormVariant): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }
  //////////////////////////////////////////
  // commentsForm
  ////////////////////////////////////////////
  createCommentRow(comment: IComment): FormGroup {
    return this.fb.group({
      gene: comment.gene,
      comment: comment.comment,
      reference: comment.reference,
      variant_id: comment.variant_id,
      type: this.reportType
    });
  }

  newCommentRow(): FormGroup {
    return this.fb.group({
      gene: '',
      comment: '',
      reference: '',
      variant_id: '',
      type: this.reportType
    });
  }

  commentsRows(): FormArray {
    return this.tablerowForm.get('commentsRows') as FormArray;
  }

  addNewCommentRow(): void {
    this.commentsRows().push(this.newCommentRow());
  }

  removeCommentRow(i: number): void {
    this.commentsRows().removeAt(i);
  }
  /////////////////////////////////////////////////////////////
  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }

  // tslint:disable-next-line: typedef
  putTableRowGroup() {
    return this.fb.group({
      id: [],
      igv: [''],
      sanger: [''],
      type: [''],
      cnt: [''],
      gene: [''],
      functionalImpact: [''],
      transcript: [''],
      exonIntro: [''],
      nucleotideChange: [''],
      aminoAcidChange: [''],
      zygosity: [''],
      vafPercent: [''],
      reference: [''],
      cosmic_id: [''],
      checked: [true],
      gubun: ['AMLALL']
    });
  }

  // tslint:disable-next-line: typedef
  addTableRowGroup() {
    return this.fb.group({
      id: [],
      igv: [''],
      sanger: [''],
      type: [''],
      cnt: [''],
      gene: [''],
      functionalImpact: [''],
      transcript: [''],
      exonIntro: [''],
      nucleotideChange: [''],
      aminoAcidChange: [''],
      zygosity: [''],
      vafPercent: [''],
      reference: [''],
      cosmic_id: [''],
      checked: [true],
      status: ['NEW'],
      gubun: ['AMLALL']
    });
  }

  // tslint:disable-next-line: typedef
  addRow() {
    const rect = this.table.nativeElement.getBoundingClientRect();
    this.maxHeight = rect.height + 120;

    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.addTableRowGroup());
    this.addBoxStatus(control.length - 1); // 체크박스 추가
    // 추가시 select box mutation  선택추가 해줌
    const len = this.vd.length;
    this.vd.push({ gene: '', selectedname: 'mutation', sequence: len });
  }

  // tslint:disable-next-line: typedef
  deleteRow(index: number) {
    this.deleteRowNumber = index;
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const controlLen = control.length - 1;
    const tempvd = [...this.vd];
    const idx = tempvd.findIndex(item => item.sequence === index);
    if (idx !== -1) {
      this.vd.splice(idx, 1);
    }

    control.removeAt(index);
    if (controlLen !== index) {
      if (this.vd.length > 0) {
        this.vd.forEach(item => item.sequence = item.sequence - 1);
      }
    }
    this.removeBoxStatus(index); // 체크박스 아이템 삭제
    const rect = this.table.nativeElement.getBoundingClientRect();
    this.maxHeight = rect.height - 60;
  }
  /////////////////////////////////////////////////////////////////////////////////

  addComments(type: string): void {
    const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.comments = commentControl.getRawValue();
    from(this.comments)
      .pipe(
        concatMap(ment => this.commentsService.insertCommentsList(
          this.reportType,
          '', ment.type, ment.gene, ment.variant_id, ment.comment, ment.reference, 'AMLALL'
        )),
        last()
      ).subscribe(data => {
        if (data) {
          alert('등록 되었습니다.');
        }
      });
  }

  // tslint:disable-next-line: typedef
  save(index: number) {
    console.log('[1151][저장] [index]', index, this.vd);
    const selected = this.vd.find(item => item.sequence === index);
    this.selectedItem = selected.selectedname;
    console.log('[1154][저장] ', index, this.vd, this.selectedItem);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];

    if (this.selectedItem === 'mutation') {
      (control.at(index) as FormGroup).get('type').patchValue('M');
    } else if (this.selectedItem === 'artifacts') {
      (control.at(index) as FormGroup).get('type').patchValue('A');
    }


    // console.log('[1104][저장][mutation/artifacts] ', row, this.patientInfo);
    if (this.selectedItem === 'mutation') {
      this.subs.sink = this.patientsListService.saveMutation(
        'AMLALL',
        row.igv,
        row.sanger,
        'M' + this.patientInfo.name,
        this.patientInfo.patientID,
        row.gene,
        row.functionalImpact,
        row.transcript,
        row.exonIntro,
        row.nucleotideChange,
        row.aminoAcidChange,
        row.zygosity,
        row.vafPercent,
        row.reference,
        row.cosmic_id
      ).subscribe((data: any) => {
        console.log('[1122][mustation 저장 응답]', data);
        alert('mutation에 추가 했습니다.');
        this.selectedItem = '';
      });
    } else if (this.selectedItem === 'artifacts') {
      this.subs.sink = this.patientsListService.insertArtifacts(
        'AMLALL',
        row.gene, '', '', row.transcript, row.nucleotideChange, row.aminoAcidChange
      ).subscribe((data: any) => {
        alert('artifacts에 추가 했습니다.');
        this.selectedItem = '';
      });
    }

  }

  // tslint:disable-next-line: typedef
  saveInhouse(i: number, selecteditem: string) {
    this.indexNum = i;
    this.selectedItem = selecteditem;

    this.vd.forEach(item => {
      if (item.sequence === i) {
        item.selectedname = selecteditem;
      }
    });

  }

  // tslint:disable-next-line: typedef
  checkType(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];
    const tempVD = [...this.vd];
    if (row.status === 'NEW') {
      const idx = tempVD.findIndex(item => item.sequence === index && item.gene === row.gene);

      if (idx === -1 && this.deleteRowNumber !== index) {
        this.vd.push({ sequence: index, selectedname: 'mutation', gene: row.gene });
      }

      return true;
    }
    return false;

  }

  // 스크린 판독
  screenRead(): void {

    const result = confirm('스크린완료 전송하시겠습니까?');
    if (result) {
      this.screenstatus = '1';
      this.patientInfo.screenstatus = this.screenstatus;
      this.tempSave();
    }
  }

  // 판독완료
  screenReadFinish(): void {
    const result = confirm('판독완료 전송하시겠습니까?');
    if (result) {
      this.screenstatus = '2';
      this.patientInfo.screenstatus = this.screenstatus;
      this.tempSave();
    }
  }

  getStatus(index): boolean {
    // console.log('[834][getStatus]', index, this.screenstatus);
    if (index === 1) {  // 스크린 완료
      if (parseInt(this.screenstatus, 10) === 0) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }

    } else if (index === 2) {  // 판독완료
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    } else if (index === 3) {  // EMR 전송
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    } else if (index === 4) {  // 수정
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return false;
      }
    }

  }

  boxstatus(i, event): void {
    if (event.target.checked) {
      this.checkboxStatus.push(i);
    } else {
      const index = this.checkboxStatus.findIndex(idx => idx === i);
      this.checkboxStatus.splice(index, 1);
    }
    console.log('[1358][상태][boxstatus]', this.checkboxStatus.sort());
  }


  checkboxRefill(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const temp = control.getRawValue();
    this.checkboxStatus = [];
    for (let i = 0; i < temp.length; i++) {
      if (String(temp[i].checked) === 'true') {
        this.checkboxStatus.push(i);
      }
    }
  }

  putCheckboxInit(): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.detactedVariants.length; i++) {
      if (String(this.detactedVariants[i].checked) === 'true') {
        this.checkboxStatus.push(i);
      }
    }

  }

  // detected varient 줄이 증가/삭제 시 체크상태 길이 변경
  addBoxStatus(idx: number): void {
    this.checkboxStatus.push(idx);
  }
  removeBoxStatus(i: number): void {
    const temp: number[] = [];
    this.checkboxStatus.forEach(val => {
      if (val > i) {
        temp.push(val - 1);
      } else if (val < i) {
        temp.push(val);
      }
    });
    this.checkboxStatus = temp;
  }

  getCommentGene(gene): void {
    this.tempCommentGene = gene;
  }

  getCommentComment(comment): void {
    this.tempCommentComment = comment;
  }
  // tslint:disable-next-line:variable-name
  getCommentVariants(variant_id: string): void {
    this.tempCommentVariants = variant_id;
  }

  getCommentRef(ref): void {
    this.tempCommentreference = ref;
  }

  ////////////////////////////////////////////////////////////
  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '.' + newmon + '.' + newday;

    return now;
  }

  //////////////////////////////////////////////////////////

  exammatch(type: string, value: string): boolean {
    if (type === 'exam') {
      if (this.examin === value) {
        return true;
      }
      return false;
    } else if (type === 'recheck') {
      if (this.recheck === value) {
        return true;
      }
      return false;
    }
  }


  checked(rechecked: string): void {
    this.patientInfo.recheck = rechecked; // 확인자
  }

  examimed(examin: string): void {
    this.patientInfo.examin = examin; // 검사자
  }

  examselected(value: string, type: number): boolean {
    if (type === 1) {
      return this.exammatch('exam', value);
    } else if (type === 2) {
      return this.exammatch('exam', value);
    }
  }

  recheckselected(value: string, type: number): boolean {
    if (type === 1) {
      return this.exammatch('recheck', value);
    } else if (type === 2) {
      return this.exammatch('recheck', value);
    } else if (type === 3) {
      return this.exammatch('recheck', value);
    } else if (type === 4) {
      return this.exammatch('recheck', value);
    } else if (type === 5) {
      return this.exammatch('recheck', value);
    }

  }


  tempSave(): void {

    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();

    console.log('[1641][임시저장]', formData, this.comments);

    const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.comments = commentControl.getRawValue();

    this.store.setComments(this.comments);
    this.patientInfo.recheck = this.recheck;
    this.patientInfo.examin = this.examin;
    this.patientInfo.vusmsg = this.vusmsg;
    console.log('[1654][tempSave]patient,reform,comment]', this.comments);
    // console.log('[1730][tempSave]VUS 메세지]', this.vusmsg);
    this.store.setRechecker(this.patientInfo.recheck);
    this.store.setExamin(this.patientInfo.examin);
    this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimenNo);
    this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimenNo);

    if (this.reportType === 'AML') {
      this.analysisService.putAnalysisAML(
        this.form2TestedId,
        this.profile.leukemia,
        this.profile.flt3itd,
        this.profile.chron).subscribe(data => console.log('AML INSERT'));
    } else if (this.reportType === 'ALL') {
      // console.log('*****[1687][ALL]', this.profile);
      this.analysisService.putAnalysisALL(
        this.form2TestedId,
        this.profile.leukemia,
        this.profile.flt3itd,
        this.profile.chron).subscribe(data => console.log('ALL INSERT'));
    }

    // tslint:disable-next-line:max-line-length
    this.subs.sink = this.variantsService.screenTempSave(this.form2TestedId, formData, this.comments, this.profile, this.resultStatus, this.patientInfo)
      .subscribe(data => {
        // console.log('[1698]', data);
        alert('저장되었습니다.');
      });
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////


  reset(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const temp = control.getRawValue();
    this.checkboxStatus = [];
    for (let i = 0; i < temp.length; i++) {
      if (String(temp[i].checked) === 'true') {
        this.checkboxStatus.push(i);
      }
    }

    const tempUserid: any = localStorage.getItem('diaguser');
    const tempuser: any = JSON.parse(tempUserid);
    const userid = tempuser.userid;

    console.log('[1805][reset][userid]', userid);
    this.patientsListService.resetscreenstatus(this.form2TestedId, '2', userid, this.reportType)
      .subscribe(data => {
        this.screenstatus = '2';
        this.patientInfo.screenstatus = '2';
        // console.log('[1810]', this.screenstatus);
      });
  }

  ///////////////////////////////////////////////////////////////////////
  //
  findMutationBygene(gene: string): void {
    console.log('[1775][findMutationBygene]', this.resultStatus);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    // console.log('[1411][tableerowForm]', formData);
    this.patientsListService.findMutationBygene(gene)
      .subscribe(data => {
        // console.log('[1413][findMutationBygene]', data);
        if (data === 0) {
          this.resultStatus = 'Not Detected';
        } else {
          this.resultStatus = 'Detected';
        }
      });
  }
  /////////////////////////////////////////////////////////////////////
  droped(event: CdkDragDrop<string[]>): void {
    // this.formArray = this.ifusionLists()
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    // console.log('[1428][droped]', from1, to);
    this.vd.forEach(item => {
      if (item.sequence === from1) {
        item.sequence = to;
      }
    });
    const control = this.tablerowForm.get('tableRows') as FormArray;
    // this.moveItemInFormArray(control, from1, to);
    this.moveItemInDetectedArray(control, from1, to);
  }

  commentDroped(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const commentsControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.moveItemInCommentArray(commentsControl, from1, to);
  }

  moveItemInDetectedArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const from2 = this.clamp(fromIndex, formArray.length - 1);
    const to2 = this.clamp(toIndex, formArray.length - 1);
    if (from2 === to2) {
      return;
    }

    // 방향: 위에서 아래로
    if (from2 < to2) {
      const diff = to2 - from2;
      if (diff === 1) {
        return;
      }
    }

    const len = formArray.length;

    const totalFormGroup = [];
    const newFormGroup = [];
    const previous = formArray.at(from2);
    const current = formArray.at(to2);

    for (let i = 0; i < len; i++) {
      totalFormGroup.push(formArray.at(i));
    }

    totalFormGroup.forEach((form, index) => {
      if (from2 > to2) {
        if (index === to2) {
          newFormGroup.push(previous);
          newFormGroup.push(current);
        } else if (index !== from2 && index !== to2) {
          newFormGroup.push(form);
        }
      } else if (from2 < to2 && (to2 - from2) > 1) {

        if (index === to2) {
          newFormGroup.push(previous);
          newFormGroup.push(form);
        } else if (index !== from2 && index !== to2) {
          newFormGroup.push(form);
        }
      }
    });

    for (let i = 0; i < len; i++) {
      formArray.setControl(i, newFormGroup[i]);
    }

  }

  ////////////////////////////////////////////////////////////////////////////////////////////
  moveItemInCommentArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const from2 = this.clamp(fromIndex, formArray.length - 1);
    const to2 = this.clamp(toIndex, formArray.length - 1);

    if (from2 === to2) {
      return;
    }

    if (from2 < to2) {
      const diff = to2 - from2;
      if (diff === 1) {
        return;
      }
    }


    const len = formArray.length;

    const totalFormGroup = [];
    const newFormGroup = [];
    const previous = formArray.at(from2);
    const current = formArray.at(to2);


    for (let i = 0; i < len; i++) {
      totalFormGroup.push(formArray.at(i));
    }

    totalFormGroup.forEach((form, index) => {
      if (from2 > to2) {
        if (index === to2) {
          newFormGroup.push(previous);
          newFormGroup.push(current);
        } else if (index !== from2 && index !== to2) {
          newFormGroup.push(form);
        }
      } else if (from2 < to2 && (to2 - from2) > 1) {

        if (index === to2) {
          newFormGroup.push(previous);
          newFormGroup.push(form);
        } else if (index !== from2 && index !== to2) {
          newFormGroup.push(form);
        }
      }
    });

    for (let i = 0; i < len; i++) {
      formArray.setControl(i, newFormGroup[i]);
    }
  }

  /**
   * Moves an item in a FormArray to another position.
   * @param formArray FormArray instance in which to move the item.
   * @param fromIndex Starting index of the item.
   * @param toIndex Index to which he item should be moved.
   */
  moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const from2 = this.clamp(fromIndex, formArray.length - 1);
    const to2 = this.clamp(toIndex, formArray.length - 1);
    if (from2 === to2) {
      return;
    }

    const previous = formArray.at(from2);
    const current = formArray.at(to2);
    formArray.setControl(to2, previous);
    formArray.setControl(from2, current);
  }

  /** Clamps a number between zero and a maximum. */
  clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
  }
  /////////////////////////////////////////////////////////
  showGroup(i): boolean {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    // console.log('\n***********************\n', control.at(i).value.checked, i);
    return control.at(i).value.checked;
  }
  checkboxuncheck(): boolean {
    return false;
  }
  checkboxcheck(): boolean {
    return true;
  }
  ////////////////////////////////////////////////////////
  // detected variant 정렬
  dvSort(): void {

    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    console.log('[1984][정렬]', formData)
    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    this.store.setComments(this.comments);
    this.patientInfo.recheck = this.recheck;
    this.patientInfo.examin = this.examin;
    this.patientInfo.vusmsg = this.vusmsg;

    this.store.setRechecker(this.patientInfo.recheck);
    this.store.setExamin(this.patientInfo.examin);
    this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimenNo);
    this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimenNo);

    if (this.reportType === 'AML') {
      this.analysisService.putAnalysisAML(
        this.form2TestedId,
        this.profile.leukemia,
        this.profile.flt3itd,
        this.profile.chron).subscribe(data => console.log('AML INSERT'));
    } else if (this.reportType === 'ALL') {
      this.analysisService.putAnalysisALL(
        this.form2TestedId,
        this.profile.leukemia,
        this.profile.flt3itd,
        this.profile.chron).subscribe(data => console.log('ALL INSERT'));
    }


    // tslint:disable-next-line:max-line-length
    this.variantsService.screenTempSave2(this.form2TestedId, formData, this.comments, this.profile, this.resultStatus, this.patientInfo)
      .pipe(
        concatMap(() => this.variantsService.screenSelect(this.form2TestedId)),
        tap(data => console.log('[2018][졍렬]', data))
      ).subscribe(data => {
        this.vd = [];
        this.checkboxStatus = [];
        this.detactedVariants = [];
        this.recoverVariants = [];
        // console.log('formData: ', formData);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < formData.length; i++) {
          this.deleteRow(0);
        }

        this.recoverVariants = data;
        this.recoverVariants.forEach((list, index) => this.vd.push({ sequence: index, selectedname: 'mutation', gene: list.gene }));
        // console.log('[1945][form2][Detected variant_id]', this.recoverVariants);
        this.store.setDetactedVariants(data);
        this.recoverVariants.forEach(item => {
          this.recoverVariant(item);
        });
        this.putCheckboxInit();
      });

  }

  tsvFileVersion(tsvfile: string): void {
    // console.log('=========> tsvfile: ', tsvfile);
    if (tsvfile === '5.16') {
      this.tsvVersion = '516';
    } else if (tsvfile === '5.10') {
      this.tsvVersion = '510';
    }
  }

  //////////////////////////////////////////////////////////
  goBack(): void {
    this.router.navigate(['/diag', 'amlall']);
  }



  /////////////////////////////////////////////////////////////
  // VUS 검사
  checkVUS(): boolean {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData: IAFormVariant[] = control.getRawValue();
    const vusIdx = formData.findIndex(list => list.functionalImpact === 'VUS');
    if (vusIdx === -1) {
      this.vusmsg = '';
      return false;
    }
    this.vusmsg = `VUS는 ExAC, KRGDB등의 Population database에서 관찰되지 않았거나, 임상적 의의가 불분명합니다. 해당변이의 의의를 명확히 하기 위하여 환자의 buccal swab 검체로 germline variant 여부에 대한 확인이 필요 합니다.`;
    return true;

  }

  //////////////////////////////////////////////////////////////
  reCall(): void {

    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData: IAFormVariant[] = control.getRawValue();

    formData.forEach((list, index) => {

      const gene = list.gene.split(',');
      gene.forEach(item => {
        this.patientsListService.getMutationVariantsLists(item, list.nucleotideChange, 'AMLALL')
          .subscribe(data => {
            if (data.length > 0) {
              console.log('[2080][호출]', data, index);
              control.at(index).patchValue({
                type: data[0].type,
                functionalImpact: data[0].functional_impact,
                reference: data[0].reference, cosmic_id: data[0].cosmic_id
              });
              this.snackBar.open('완료 했습니다.', '닫기', { duration: 3000 });
            }
          });
      });
    });
  }



}
