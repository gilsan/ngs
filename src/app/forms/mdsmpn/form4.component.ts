import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, from, Observable, of } from 'rxjs';

import {
  IComment, IDList, IExcelData, IFilteredTSV, IGeneCoding,
  IGeneList,
  IPatient, IProfile, IRecoverVariants
} from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
// import { PatientsListService } from 'src/app/home/services/patientslist';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IAFormVariant } from 'src/app/home/models/patients';
import { shareReplay, switchMap, tap, concatMap, map, filter, last } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { GENERAL, makeBForm, METHODS, METHODS516 } from 'src/app/home/models/bTypemodel';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { StoreService } from '../store.current';
import { ExcelService } from 'src/app/home/services/excelservice';

import { MatDialog } from '@angular/material/dialog';
import { DialogOverviewExampleDialogComponent } from '../dialog-overview-example-dialog/dialog-overview-example-dialog.component';
import { makeAForm } from 'src/app/home/models/aTypemodel';
import { UtilsService } from '../commons/utils.service';
import { CommentsService } from 'src/app/services/comments.service';
import { makeDForm } from 'src/app/home/models/dTypemodel';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AnalysisService } from '../commons/analysis.service';
import { ExcelAddListService } from 'src/app/home/services/excelAddList';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 *  ALL/AML   LYM           MDS
 * leukemia                 diagnosis,leukemiaassociatedfusion
 * flt3itd    bonemarrow    genetictest
 * chron      chron         chron, chromosomalanalysis
 */
@Component({
  selector: 'app-form4',
  templateUrl: './form4.component.html',
  styleUrls: ['./form4.component.scss']
})
export class Form4Component implements OnInit, OnDestroy, AfterViewInit {

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
    functional_impact: '',
  };
  geneCoding: IGeneCoding[];
  detactedVariants: IAFormVariant[] = [];
  recoverVariants: IRecoverVariants[] = [];
  checkboxStatus = []; // 체크박스 on 인것
  ngsData = [];
  private subs = new SubSink();

  resultStatus = 'Detected';
  fusion = '';
  chronmosomal = '';
  // methods = METHODS;
  method: string;
  methods516 = METHODS516;
  general = GENERAL;
  indexNum = 0;
  selectedItem = 'mutation';
  tsvInfo: IFilteredTSV;
  profile: IProfile = {
    leukemia: '', genetictest: '', chron: ''
  };
  genetictestType = ['Genetics Test1', '-', 'Genetics Test3', 'Genetics Test4'];
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
  specimenMessage = 'Genomic DNA isolated from peripheral blood';

  comments: IComment[] = [];
  tempCommentGene = '';
  tempCommentVariants = '';
  tempCommentreference = '';
  tempCommentComment = '';
  vusstatus = false;
  preview = true;
  isVisible = false;

  examin = ''; // 검사자
  recheck = ''; // 확인자

  animal: string;
  name: string;
  sendEMR = 0; // EMR 보낸 수
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일
  reportType: string; //

  genelists: IGeneList[] = [];
  typeColor = [];
  deleteRowNumber: number;
  // variant detect 선택값 저장소
  vdcount = 0;
  vd: { sequence: number, selectedname: string, gene: string }[] = [];

  lastScrollTop = 0;
  lastScrollLeft = 0;
  topScroll = false;
  leftScroll = true;
  tsvVersion = '510'; // v5.16 버전확인
  // tslint:disable-next-line:max-line-length
  vusmsg = `VUS는 ExAC, KRGDB등의 Population database에서 관찰되지 않았거나, 임상적 의의가 불분명합니다. 해당변이의 의의를 명확히 하기 위하여 환자의 buccal swab 검체로 germline variant 여부에 대한 확인이 필요 합니다.`;

  functionalimpact: string[] = ['Pathogenic', 'Likely Pathogenic', 'VUS'];
  zygosity: string[] = ['Heterozygous', 'Homozygous'];
  methodmsg = `Total genomic DNA was extracted from the each sample.  The TruSeq DNA Sample Preparation kit of Illumina was used to make the library. The Agilent SureSelect Target enrichment kit was used for in-solution enrichment of target regions. The enriched fragments were then amplified and sequenced on the MiSeqDx system (illumina). After demultiplexing, the reads were aligned to the human reference genome hg19 (GRCh37) using BWA (0.7.12) and duplicate reads were removed with Picard MarkDuplicates (1.98). Local realignment, score recalibiration and filtering sequence data were performed with GATK (2.3-9). Variants were annotated using SnpEff (4.2).`;

  technique = `The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test.`;

  maxHeight = 500;
  isResearch = false;
  totalCount = 0; // 유전자와 nucleotidde change 을 가진 환자수
  savedDataExist = false;

  @ViewChild('commentbox') private commentbox: TemplateRef<any>;
  @ViewChild('box100', { static: true }) box100: ElementRef;
  @ViewChild('table', { static: true }) table: ElementRef;
  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private fb: FormBuilder,
    private variantsService: DetectedVariantsService,
    private store: StoreService,
    private excel: ExcelService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private analysisService: AnalysisService,
    private excelService: ExcelAddListService,
    private snackBar: MatSnackBar,
    private commentsService: CommentsService,
  ) { }

  ngOnInit(): void {
    this.findType();
    // this.box100.nativeElement.scrollLeft = 250;

    this.initLoad();
    if (parseInt(this.screenstatus, 10) >= 1 || parseInt(this.screenstatus, 10) === 2) {
      this.recoverDetected();
    } else if (parseInt(this.screenstatus, 10) === 0) {
      this.checkSavedData();

      // this.addDetectedVariant();
    } else {
      this.firstReportDay = '-';
      this.lastReportDay = '-';
    }

    this.loadForm();

  } // End of ngOninit

  ngAfterViewInit(): void {
    // this.checker();
  }


  resizeHeight() {
    return { height: `${this.maxHeight}px` };
  }


  tableScroll(evt: Event): void {
    const target = evt.target as Element;
    const lastScrollTop = target.scrollTop;
    const lastScrollLeft = target.scrollLeft;

    if (this.lastScrollTop > lastScrollTop || this.lastScrollTop < lastScrollTop) {
      this.topScroll = true;
      this.leftScroll = false;
    } else {
      this.topScroll = false;
    }

    if (this.lastScrollLeft > lastScrollLeft || this.lastScrollLeft < lastScrollLeft) {
      this.topScroll = false;
      this.leftScroll = true;
    } else {
      this.leftScroll = false;
    }

    this.lastScrollTop = lastScrollTop <= 0 ? 0 : lastScrollTop;
    this.lastScrollLeft = lastScrollLeft <= 0 ? 0 : lastScrollLeft;
  }

  tableHeader(): {} {
    if (this.topScroll) {
      return { 'header-fix': true, 'td-fix': false };
    }
    return { 'header-fix': false, 'td-fix': true };
  }



  findType(): void {
    this.route.paramMap.pipe(
      filter(data => data !== null || data !== undefined),
      map(route => route.get('type'))
    ).subscribe(data => {
      // console.log('[260][findType]', data);
      this.reportType = 'MDS';
      this.getGeneList('MDS'); // 진검 유전자 목록 가져옴.
    });
  }

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list))),
      commentsRows: this.fb.array([])
    });
  }

  initLoad(): void {
    this.form2TestedId = this.patientsListService.getTestedID();

    // 검사자 정보 가져오기
    if (this.form2TestedId === null || this.form2TestedId === undefined) {
      this.router.navigate(['/diag']);
      return;
    }

    this.patientInfo = this.getPatientinfo(this.form2TestedId);
    // tslint:disable-next-line:max-line-length
    this.profile.genetictest = 'JAK2 V617F :' + this.patientInfo.genetic1 + '\n' + 'JAK2 exon 12 :' + this.patientInfo.genetic2 + '\n' + 'CALR :' + this.patientInfo.genetic3 + '\n' + 'MPL :' + this.patientInfo.genetic4;
    console.log('[290][환자정보]', this.patientInfo, this.profile);
    if (this.patientInfo.gbn === 'RESEARCH') {
      this.isResearch = true;
    }
    this.method = this.patientInfo.reportTitle.replace(/"/g, '');
    this.store.setPatientInfo(this.patientInfo); // 환자정보 저장

    // tsvFilteredFilename 분석
    this.tsvFileVersion(this.patientInfo.verfile);

    this.requestDate = this.patientInfo.accept_date;
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from bone marrow';
    } else if (this.patientInfo.specimen === '004') {
      this.specimenMsg = 'EDTA blood';
      this.specimenMessage = 'Genomic DNA isolated from EDTA blood';
      this.store.setSpecimenMsg(this.specimenMsg);
    }

    // 검체 감염유부 확인
    if (parseInt(this.patientInfo.detected, 10) === 0) {
      this.resultStatus = 'Detected';
    } else if (parseInt(this.patientInfo.detected, 10) === 1) {
      this.resultStatus = 'Not Detected';
    }

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);

    this.screenstatus = this.patientInfo.screenstatus;
    // specimen 015 인경우 Bon marrow
    // if (this.patientInfo.specimen === '015') {
    //   this.specimenMsg = 'Bone marrow';
    //   this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
    //   this.store.setSpecimenMsg(this.specimenMsg);
    // }
    // 필터링된 tsv 파일 가져오기
    this.filteredTSV$ = this.patientsListService.getFilteredTSVtList(this.form2TestedId)
      .pipe(
        shareReplay()
      );
    this.subs.sink = this.filteredTSV$.subscribe(data => {
      // console.log('[168][form2][fileredTSVFile]', data);
      this.tsvLists = data;
    });

  }

  //  유전자 목록 가져오기
  getGeneList(type: string): any {
    this.utilsService.getGeneList('MDS').subscribe(data => {
      // console.log('[333][디비에서 가져온 Gene]', data);
      this.genelists = data;
    });
  }
  // 디비에 저장된 데이터가 있는지 확인
  checkSavedData(): void {
    this.subs.sink = this.variantsService.screenSelect(this.form2TestedId)
      .pipe(
        tap(data => {
          console.log('[344][checkSavedData]', data);
          if (data.length) {
            this.savedDataExist = true;
          } else {
            this.savedDataExist = false;
          }
        })
      )
      .subscribe(() => {
        if (this.savedDataExist) {
          console.log('[351][true]', this.savedDataExist);
          this.recoverDetected();
        } else {
          console.log('[354][false]', this.savedDataExist);
          this.init(this.form2TestedId);
        }
      });
  }

  // white space 제거
  removeWhitespace(item: string): string {
    return item.replace(/(\r\n|\r)/gm, '');
  }
  ////////////////////////////////////////
  recoverDetected(): void {
    // 디비에서 Detected variant_id 가져오기
    this.subs.sink = this.variantsService.screenSelect(this.form2TestedId).subscribe(data => {
      for (const el of data) {
        el.nucleotide_change = el.nucleotide_change.replace(/(\r\n|\r)/gm, '');
        el.cosmic_id = el.cosmic_id.replace(/(\r\n|\r)/gm, ',');
      }
      this.recoverVariants = data;
      this.recoverVariants.forEach((list, index) => this.vd.push({ sequence: index, selectedname: 'mutation', gene: list.gene }));
      console.log('[380][form2][Detected variant_id]', this.recoverVariants);
      this.store.setDetactedVariants(data); // Detected variant 저장

      // VUS 메제시 확인
      // this.vusmsg = this.patientInfo.vusmsg;
      console.log('[385][recoverDetected][VUS메세지]', this.patientInfo.vusmsg);
      const tempVUS = [];
      this.recoverVariants.forEach(item => {
        this.recoverVariant(item);  // 354
        // VUS 메제시 확인
        tempVUS.push(item.functional_impact);
      });
      if (tempVUS.includes('VUS')) {
        this.vusstatus = true;
        if (this.patientInfo.vusmsg.length) {
          this.vusmsg = this.patientInfo.vusmsg;
        }
      } else {
        this.vusstatus = false;
      }
      //  console.log('[391][vusstatus]', tempVUS);
      this.putCheckboxInit(); // 체크박스 초기화
    });

    // 코멘트 가져오기
    this.subs.sink = this.variantsService.screenComment(this.form2TestedId)
      .subscribe(dbComments => {
        console.log('[393][COMMENT 가져오기]', dbComments);
        if (dbComments !== undefined && dbComments !== null && dbComments.length > 0) {

          dbComments.forEach(comment => {

            this.comments.push(
              {
                gene: comment.gene, comment: comment.comment, reference: comment.reference,
                variant_id: comment.variants
              }
            );
            this.commentsRows().push(this.createCommentRow(
              {
                gene: comment.gene, comment: comment.comment, reference: comment.reference,
                variant_id: comment.variants
              }
            ));
          });
          console.log('[424][COMMENT 가져오기]', this.comments);
          this.store.setComments(this.comments); // comments 저장
        }
      });


    // profile 가져오기
    this.subs.sink = this.analysisService.getAanlysisMDSInfo(this.form2TestedId)
      .subscribe(data => {
        console.log('[426][저장된 profile]==> ', data[0]);
        if (data.length > 0) {
          this.profile.leukemia = data[0].diagnosis;
          if (this.profile.genetictest.length) {
            this.profile.genetictest = data[0].genetictest;
          } else {
            this.profile.genetictest = 'JAK2 V617F :' + this.patientInfo.genetic1 + '\n' + 'JAK2 exon 12 :' + this.patientInfo.genetic2 + '\n' + 'CALR :' + this.patientInfo.genetic3 + '\n' + 'MPL :' + this.patientInfo.genetic4;
          }

          this.profile.chron = data[0].chromosomalanalysis;
        } else {
          this.profile.leukemia = this.patientInfo.leukemiaassociatedfusion;
          this.profile.genetictest = 'JAK2 V617F :' + this.patientInfo.genetic1 + '\n' + 'JAK2 exon 12 :' + this.patientInfo.genetic2 + '\n' + 'CALR :' + this.patientInfo.genetic3 + '\n' + 'MPL :' + this.patientInfo.genetic4;
          this.profile.chron = this.patientInfo.chromosomalanalysis;
        }
        this.store.setProfile(this.profile); // profile 저장
      });


  }

  init(form2TestedId: string): void {

    // VUS 메제시 확인 2021.4.7 추가
    if (this.patientInfo.vusmsg.length) {
      this.vusmsg = this.patientInfo.vusmsg;
      console.log('[445][init][VUS메세지]', this.vusmsg);
    }

    if (this.form2TestedId) {
      // this.variantsService.screenSelect(this.form2TestedId).subscribe(data => {
      this.patientsListService.mlpafiltering(this.form2TestedId, this.reportType, this.patientInfo.specimenNo).subscribe(data => {
        if (data.length > 0) {
          console.log('[459]', data);
          this.recoverVariants = data;
          this.vd.push({ sequence: this.vd.length, selectedname: 'mutation', gene: data[0].gene });

          this.store.setDetactedVariants(data); // Detected variant 저장
          this.recoverVariants.forEach(item => {
            this.recoverVariant(item);  // 354
            // VUS 메제시 확인
            this.vusmsg = this.patientInfo.vusmsg;
            if (item.functional_impact === 'VUS') {
              this.vusstatus = true;
              this.store.setVUSStatus(this.vusstatus);
            }
          });

          // COMMENTS 가져오기
          // comments 분류
          if (data[0].comments !== 'none') {
            console.log('[479][INIT]', data[0].comments.gene, this.savedDataExist);
            this.comments.push(
              {
                gene: data[0].comments.gene, comment: data[0].comments.comment, reference: data[0].comments.reference,
                variant_id: data[0].comments.variants
              }
            );
            this.commentsRows().push(this.createCommentRow(data[0].comments));
            console.log('[487]', this.comments);
          }
          ///////////////////////////////////////////////////////////////
          this.putCheckboxInit(); // 체크박스 초기화

        } else {
          // this.addDetectedVariant();
        }
      });

      // 검사자 정보 가져오기
      // 저장된 검사자의 값이 있으면 표시
      this.analysisService.getAanlysisMDSInfo(this.form2TestedId)
        .subscribe(data => {
          console.log('[495][genetictest]', data);
          if (data.length > 0) {
            this.profile.leukemia = data[0].diagnosis;
            if (data[0].genetictest.length) {
              this.profile.genetictest = data[0].genetictest;
            } else {
              this.profile.genetictest = 'JAK2 V617F :' + this.patientInfo.genetic1 + '\n' + 'JAK2 exon 12 :' + this.patientInfo.genetic2 + '\n' + 'CALR :' + this.patientInfo.genetic3 + '\n' + 'MPL :' + this.patientInfo.genetic4;;
            }

            this.profile.chron = data[0].chromosomalanalysis;
          } else {
            this.profile.leukemia = this.patientInfo.leukemiaassociatedfusion;
            this.profile.genetictest = 'JAK2 V617F :' + this.patientInfo.genetic1 + '\n' + 'JAK2 exon 12 :' + this.patientInfo.genetic2 + '\n' + 'CALR :' + this.patientInfo.genetic3 + '\n' + 'MPL :' + this.patientInfo.genetic4;
            this.profile.chron = this.patientInfo.chromosomalanalysis;
          }
          this.store.setProfile(this.profile); // profile 저장
        });

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
        diagnosis: '',
        genetictest: '',
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


  addDetectedVariant(): void {
    this.subs.sink = this.patientsListService.mlpafiltering(this.form2TestedId, this.reportType, this.patientInfo.specimenNo)
      .subscribe(data => {
        console.log('[545]', this.reportType);
        console.log(data);
      });

  }


  // 검사일/검사보고일/수정보고일 관리
  setReportdaymgn(patientInfo: IPatient): void {
    // 전송횟수, 검사보고일, 수정보고일  저장
    // console.log('[487][검사일/검사보고일/수정보고일 관리]', patientInfo);
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
      this.subs.sink = this.utilsService.getListsDig('MDS')
        .subscribe(data => {
          this.examin = data[0].checker;
          this.recheck = data[0].reader;
        });
      /*
      const lists$ = this.utilsService.getDiagList()
        .pipe(shareReplay());

      lists$.pipe(
        map(lists => lists.filter(list => list.part === 'D'))
      ).subscribe(data => {
        const len = data.length - 1;
        data.forEach((list, index) => {
          if (index === len) {
            this.recheck = this.recheck + list.user_nm + ' M.D.';
          } else {
            this.recheck = this.recheck + list.user_nm + ' M.D./';
          }
        });
      });

      lists$.pipe(
        map(lists => lists.filter(list => list.part === 'T'))
      ).subscribe(data => {
        const len = data.length - 1;
        data.forEach((list, index) => {
          if (index === len) {
            this.examin = this.examin + list.user_nm + ' M.T.';
          } else {
            this.examin = this.examin + list.user_nm + ' M.T./';
          }
        });
      });
      */
    }

  }

  // tslint:disable-next-line: typedef
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // VUS 검사
  checkVue(): boolean {

    const idx = this.tsvLists.findIndex(item => item.loc1 === 'VUS');
    // console.log('[306][checkVue]', this.tsvLists, idx);
    if (idx === -1) {
      this.ment = '';
      return false;
    }
    return true;
  }

  // tslint:disable-next-line:typedef
  result(event) {
    console.log(event);
    this.resultStatus = event.srcElement.defaultValue;
    console.log('[629][라디오 검체]', this.resultStatus);
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
  addVarient(type: string, item: IAFormVariant, gene: string, coding: string, tsv: IFilteredTSV, count: string) {
    let tempvalue;
    let tempCount;
    if (parseInt(count, 10) > 1) {
      tempCount = count;
    } else {
      tempCount = '';
    }
    console.log('[658]', count, tempCount);

    if (type === 'M') {
      tempvalue = {
        igv: '',
        sanger: '',
        type,
        cnt: tempCount,
        gene,
        functionalImpact: item.functional_impact,
        transcript: tsv.transcript,
        exonIntro: 'E' + tsv.exon,
        nucleotideChange: coding,
        aminoAcidChange: tsv.amino_acid_change,
        // zygosity: item.zygosity,
        zygosity: 'Heterozygous',
        vafPercent: tsv.frequency,
        reference: item.reference,
        cosmic_id: item.cosmic_id,
        gubun: 'MDS'
      };

    } else {
      tempvalue = {
        igv: '',
        sanger: '',
        type,
        cnt: '',
        gene,
        functionalImpact: '',
        transcript: tsv.transcript,
        exonIntro: 'E' + tsv.exon,
        nucleotideChange: coding,
        aminoAcidChange: tsv.amino_acid_change,
        zygosity: 'Heterozygous',
        vafPercent: tsv.frequency,
        reference: '',
        cosmic_id: '',
        gubun: 'MDS'
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
    // this.putCheckboxInit(); // 체크박스 초기화
  }

  recoverVariant(item: IRecoverVariants): void {
    let tempvalue;
    if (parseInt(item.cnt, 10) < 2) {
      item.cnt = '';
    }

    tempvalue = {
      igv: item.igv,
      sanger: item.sanger,
      type: item.type,
      cnt: item.cnt,
      gene: item.gene,
      functionalImpact: item.functional_impact,
      transcript: item.transcript,
      exonIntro: item.exon,
      nucleotideChange: item.nucleotide_change,
      aminoAcidChange: item.amino_acid_change,
      zygosity: item.zygosity,
      vafPercent: item.vaf,
      reference: item.reference,
      cosmic_id: item.cosmic_id,
      checked: item.checked,
      id: item.id,
      gubun: 'MDS'
    };

    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.addNewRow(tempvalue);

    this.checkboxStatus = [];
    for (let i = 0; i < this.detactedVariants.length; i++) {
      this.checkboxStatus.push(i);
    }

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
  /////////////////////////////////////////////////////////////
  //
  createRow(item: IAFormVariant): FormGroup {
    let checktype: boolean;
    if (String(item.checked) === 'false') {
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
        transcript: [item.transcript],
        exonIntro: [item.exonIntro],
        nucleotideChange: [item.nucleotideChange],
        aminoAcidChange: [item.aminoAcidChange],
        zygosity: [item.zygosity],
        vafPercent: [item.vafPercent],
        reference: [item.reference],
        cosmic_id: [item.cosmic_id],
        id: [item.id],
        checked: [checktype],
        status: ['NEW'],
        gubun: ['MDS']
      });
    }
    return this.fb.group({
      igv: [item.igv],
      sanger: [item.sanger],
      type: [item.type],
      cnt: [item.cnt],
      gene: [item.gene],
      functionalImpact: [item.functionalImpact],
      transcript: [item.transcript],
      exonIntro: [item.exonIntro],
      nucleotideChange: [item.nucleotideChange],
      aminoAcidChange: [item.aminoAcidChange],
      zygosity: [item.zygosity],
      vafPercent: [item.vafPercent],
      reference: [item.reference],
      cosmic_id: [item.cosmic_id],
      id: [item.id],
      checked: [checktype],
      status: ['OLD'],
      gubun: ['MDS']
    });
  }

  addNewRow(row: IAFormVariant): void {
    // console.log('[544][addNewRow]', row);
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
  //////////////////////////////////////////////////////////////
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
      gubun: ['MDS']
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
      gubun: ['MDS']
    });
  }

  // tslint:disable-next-line: typedef
  addRow() {
    const rect = this.table.nativeElement.getBoundingClientRect();
    this.maxHeight = rect.height + 120;

    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.addTableRowGroup());
    this.addBoxStatus(control.length - 1); // 체크박스 추가

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
    // console.log(this.vd);
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
  // tslint:disable-next-line: typedef
  submit() {
    console.log(this.tablerowForm.value.tableRows);
  }

  // tslint:disable-next-line: typedef
  test() {
    console.log(this.ment);
  }



  // tslint:disable-next-line: typedef
  save(index: number) {
    console.log('[962][inhousee]', index, this.vd);

    const selected = this.vd.find(item => item.sequence === index);
    this.selectedItem = selected.selectedname;

    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];
    console.log('[969][저장] ', index, this.vd, selected, row);
    if (this.selectedItem === 'mutation') {
      this.subs.sink = this.patientsListService.saveMutation(
        'MDS',
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
        alert('mutation에 추가 했습니다.');
      });
    } else if (this.selectedItem === 'artifacts') {
      // console.log('[715][save][artifacts] ', row);
      this.subs.sink = this.patientsListService.insertArtifacts(
        'MDS',
        row.gene, '', '', row.transcript, row.nucleotideChange, row.aminoAcidChange
      ).subscribe((data: any) => {
        // console.log('[719][result][artifacts] ', data);
        alert('artifacts에 추가 했습니다.');

      });
    }

  }

  //////////////////////////////////////////////////////////////////////////////////////
  addComments(type: string): void {
    const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.comments = commentControl.getRawValue();
    from(this.comments)
      .pipe(
        concatMap(ment => this.commentsService.insertCommentsList(
          'MDS',
          '', ment.type, ment.gene, ment.variant_id, ment.comment, ment.reference, 'MDS'
        )),
        last()
      ).subscribe(data => {
        if (data) {
          alert('등록 되었습니다.');
        }
      });
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
    // console.log('[821][checkType][deleteRowStatus]', this.deleteRowStatus);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];

    const tempVD = [...this.vd];
    if (row.status === 'NEW') {
      // console.log('[840][checkType][row]', row);
      const idx = tempVD.findIndex(item => item.sequence === index && item.gene === row.gene);
      // console.log('===[826][checkType][type]', type, index, idx, row, this.vd, this.deleteRowNumber);
      if (idx === -1 && this.deleteRowNumber !== index) {
        this.vd.push({ sequence: index, selectedname: 'mutation', gene: row.gene });
        // console.log('####[842][checkType]', this.vd);
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

    // const control = this.tablerowForm.get('tableRows') as FormArray;
    // const formData = control.getRawValue();

    // const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    // this.comments = commentControl.getRawValue();

    // const result = confirm('스크린완료 전송하시겠습니까?');
    // if (result) {
    //   this.store.setRechecker(this.patientInfo.recheck);
    //   this.store.setExamin(this.patientInfo.examin);
    //   this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimenNo)
    //     .subscribe(datas => console.log(datas));
    //   this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimenNo)
    //     .subscribe(datas => console.log(datas));


    //   this.analysisService.putAnalysisMDS(
    //     this.form2TestedId,
    //     this.profile.leukemia,
    //     this.profile.genetictest,
    //     this.profile.chron).subscribe(data => console.log('MDS INSERT'));

    //   this.patientInfo.vusmsg = this.vusmsg;
    //   this.subs.sink = this.variantsService.screenInsert(this.form2TestedId, formData,
    //     this.comments, this.profile, this.resultStatus, this.patientInfo)
    //     .pipe(
    //       tap(data => {

    //         alert('저장되었습니다.');
    //       }),
    //       concatMap(() => this.patientsListService.getScreenStatus(this.form2TestedId))
    //     ).subscribe(msg => {

    //       this.screenstatus = msg[0].screenstatus;
    //     });
    // }

  }

  // 판독완료
  screenReadFinish(): void {
    const result = confirm('판독완료 전송하시겠습니까?');
    if (result) {
      this.screenstatus = '2';
      this.patientInfo.screenstatus = this.screenstatus;
      this.tempSave();
    }

    // const control = this.tablerowForm.get('tableRows') as FormArray;
    // const formData = control.getRawValue();

    // const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    // this.comments = commentControl.getRawValue();

    // const result = confirm('판독완료 전송하시겠습니까?');
    // if (result) {
    //   this.store.setRechecker(this.patientInfo.recheck);
    //   this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimenNo)
    //     .subscribe(datas => console.log(datas));
    //   this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimenNo)
    //     .subscribe(datas => console.log(datas));

    //   this.analysisService.putAnalysisMDS(
    //     this.form2TestedId,
    //     this.profile.leukemia,
    //     this.profile.genetictest,
    //     this.profile.chron).subscribe(data => console.log('MDS INSERT'));

    //   this.patientInfo.vusmsg = this.vusmsg;
    //   this.subs.sink = this.variantsService.screenUpdate(this.form2TestedId, formData, this.comments, this.profile, this.patientInfo)
    //     .subscribe(data => {

    //       alert('저장되었습니다.');
    //       this.patientsListService.getScreenStatus(this.form2TestedId)
    //         .subscribe(msg => {
    //           this.screenstatus = msg[0].screenstatus;
    //         });
    //     });
    // }

  }

  getStatus(index): boolean {
    // console.log('[834][getStatus]', index, this.screenstatus);
    if (index === 1) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }

    } else if (index === 2) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    } else if (index === 3) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    } else if (index === 4) {
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
    // console.log('[887][boxstatus][박스 상태]', this.checkboxStatus.sort());
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

  gotoEMR(): void {
    const userid = localStorage.getItem('diaguser');

    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    console.log('[1229][gotoEMR]', formData);
    if (this.checkboxStatus.length === 0) {
      this.checkboxRefill();
    }

    const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));
    // console.log('=== [1243][MDS][EMR로 보내기, 체크박스]', this.checkboxStatus);
    console.log('=== [1244][MDS][EMR로 보내기 DV]', reformData);
    // 코멘트가 있는경우
    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    } else {  // 코멘트가 신규인 경우
      this.comments = [];
    }

    // if (this.vusmsg.length === 0) {
    //   this.vusmsg = '';
    // }

    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
    }

    if (this.sendEMR >= 1) {
      this.lastReportDay = this.today().replace(/-/g, '.');
    }

    // console.log('[904][form2][comments] ', this.comments);

    // let tsvVersionContents;
    // if (this.tsvVersion === '510') {
    //   tsvVersionContents = this.methods;
    // } else if (this.tsvVersion === '516') {
    //   tsvVersionContents = this.methods516;
    // }
    if (!this.vusstatus) {
      this.vusmsg = '';
    }

    const makeForm = makeDForm(
      this.method,
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.profile,
      this.patientInfo.accept_date, // 검사의뢰일
      this.specimenMessage,
      this.fusion,
      this.vusmsg,   // this.ment,
      this.patientInfo,
      reformData,
      this.comments,
      this.firstReportDay,
      this.lastReportDay,
      this.genelists,
      this.methodmsg
    );
    console.log('[979][MDS XML] ', makeForm);
    const examcode = this.patientInfo.test_code;
    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      examcode,
      makeForm)
      .pipe(
        concatMap(() => this.patientsListService.resetscreenstatus(this.form2TestedId, '3', userid, 'MDS/MPN')),
        concatMap(() => this.patientsListService.setEMRSendCount(this.form2TestedId, ++this.sendEMR)), // EMR 발송횟수 전송
        // concatMap(() => this.patientsListService.getScreenStatus(this.form2TestedId))
      ).subscribe((msg: { screenstatus: string }) => {
        this.screenstatus = '3';
        alert('EMR로 전송했습니다.');
        // this.excelDV();
        // 환자정보 가져오기
        this.patientsListService.getPatientInfo(this.form2TestedId)
          .subscribe(patient => {
            // console.log('[999][MDS EMR][검체정보]', this.sendEMR, patient);
            // this.setReportdaymgn(patient);
          });
      });

  }

  putCheckboxInit(): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.detactedVariants.length; i++) {
      if (String(this.detactedVariants[i].checked) === 'true') {
        this.checkboxStatus.push(i);
      }
    }
    // console.log('[1316][putCheckboxInit]', this.detactedVariants);
    // console.log('[1317][putCheckboxInit]', this.checkboxStatus);
  }

  // detected varient 줄이 증가/삭제 시 체크상태 길이 변경
  addBoxStatus(idx: number): void {
    // this.checkboxStatus
    this.checkboxStatus.push(idx);
    // console.log('[1261] [행추가시 체크박스]', this.checkboxStatus, idx);
  }
  removeBoxStatus(i: number): void {
    // console.log('[1264]', this.checkboxStatus, i);
    const temp: number[] = [];
    this.checkboxStatus.forEach(val => {
      if (val > i) {
        temp.push(val - 1);
      } else if (val < i) {
        temp.push(val);
      }
    });
    this.checkboxStatus = temp;
    // console.log('[1273][삭제시 변경한 값]', this.checkboxStatus);
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

  previewToggle(): void {
    this.isVisible = !this.isVisible;
    // Detected variants 값을 store에 저장
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue() as IAFormVariant[];
    // console.log('[1129][form2][previewToggle][] ', formData);
    this.store.setDetactedVariants(formData);

    const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.comments = commentControl.getRawValue();
    if (this.comments.length > 0) {
      this.store.setComments(this.comments);
    }

  }

  excelDownload(): void {
    console.log('excel', this.tsvLists);
    this.excel.exportAsExcelFile(this.tsvLists, 'sample');
  }
  ///////////////////////////////////////////////////////////
  excelDV(): void {
    const excelData: IExcelData[] = [];
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();

    if (formData.length === 0) {
      excelData.push({
        tsvname: this.patientInfo.tsvFilteredFilename,
        name: this.patientInfo.name,
        gender: this.patientInfo.gender,
        age: this.patientInfo.age,
        patientID: this.patientInfo.patientID,
        acceptdate: this.patientInfo.accept_date,
        reportdate: this.today2(),
        testcode: this.reportType,
        gene: '',
        functionalImpact: '',
        transcript: '',
        exonIntro: '',
        nucleotideChange: '',
        aminoAcidChange: '',
        zygosity: '',
        vafPercent: '',
        reference: '',
        cosmic_id: ''
      });
    } else {

      formData.forEach(item => {
        excelData.push({
          name: this.patientInfo.name,
          gender: this.patientInfo.gender,
          age: this.patientInfo.age,
          acceptdate: this.patientInfo.accept_date,
          reportdate: this.today2(),
          testcode: 'MDS/MPN',
          patientID: this.patientInfo.patientID,
          gene: item.gene,
          functionalImpact: item.functionalImpact,
          transcript: item.transcript,
          exonIntro: item.exonIntro,
          nucleotideChange: item.nucleotideChange,
          aminoAcidChange: item.aminoAcidChange,
          zygosity: item.zygosity,
          vafPercent: item.vafPercent,
          reference: item.reference,
          cosmic_id: item.cosmic_id,
          tsvname: this.patientInfo.tsvFilteredFilename

        });
      });
    }

    this.subs.sink = this.excelService.excelInsert(excelData, this.patientInfo.specimenNo)
      .subscribe((data: { message: string }) => {
        // console.log('입력요청에 대한 응답: ', data.message);
        if (data.message === 'SUCCESS') {
          this.snackBar.open('저장 했습니다.', '닫기', { duration: 3000 });
        } else {
          this.snackBar.open('저장하지 못했습니다.', '닫기', { duration: 3000 });
        }
      });

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
  today2(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const hour = today.getHours();
    const min = today.getMinutes();
    const sec = today.getSeconds();

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday + ' ' + hour + ':' + min + ':' + sec;

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
    // console.log('[1037][tempSave]');
    const userid = localStorage.getItem('diaguser');
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    // console.log('[1040][tableerowForm]', formData);
    // console.log('[1041][checkbox]', this.checkboxStatus);
    // const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));
    console.log('[1450][Detected variants]', formData);
    // if (this.comments.length) {
    const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.comments = commentControl.getRawValue();
    // }
    // this.store.setComments(this.comments);
    console.log('[1456][Detected variants]', this.comments);
    this.patientInfo.recheck = this.recheck;
    this.patientInfo.examin = this.examin;
    this.patientInfo.vusmsg = this.vusmsg;
    console.log('[1054][tempSave]patient,reform,comment]', this.patientInfo, formData, this.comments);

    this.store.setRechecker(this.patientInfo.recheck);
    this.store.setExamin(this.patientInfo.examin);
    this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimenNo)
      .subscribe(datas => console.log(datas));
    this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimenNo)
      .subscribe(datas => console.log(datas));
    // MDS 분석 보내기
    // diagnosis: string,
    // genetictest: string,
    // chromosomalanalysis: string
    this.analysisService.putAnalysisMDS(
      this.form2TestedId,
      this.profile.leukemia,
      this.profile.genetictest,
      this.profile.chron).subscribe(data => console.log('MDS INSERT'));
    // tslint:disable-next-line:max-line-length
    this.subs.sink = this.variantsService.screenTempSave(this.form2TestedId, formData, this.comments, this.profile, this.resultStatus, this.patientInfo)
      .subscribe(data => {
        // console.log('[1065]', data);
        this.patientsListService.changescreenstatus(this.form2TestedId, this.screenstatus, userid, 'MDS')
          .subscribe();
        alert('저장되었습니다.');
      });
  }

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

    this.patientsListService.resetscreenstatus(this.form2TestedId, '2', userid, this.reportType)
      .subscribe(data => {
        this.screenstatus = '2';
        this.patientInfo.screenstatus = '2';

      });
  }


  //
  findMutationBygene(gene: string): void {
    // console.log('[1146][findMutationBygene]', this.resultStatus);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    // console.log('[1150][tableerowForm]', formData);
    this.patientsListService.findMutationBygene(gene)
      .subscribe(data => {
        console.log('[1148][findMutationBygene]', data);
        if (data === 0) {
          this.resultStatus = 'Not Detected';
        } else {
          this.resultStatus = 'Detected';
        }
      });
  }
  /////////////////////////////////////////////////////////////////////
  onDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.getFormControls(), event.previousIndex, event.currentIndex);
    this.getFormControls().forEach((user, idx) => {
      user.order = idx + 1;
    });
  }
  ////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////
  droped(event: CdkDragDrop<string[]>): void {
    // this.formArray = this.ifusionLists()
    const from1 = event.previousIndex;
    const to = event.currentIndex;
    // console.log(event);
    //  console.log('[1246][droped]', from1, to);
    this.vd.forEach(item => {
      if (item.sequence === from1) {
        item.sequence = to;
      }
    });
    const control = this.tablerowForm.get('tableRows') as FormArray;
    // this.moveItemInFormArray(control, from1, to);
    this.moveItemInDetectedArray(control, from1, to);
  }
  ////////////////////////////////////////////////////////////////////////
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


  ///////////////////////////////////////////////////////////////////////////
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
  ////////////////////////////////////////////////////////////



  //////////////////////////////////////////////////////////////////////
  // detected variant 정렬
  dvSort(): void {

    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();

    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    // this.store.setComments(this.comments);

    this.patientInfo.recheck = this.recheck;
    this.patientInfo.examin = this.examin;
    this.patientInfo.vusmsg = this.vusmsg;

    this.store.setRechecker(this.patientInfo.recheck);
    this.store.setExamin(this.patientInfo.examin);
    this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimenNo)
      .subscribe(datas => console.log(datas));
    this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimenNo)
      .subscribe(datas => console.log(datas));

    if (this.reportType === 'MDS') {
      this.analysisService.putAnalysisAML(
        this.form2TestedId,
        this.profile.leukemia,
        this.profile.genetictest,
        this.profile.chron).subscribe(data => console.log('MDS INSERT'));
    }


    // tslint:disable-next-line:max-line-length
    this.variantsService.screenTempSave2(this.form2TestedId, formData, this.comments, this.profile, this.resultStatus, this.patientInfo)
      .pipe(
        concatMap(() => this.variantsService.screenSelect(this.form2TestedId))
      ).subscribe(data => {
        this.vd = [];
        this.checkboxStatus = [];
        this.detactedVariants = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < formData.length; i++) {
          this.deleteRow(0);
        }

        this.recoverVariants = data;
        this.recoverVariants.forEach((list, index) => this.vd.push({ sequence: index, selectedname: 'mutation', gene: list.gene }));
        // console.log('[1925][form2][Detected variant_id]', this.recoverVariants);
        this.store.setDetactedVariants(data); // Detected variant 저장
        this.recoverVariants.forEach(item => {
          this.recoverVariant(item);
        });
        this.putCheckboxInit(); // 체크박스 초기화
      });

  }

  tsvFileVersion(tsvfile: string): void {
    // const lists = tsvfile.split('_');
    // if (lists.length > 3) {
    //   const ver = lists[3].split('-')[0];
    if (tsvfile === '5.16') {
      this.tsvVersion = '516';
    } else if (tsvfile === '5.10') {
      this.tsvVersion = '510';
    }
  }

  //////////////////////////////////////////////////////////
  goBack(): void {
    this.router.navigate(['/diag', 'mdsmpn']);
  }
  ////////////////////////////////////////////////////////////
  ///
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

  /////////////////////////////////////////////////////////////////
  colorType(i: number): any {
    if (this.typeColor.includes(i)) {
      return { color: 'red', 'font-weight': 600 };
    }
    return;
  }

  reCall(): void {
    let count = 0;
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData: IAFormVariant[] = control.getRawValue();
    // console.log('[1776][호출][보낸것]', formData);
    formData.forEach((list, index) => {
      const gene = list.gene.split(',');
      gene.forEach(item => {
        this.patientsListService.getMutationVariantsLists(item, list.nucleotideChange, 'MDS')
          .pipe(
            filter(val => !!val),
            tap(data => {
              if (data.length > 0) {
                if (list.reference !== data[0].reference || list.cosmic_id !== data[0].cosmic_id) {
                  count++;
                  this.snackBar.open('완료 했습니다. 갱신수: ' + count + '건', '닫기', { duration: 3000 });
                }
              }
            })
          )
          .subscribe(data => {
            console.log('[1823][호출][받은데이터]', data);
            if (data.length > 0) {

              if (
                (list.reference !== data[0].reference || list.cosmic_id !== data[0].cosmic_id)) {
                this.typeColor.push(index);
              }

              control.at(index).patchValue({
                // type: data[0].type,
                type: 'M',
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
