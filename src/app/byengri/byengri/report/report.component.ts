import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Items } from '@clr/angular/data/datagrid/providers/items';
import { Observable, combineLatest, concat, partition, of } from 'rxjs';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
import { filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import * as converter from 'xml-js';
import { SubSink } from 'subsink';
import { makeReport } from '../../models/dataset';
import {
  IAmplification, IBasicInfo, IExtraction, IFilteredOriginData,
  IFusion, IGeneTire, IGENO, IIAmplification, IList, IMent, IMutation, IPatient, Ipolymorphism, IStateControl
} from '../../models/patients';
import { FilteredService } from '../../services/filtered.service';
import { PathologyService } from '../../services/pathology.service';
import { PathologySaveService } from '../../services/pathologysave.service';
import { SearchService } from '../../services/search.service';
import { StorePathService } from '../../store.path.service';
import { mentlists } from '../special-ment';
// import { clinically, msiScore, patientInfo, prevalent, tsvData, tumorcellpercentage, tumorMutationalBurden, tumortype } from './BACKUP/mockData';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationServie } from 'src/app/services/navigation.service';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { essentialDNAMentList } from '../essensDNAMent';
import { ReportDialogComponent } from './report-dialog/report-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SequencingService } from '../../services/sequencing.service';
import * as moment from 'moment';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('examine', { static: true }) examine: ElementRef;
  @ViewChild('rechecked', { static: true }) rechecked: ElementRef;
  @ViewChild('report', { static: true }) report: HTMLTextAreaElement;
  @ViewChild('diagnosis', { static: true }) diagnosis: HTMLTextAreaElement;

  polymorphismList: Ipolymorphism[];

  ments: IMent[] = mentlists;
  private subs = new SubSink();
  doctor: string;
  engineer: string;
  filteredOriginData: IFilteredOriginData[] = [];
  index: number;
  patientInfo: IPatient;
  muTier: string;
  ampTier: string;
  fuTier: string;
  clinically = [];
  tempClinically: { clinically: string, seq: string }[] = [];
  clinical: IGeneTire[] = [];
  tempPrevalent: { prevalent: string, seq: string }[] = [];
  prevalent = [];
  status = false;
  screenstatus: string;
  pathologyNum: string;  // 검체번호
  basicInfo: IBasicInfo = {
    name: '',
    registerNum: '',
    gender: '',
    pathologyNum: ''
  };

  basicInfoEMR: IBasicInfo = {
    name: '',
    registerNum: '',
    gender: '',
    pathologyNum: ''
  };

  dnanrna: string; // DNA and RNA extraction
  organ: string; // Organ

  // 검체정보
  extraction: IExtraction = {
    dnarna: '',
    managementNum: '',
    keyblock: '',
    tumorcellpercentage: '',
    organ: '',
    tumortype: '',
    diagnosis: '',
    msiscore: '',
    tumorburden: '',
  };

  extractionEMR: IExtraction = {
    dnarna: '',
    managementNum: '',
    keyblock: '',
    tumorcellpercentage: '',
    organ: '',
    tumortype: '',
    diagnosis: '',
    msiscore: '',
    tumorburden: '',
  };

  // 정도관리
  stateControl: IStateControl = {
    dnaRnasep: '',
    rna18s: '',
    averageBase: '',
    uniformity: '',
    meanRead: '',
    meanRaw: '',
    mapd: '',
    rnaMapped: ''
  };

  muLists = [
    'truncating', 'hotspot',
'egfrexon19deletion', 'egfrexon20insertion', 'erbb2exon20insertion', 'metexon14skipping'
  ];
  amLists = [
    'amplification', 'deletion', 'exondeletion'
  ];

  fuLists = [
    'fusion', 'rnaexonvariants', 'expressionimbalance', 'rnaexontiles'
  ];

  mutation: IMutation[] = []; // 0: "ERBB2 p.(I655V) c.1963A>G" 양식으로 된것
  amplifications: IAmplification[] = [];
  fusion: IFusion[] = [];
  mutationNew: IMutation[] = []; // 0: "ERBB2 p.(I655V) c.1963A>G" 양식으로 된것
  amplificationsNew: IAmplification[] = [];
  fusionNew: IFusion[] = [];
  imutation: IMutation[] = [];
  iamplifications: IIAmplification[] = [];
  ifusion: IFusion[] = [];

  mutationEMR: IMutation[] = []; // 0: "ERBB2 p.(I655V) c.1963A>G" 양식으로 된것
  amplificationsEMR: IAmplification[] = [];
  fusionEMR: IFusion[] = [];
  imutationEMR: IMutation[] = [];
  iamplificationsEMR: IIAmplification[] = [];
  ifusionEMR: IFusion[] = [];

  tumorMutationalBurden = '';
  msiScore = '';
  tumorcellpercentage: string;

  tumorMutationalBurdenEMR: string;
  msiScoreEMR: string;
  tumorcellpercentageEMR: string;

  examedno = 'none';  // 기사 ID
  examedname = 'none'; // 기사 이름
  checkeredno = 'none'; // 의사 ID
  checkername = 'none'; // 의사 이름
  examednoEMR: string;  // 기사 ID
  examednameEMR: string; // 기사 이름
  checkerednoEMR: string; // 의사 ID
  checkernameEMR: string; // 의사 이름

  examin = ''; // 검사자
  examinSeq: number;

  pathimage: string[] = []; // 이미지 url

  recheck = ''; // 확인자
  // recheckSeq: number;

  mt: IList[]; // 기사
  dt: IList[]; // 의사
  loginID: string; // 병리사 로그인
  generalReport = ``;  // 해석적 보고
  specialment = ``; // genes were not found
  //25.01.30
  //본 검체에서 추출 된 RNA는 일부 QC를 만족하지 못하여 51개의 유전자(AKT2, ALK, AR, AXL, BRCA1, BRCA2, BRAF, CDKN2A, EGFR, ERBB2, ERBB4, ERG, ESR1, ETV1, ETV4, ETV5, FGFR1, FGFR2, FGFR3, FGR, FLT3, JAK2, KRAS, MDM4, MET, MYB, MYBL1, NF1, NOTCH1, NOTCH4, NRG1, NTRK1, NTRK2, NTRK3, NUTM1, PDGFRA, PDGFRB, PIK3CA, PRKACA, PRKACB, PTEN, PPARG, RAD51B, RAF1, RB1, RELA, RET, ROS1, RSPO2, RSPO3, TERT)에 대한 fusion은 확인 할 수 없었습니다. 결과에 참고하시기 바랍니다.
  notement = `[NOTE1]
  본 검체에서 추출 된 RNA는 일부 QC를 만족하지 못하여 49개의 유전자(AKT1, AKT2, AKT3, ALK, AR, BRAF, BRCA1, CDKN2A, EGFR, ERBB2, ERBB4, ERG, ESR1, ETV1, ETV4, ETV5, FGFR1, FGFR2, FGFR3, MAP3K8, MET, MTAP, MYB, MYBL1, NOTCH1, NOTCH2, NOTCH3, NRG1, NTRK1, NTRK2, NTRK3, NUTM1, PIK3CA, PIK3CB, PPARG, PRKACA, PRKACB, RAF1, RARA, RELA, RET, ROS1, RSPO2, RSPO3, STAT6, TERT, TFE3, TFEB, YAP1)에 대한 fusion은 확인 할 수 없었습니다. 결과에 참고하시기 바랍니다. 

  [NOTE2]
종양세포밀도가 50% 미만(XX%)의 검체에서 얻어진 결과이므로, amplification 해석에 주의가 필요합니다.
* Deletion의 경우 이미지 보고서를 참고해 주시기 바랍니다.`; // note

//25.01.30
  //  본 검체에서 추출 된 RNA는 일부 QC를 만족하지 못하여 51개의 유전자(AKT2, ALK, AR, AXL, BRCA1, BRCA2, BRAF, CDKN2A, EGFR, ERBB2, ERBB4, ERG, ESR1, ETV1, ETV4, ETV5, FGFR1, FGFR2, FGFR3, FGR, FLT3, JAK2, KRAS, MDM4, MET, MYB, MYBL1, NF1, NOTCH1, NOTCH4, NRG1, NTRK1, NTRK2, NTRK3, NUTM1, PDGFRA, PDGFRB, PIK3CA, PRKACA, PRKACB, PTEN, PPARG, RAD51B, RAF1, RB1, RELA, RET, ROS1, RSPO2, RSPO3, TERT)에 대한 fusion은 확인 할 수 없었습니다. 결과에 참고하시기 바랍니다.
  notement2 = `[NOTE1]
  본 검체에서 추출 된 RNA는 일부 QC를 만족하지 못하여 49개의 유전자(AKT1, AKT2, AKT3, ALK, AR, BRAF, BRCA1, CDKN2A, EGFR, ERBB2, ERBB4, ERG, ESR1, ETV1, ETV4, ETV5, FGFR1, FGFR2, FGFR3, MAP3K8, MET, MTAP, MYB, MYBL1, NOTCH1, NOTCH2, NOTCH3, NRG1, NTRK1, NTRK2, NTRK3, NUTM1, PIK3CA, PIK3CB, PPARG, PRKACA, PRKACB, RAF1, RARA, RELA, RET, ROS1, RSPO2, RSPO3, STAT6, TERT, TFE3, TFEB, YAP1)에 대한 fusion은 확인 할 수 없었습니다. 결과에 참고하시기 바랍니다. 

  [NOTE2]
  종양세포밀도가 50% 미만(XX%)의 검체에서 얻어진 결과이므로, amplification 해석에 주의가 필요합니다.
  * Deletion의 경우 이미지 보고서를 참고해 주시기 바랍니다.

  [NOTE3]
  본 검체는 copy number variation 분석에 필요한 Q.C를 만족하지 못하여 amplification은 확인할 수 없습니다. 결과에 참고하시기 바랍니다.`;

  //25.01.30
  //  본 검체에서 추출 된 RNA는 일부 QC를 만족하지 못하여 49개의 유전자(AKT1, AKT2, AKT3, ALK, AR, BRAF, BRCA1, CDKN2A, EGFR, ERBB2, ERBB4, ERG, ESR1, ETV1, ETV4, ETV5, FGFR1, FGFR2, FGFR3, MAP3K8, MET, MTAP, MYB, MYBL1, NOTCH1, NOTCH2, NOTCH3, NRG1, NTRK1, NTRK2, NTRK3, NUTM1, PIK3CA, PIK3CB, PPARG, PRKACA, PRKACB, RAF1, RARA, RELA, RET, ROS1, RSPO2, RSPO3, STAT6, TERT, TFE3, TFEB, YAP1)에 대한 fusion은 확인 할 수 없었습니다. 결과에 참고하시기 바랍니다.
  notement3 = `[NOTE]
  본 검체에서 추출 된 RNA는 일부 QC를 만족하지 못하여 49개의 유전자(AKT1, AKT2, AKT3, ALK, AR, BRAF, BRCA1, CDKN2A, EGFR, ERBB2, ERBB4, ERG, ESR1, ETV1, ETV4, ETV5, FGFR1, FGFR2, FGFR3, MAP3K8, MET, MTAP, MYB, MYBL1, NOTCH1, NOTCH2, NOTCH3, NRG1, NTRK1, NTRK2, NTRK3, NUTM1, PIK3CA, PIK3CB, PPARG, PRKACA, PRKACB, RAF1, RARA, RELA, RET, ROS1, RSPO2, RSPO3, STAT6, TERT, TFE3, TFEB, YAP1)에 대한 fusion은 확인 할 수 없었습니다. 결과에 참고하시기 바랍니다. 
  `;
  notecontents = '';


  generalReportEMR: string;
  specialmentEMR: string;
  notementEMR: string;
  noneMu = 'None';
  noneAm = 'None';

  // msgAm = `* Deletion의 경우 이미지 보고서를 참고해 주시기 바랍니다.`;
  imagemsg = '';
  noneFu = 'None';
  noneIMu = 'None';
  noneIAm = 'None';
  noneIFu = 'None';
  barcodefont = 'gulim';

  dnaVersion52 = false;
  dnaVersion518 = false;
  ionReporter = '';
  oncomineReporter = '';


  constructor(
    private pathologyService: PathologyService,
    private router: Router,
    private savepathologyService: PathologySaveService,
    private searchService: SearchService,
    private fb: FormBuilder,
    private store: StorePathService,
    private route: ActivatedRoute,
    private filteredService: FilteredService,
    private sanitizer: DomSanitizer,
    private navigationServie: NavigationServie,
    public dialog: MatDialog,
    private sequencingService: SequencingService,
  ) {
    this.getParams();
  }

  mutationForm: FormGroup;
  amplificationsForm: FormGroup;
  fusionForm: FormGroup;
  imutationForm: FormGroup;
  iamplificationsForm: FormGroup;
  ifusionForm: FormGroup;
  msiTag = false;
  reportday: string;
  genoLists: IGENO[] = [];
  // <a [href]="fileUrl" download="file.txt">DownloadFile</a>
  // this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl()

  ngOnInit(): void {
    // this.pathologyService.getPatientList().subscribe();
    // 로그인
    const user = JSON.parse(localStorage.getItem('pathuser'));
    this.loginID = user.userid;

    this.loadForm();
    this.checker();
    //  this.essentialMent();
  }


  ngAfterViewInit(): void {
    // this.checker();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  back(): void {
    this.navigationServie.back();
  }

  getParams(): void {
    this.filteredService.getPolymorphism()
      .subscribe(data => {
        this.polymorphismList = data;

      });

    // tslint:disable-next-line:no-string-literal
    this.patientInfo = this.route.snapshot.data['patientinfo'];

    this.route.paramMap.pipe(
      map(route => route.get('id')),
      take(1)
    ).subscribe(pathologyNum => {

      this.pathologyNum = pathologyNum; // 검체번호 저장
      // console.log('[284] ===> ', this.pathologyService.patientInfo);
      try {
        this.patientInfo = this.pathologyService.patientInfo.filter(item => item.pathology_num === pathologyNum)[0];
      } catch (err) {
        console.log(err);
      }
      console.log('[296][환자정보] ', this.patientInfo);
      if (this.patientInfo.sw_ver === "1") {
         this.ionReporter = 'v5.18'; this.oncomineReporter = 'v5.6.0';
         this.dnaVersion518 = true; this.dnaVersion52= false;
      } else if (this.patientInfo.sw_ver == "2") {
        this.ionReporter = 'v5.20'; this.oncomineReporter = 'v5.7';
        this.dnaVersion518 = false; this.dnaVersion52= true;
      } else if (this.patientInfo.sw_ver == "3") {
        this.ionReporter = 'v5.20'; this.oncomineReporter = 'v5.8';
        this.dnaVersion518 = false; this.dnaVersion52= true;      
      } else if (this.patientInfo.sw_ver == "4") {  // 24.06.11 Oncomine reporter version 변경
        this.ionReporter = 'v5.20'; this.oncomineReporter = 'v5.9';
        this.dnaVersion518 = false; this.dnaVersion52= true;
      }
 


      this.searchService.howManyImages(this.pathologyNum)
        .subscribe(data => {
          if (Number(data.count) > 0) {
            this.imagemsg = '이미지 파일 확인됨';
          } else {
            this.imagemsg = '이미지 파일 현재 없음';
          }
        });


      this.init(pathologyNum);
    });
  }

  getUrl(): SafeResourceUrl {
    const url = 'http://10.10.55.140:3729/';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }



  init(pathologyNum: string): void {
    // filtered 된 디비에서 가져옴
    if (parseInt(this.patientInfo.screenstatus, 10) >= 1) {
      // 서비스에서 저장된 값을 가져온다.
      this.status = true;
      // 현재 상태정보 1: 저장, 3:EMR전송, 0: 시작
      this.screenstatus = this.patientInfo.screenstatus;


      // 저장일
      const tempReportday = this.patientInfo.report_date.slice(0, 10);
       
      console.log('=== [281][1900-01-01]', tempReportday, this.reportday);
      console.log('=== [281][1900-01-01]', this.screenstatus);
      
      if (parseInt(this.screenstatus, 10) === 1) {
        if (this.patientInfo.report_date === null || this.patientInfo.report_date === '' ||
          tempReportday === '1900-01-01') {
          this.reportday = this.today();
          // console.log('=== [281][1900-01-01]', tempReportday, this.reportday);
        } else {
          this.reportday = this.patientInfo.report_date.replace(/-/g, '.'); // 저장일
        }
      } else if (parseInt(this.screenstatus, 10) === 3) {
        if (this.patientInfo.sendEMRDate.toString() === null || this.patientInfo.sendEMRDate.toString() === '') {
          this.reportday = this.today();
        } else {
          this.reportday = this.patientInfo.sendEMRDate.toString().slice(0, 10).replace(/-/g, '.'); // EMR 전송일
        }
      } else {
        //25.04.28
        //this.reportday = this.today();
        if (this.patientInfo.sendEMRDate.toString() === null || this.patientInfo.sendEMRDate.toString() === '') {
          this.reportday = this.today();
        } else {
          this.reportday = this.patientInfo.sendEMRDate.toString().slice(0, 10).replace(/-/g, '.'); // EMR 전송일
        }
      }

      // 검체정보
      // console.log('[216][환자정보], ', this.patientInfo);
      this.extraction.dnarna = 'FFPE tissue';
      this.extraction.managementNum = this.patientInfo.rel_pathology_num;
      // console.log('[216]', this.patientInfo.key_block);
      if (this.patientInfo.key_block === undefined || this.patientInfo.key_block === null) {
        this.extraction.keyblock = '';
      } else if (this.patientInfo.key_block.length > 0) {
        // this.extraction.keyblock = this.patientInfo.key_block;
        const firstChar = this.patientInfo.key_block.charAt(0);
        if (firstChar === '#') {
          this.extraction.keyblock = this.patientInfo.key_block;
        } else {
          this.extraction.keyblock = '#' + this.patientInfo.key_block;
        }
      } else {
        this.extraction.keyblock = '';
      }

      if (this.patientInfo.tumor_cell_per === undefined || this.patientInfo.tumor_cell_per === null) {
        this.extraction.tumorcellpercentage = '';
      } else {
        this.extraction.tumorcellpercentage = this.patientInfo.tumor_cell_per; // 공백 없앰
      }

      if (this.extraction.organ === undefined || this.extraction.organ === null) {
        this.extraction.organ = '';
      } else {
        this.extraction.organ = this.patientInfo.organ;
      }

      if (this.extraction.tumortype === undefined || this.extraction.tumortype === null) {
        this.extraction.tumortype = '';
      } else {
        this.extraction.tumortype = this.patientInfo.tumor_type;
      }

      if (this.patientInfo.pathological_dx === undefined || this.patientInfo.pathological_dx === null) {
        this.extraction.diagnosis = '';
      } else {
        this.extraction.diagnosis = this.patientInfo.pathological_dx;
      }

      if (this.patientInfo.tumorburden.length === 0) { // 2022.11.24 추가
         this.tumorMutationalBurden = 'row';
      } else {
        this.tumorMutationalBurden = this.patientInfo.tumorburden;
      }

      this.extraction.tumorburden = this.tumorMutationalBurden;

      if (this.patientInfo.msiscore.split('').includes('(')) {
        this.msiTag = true;
      }
      // console.log('[345][msi 값]:', this.patientInfo.msiscore.split('').includes('('));
      this.msiScore = this.patientInfo.msiscore;
      this.extraction.msiscore = this.msiScore;
      console.log('[384][검체정보]', this.extraction);
      // 검체 검사자,확인자
      this.examin = this.patientInfo.examin; // 기사
      const exam = this.patientInfo.examin.split('_');
      this.examedno = exam[0];
      this.examedname = exam[1];
      this.recheck = this.patientInfo.recheck; // 의사
      const reck = this.patientInfo.recheck.split('_');
      this.checkeredno = reck[0];
      this.checkername = reck[1];

      this.basicInfo.name = this.patientInfo.name;
      this.basicInfo.registerNum = this.patientInfo.patientID;
      this.basicInfo.gender = this.patientInfo.gender;
      this.basicInfo.pathologyNum = this.patientInfo.pathology_num;
      this.basicInfo.age = this.patientInfo.age;


      this.getDataFromDB(this.patientInfo);

    } else if (parseInt(this.patientInfo.screenstatus, 10) === 0) {  // tsv에서 데이타 가져옴

      const tempReportday = this.patientInfo.report_date.slice(0, 10);
      if (tempReportday === '1900-01-01' || this.patientInfo.report_date === '') {
        this.reportday = this.today();
      }

      this.initByDB(pathologyNum);

    }
    // this.essentialMent();
  }

  loadForm(): void {
    this.mutationForm = this.fb.group({
      mutationLists: this.fb.array([]),
    });

    this.amplificationsForm = this.fb.group({
      amplificationsLists: this.fb.array([]),
    });


    this.fusionForm = this.fb.group({
      fusionLists: this.fb.array([]),
    });

    this.imutationForm = this.fb.group({
      imutationLists: this.fb.array([]),
    });

    this.iamplificationsForm = this.fb.group({
      iamplificationsLists: this.fb.array([]),
    });

    this.ifusionForm = this.fb.group({
      ifusionLists: this.fb.array([]),
    });
  }

  checker(): void {

    this.report.selectionEnd = 200;

    // 이미지 파일 있는지 확인
    // const howmanyimages$ = this.searchService.howManyImages(pathologyNo);

    const medi$ = this.searchService.listPath().pipe(
      shareReplay()
    );

    const mt$ = medi$.pipe(
      map(lists => lists.filter(list => list.part === 'T'))
    ).subscribe(mt => {
      this.mt = mt;


      if (Number(this.patientInfo.screenstatus) === 0) {
        this.mt.forEach(data => {
          if (data.user_id === this.loginID) {
            this.examedname = data.user_nm;
            this.examedno = data.user_id;

            this.patientInfo.examin = data.user_id + '_' + data.user_nm;
            this.examin = data.user_id + '_' + data.user_nm;

          }
        });
      }

    });

    const dt$ = medi$.pipe(
      map(lists => lists.filter(list => list.part === 'D')),
    ).subscribe(dt => {
      this.dt = dt;

    });

  }



  getDataFromDB(info: IPatient): void {
    const pathologyNo = info.pathology_num;
    // console.log('[272][report][ getDataFromDB][] ', pathologyNo);
    this.searchService.getPathmentlist(pathologyNo)
      .subscribe(data => {
        console.log('[484][멘트리스트][]', data);
        if (data.message !== 'no data') {
          this.generalReport = data[0].generalReport;
          this.specialment = data[0].specialment;
          // this.notement = data[0].notement;
          this.notecontents = data[0].notement;
        }
      });

    ///////////////// Relevant Biomarkers
    this.subs.sink = this.filteredService.getGemonic(pathologyNo)
      .subscribe(gemoicVal => {
        if (gemoicVal.length) {
          this.genoLists = gemoicVal;
        }
      });

    ///////////////////////////////////////
    this.subs.sink = this.searchService.getMutationC(pathologyNo) // mutation 리스트
      .subscribe(data => {
        console.log('[500][mutation]', data);
        if (data.message !== 'no data') {
          let tempmu;
          if (data.length > 1) {
            tempmu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempmu = data;
          }
          tempmu.forEach((item, index) => {
            this.mutation.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
              seq: index,
              transcript: item.transcript
            });
            ////////////////////////////////////////////
            this.mutationLists().push(this.createMutaion({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
              transcript: item.transcript
            }, index));
          });
        } else {
          this.mutation = [];
        }
      });

    this.subs.sink = this.searchService.getAmplificationC(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempam;
          if (data.length > 1) {
            tempam = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempam = data;
          }
          tempam.forEach((item, index) => {
            this.amplifications.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              tier: item.tier,
              seq: index
            });

            this.amplificationsLists().push(this.createAmplifications({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              tier: item.tier
            }, index));

          });
        } else {
          this.amplifications = [];
        }
      });

    this.subs.sink = this.searchService.getFusionC(pathologyNo)
      .subscribe(data => {
        console.log('[562][FusionC]', data);
        if (data.message !== 'no data') {
          let tempfu;
          if (data.length > 1) {
            tempfu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempfu = data;
          }
          tempfu.forEach((item, index) => {
            this.fusion.push({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              readcount: item.readcount,
              functions: item.fusion_function,
              tier: item.tier
            });

            this.fusionLists().push(this.createFusion({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              functions: item.fusion_function,
              readcount: item.readcount,
              tier: item.tier
            }, index));
          });
        } else {
          this.fusion = [];
        }
      });

    this.subs.sink = this.searchService.getMutationP(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempimu;
          if (data.length > 1) {
            tempimu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempimu = data;
          }
          tempimu.forEach((item, index) => {

            this.imutation.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
              transcript: item.transcript
            });
            this.imutationLists().push(this.createIMutaion({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
              seq: item.index,
              transcript: item.transcript
            }, index));
          });

        } else {
          this.imutation = [];
        }
      });

    this.subs.sink = this.searchService.getAmplificationP(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempiam;
          if (data.length > 1) {
            tempiam = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempiam = data;
          }
          tempiam.forEach((item, index) => {
            this.iamplifications.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              note: item.note
            });

            this.iamplificationsLists().push(this.createIAmplifications({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              note: item.note
            }, index));

          });
        } else {
          this.iamplifications = [];
        }
      });

    this.subs.sink = this.searchService.getFusionP(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempifu;
          if (data.length > 1) {
            tempifu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempifu = data;
          }
          tempifu.forEach((item, index) => {
            // console.log('[425]', item, item.gene, item.fusion_breakpoint, item.fusion_function, item.tier);
            this.ifusion.push({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              readcount: item.readcount,
              functions: item.fusion_function,
              tier: item.tier
            }, index);

            this.ifusionLists().push(this.createIFusion({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              readcount: item.readcount,
              functions: item.fusion_function,
              tier: item.tier,
            }, index));
          });
        } else {
          this.ifusion = [];
        }
      });

    this.subs.sink = this.filteredService.getStatecontrol(pathologyNo)
      .subscribe(data => {
        console.log('[715][저장된정도관리] ==> ', data);
        if (data.length !== null && data.length !== 0 && data.length !== undefined) {
          this.stateControl = data[0];
        }
      });
  }

  // tsv 화일에서 분류한 것을 디비에 저장후, 디비에서 불러온것
  initByDB(pathologynum: string): void {
    let tumortypes;
    const deletion = '';
    // console.log('[663][initByDB][tsv화일 올린후]', pathologynum);
    this.reportday = this.today();
    const filteredOriginaData$ = this.filteredService.getfilteredOriginDataList(pathologynum)
      .pipe(
        tap(itemlists => console.log('[725][filteredOriginaData]', itemlists)),
        // map((orgitems) => orgitems.filter(item => item.OncomineVariant !== 'Deletion')), // 2022.06.01 수정
        // tap(itemlists => console.log('[475][tab]', itemlists))
      );

    const msiscore$ = this.filteredService.getMsiScroe(pathologynum);
    const tumorMutationalBurden$ = this.filteredService.getTumorMutationalBurden(pathologynum);
    const tumortype$ = this.filteredService.getTumorType(pathologynum);
    const clinically$ = this.filteredService.getClinically(pathologynum);
    const clinical$ = this.filteredService.getClinical(pathologynum);
    const prevalent$ = this.filteredService.getPrevalent(pathologynum);
    const tumorcellpercentage$ = this.filteredService.getTumorcellpercentage(pathologynum);
    const statcontrol$ = this.filteredService.getStatecontrol(pathologynum);
    const gemonic$ = this.filteredService.getGemonic(pathologynum);
    combineLatest([filteredOriginaData$, msiscore$, tumorMutationalBurden$,
      tumortype$, clinically$, clinical$, prevalent$, tumorcellpercentage$, statcontrol$, gemonic$])
      .subscribe(([filteredOriginaDataVal, msiscoreVal, tumorMutationalBurdenVal,
        tumortypeVal, clinicallyVal, clinicalVal, prevalentVal, tumorcellpercentageVal, statcontrolVal, gemoicVal]) => {

        this.filteredOriginData = filteredOriginaDataVal; // filtered 된 데이터 가져옴
        // MSISCORE
        // console.log('[749][this.filteredOriginData]', this.filteredOriginData);
        if (msiscoreVal[0].msiscore.split('').includes('(')) {
          this.msiTag = true;
        }

        if (msiscoreVal.length > 0) {
          this.msiScore = msiscoreVal[0].msiscore; // MSI Score
          this.extraction.msiscore = msiscoreVal[0].msiscore;
        } else {
          this.msiScore = '';
          this.extraction.msiscore = '';
        }

        // 2022.11.24 수정
        if (tumorMutationalBurdenVal.length > 0) {
          if (tumorMutationalBurdenVal[0].tumorMutationalBurden.length) {
            this.tumorMutationalBurden = tumorMutationalBurdenVal[0].tumorMutationalBurden;
            this.extraction.tumorburden = tumorMutationalBurdenVal[0].tumorMutationalBurden;
          } else {
            this.tumorMutationalBurden = 'row';
            this.extraction.tumorburden = 'row';
          }
        } else {
          this.tumorMutationalBurden = 'row';
          this.extraction.tumorburden = 'row';
        }

        if (tumortypeVal.length > 0) {
          tumortypes = tumortypeVal[0].tumortype;
          // this.checkingMent(tumortypeVal[0].tumortype); // 유전자에 따른 멘트 찿음
        } else {
          tumortypes = '';
        }

        console.log('[789][tumorcellpercentage]', tumorcellpercentageVal);
        if (tumorcellpercentageVal.length > 0) {
          this.tumorcellpercentage = tumorcellpercentageVal[0].tumorcellpercentage.trim(); // 공백 없앰
        } else {
          this.tumorcellpercentage = '';
        }
        this.screenstatus = this.patientInfo.screenstatus;

        this.tempClinically = clinicallyVal;
        this.clinical = clinicalVal;

        this.tempPrevalent = prevalentVal;
        this.basicInfo.name = this.patientInfo.name;
        this.basicInfo.registerNum = this.patientInfo.patientID;
        this.basicInfo.gender = this.patientInfo.gender;
        this.basicInfo.pathologyNum = this.patientInfo.pathology_num;
        this.basicInfo.age = this.patientInfo.age;
        // 순번대로 정렬
        // console.log('[616][tempClinically ]', this.tempClinically);
        if (this.tempClinically.length > 1) {
          const tempClinically = this.tempClinically.sort((a, b) => {
            return parseInt(a.seq, 10) - parseInt(b.seq, 10);
          });
          // console.log('[620][tempClinically ]', tempClinically);
          tempClinically.forEach(item => {
            this.clinically.push(item.clinically);
          });
        } else if (this.tempClinically.length === 1) {
          this.clinically.push(this.tempClinically[0].clinically);
        } else {
          this.clinically = [];
        }

        if (this.tempPrevalent.length > 1) {
          const tempPrevalent = this.tempPrevalent.sort((a, b) => {
            return parseInt(a.seq, 10) - parseInt(b.seq, 10);
          });
          // console.log('[636][tempPrevalent ]', tempPrevalent);
          tempPrevalent.forEach(item => {
            this.prevalent.push(item.prevalent);
          });
        } else if (this.tempPrevalent.length === 1) {
          this.prevalent.push(this.tempPrevalent[0].prevalent);
        } else {
          this.prevalent = [];
        }

        // 정도관리
        if (statcontrolVal.length !== null && statcontrolVal.length !== 0 && statcontrolVal.length !== undefined) {
          this.stateControl = statcontrolVal[0];
        }
        console.log('[840][tsv 정도관리]', this.stateControl);
        // MAPD 값이 0.5 이상/이하로 구분
        this.setMapd(this.stateControl.mapd);

        // Genomic Alteration
        if (gemoicVal.length) {
          this.genoLists = gemoicVal;
        }

        console.log('[보고서 유전자정보]', this.filteredOriginData);  // 주 데이터
        console.log('[보고서][msiscore]', this.msiScore);
        console.log('[보고서][tumorcellpercentage]', this.tumorcellpercentage);
        console.log('[보고서][tumorMutationalBurden]', this.tumorMutationalBurden);
        console.log('[보고서][tumortype]', tumortypes);
        console.log('[보고서][clinically]', this.clinically);
        console.log('[보고서][clinical]', this.clinical);
        console.log('[보고서][prevalent]', this.prevalent);
        console.log('[보고서][환자정보]', this.patientInfo);
        console.log('[보고서][정도관리]', statcontrolVal[0]);
        console.log('[보고서][Genomic]', this.genoLists);
        // 검체정보
        this.extraction.dnarna = 'FFPE tissue';
        this.extraction.managementNum = this.patientInfo.rel_pathology_num;

        console.log('[851][key_block]', this.patientInfo.key_block);
        if (this.patientInfo.key_block === undefined || this.patientInfo.key_block === null) {
          this.extraction.keyblock = '';
        } else if (this.patientInfo.key_block.length > 0) {
          const firstChar = this.patientInfo.key_block.charAt(0);
          if (firstChar === '#') {
            this.extraction.keyblock = this.patientInfo.key_block;
          } else {
            this.extraction.keyblock = '#' + this.patientInfo.key_block;
          }
        } else {
          this.extraction.keyblock = '';
        }

        // % 관리
        console.log('[851][ %]', this.patientInfo.tumor_cell_per, this.tumorcellpercentage);
        if (this.patientInfo.tumor_cell_per.length > 0) {
          this.extraction.tumorcellpercentage = this.patientInfo.tumor_cell_per + '%';
        } else {
          if (this.tumorcellpercentage === undefined || this.tumorcellpercentage === null) {
            this.extraction.tumorcellpercentage = '';
          } else if (this.tumorcellpercentage.length > 0) {
            const lastChar = this.tumorcellpercentage.charAt(this.tumorcellpercentage.length - 1);
            if (lastChar === '%') {
              this.extraction.tumorcellpercentage = this.tumorcellpercentage;
            } else {
              this.extraction.tumorcellpercentage = this.tumorcellpercentage + '%';
            }
          } else {
            this.extraction.tumorcellpercentage = '';
          }
        }

        // console.log('[879][검체]', this.patientInfo.organ);
        this.extraction.organ = this.patientInfo.organ;
        if (this.patientInfo.tumor_type.length > 0) {
          this.extraction.tumortype = this.patientInfo.tumor_type;
        } else {
          this.extraction.tumortype = tumortypes;
        }

        if (this.patientInfo.pathological_dx === undefined || this.patientInfo.pathological_dx === null) {
          this.patientInfo.pathological_dx = '';
        } else {
          this.extraction.diagnosis = this.patientInfo.pathological_dx;
        }
        // OR파일에서 가져온 유전자 정보
        // tslint:disable-next-line:prefer-const
        ////////////////////////////////// clinically 시작
        this.clinically.forEach(items => {
          let type = '';
          const sepItems = items.split(';');
          
          sepItems.forEach(item => {  //
            const members = item.trim().split(' ');
          
            const gene = members[0].trim().replace(/"/g, '');
            // let type = members[1].trim().replace(/[",;]/g, '');
            if(members[1] !== undefined) {
              type = members[1].trim().replace(/[",;]/g, '');
            }
            
            if (members.length === 4) {
              // if (members[1].toLowerCase() === 'exon' && members[3].toLowerCase() === 'deletion') {
              //   type = 'exon';
              // }
              if (members[1].toLowerCase() === 'exon') {  // 2022.06.01 수정
                type = 'exon';
              }
            }
             console.log('[967][유전자추적]===>', members + '[' + gene + '][' + type + ']');

            // 25.03.29 예 genomic alteraion이 "BRAF N486_P490del" 인 경우 보안  type => N486_P490del 
            //if (type.charAt(0) === 'p' || type === 'exon' || type.charAt(0) === 'c' || type.includes('*') || type.match(/[0-9][A-Z]/g)) {
            if (type.charAt(0) === 'p' || type === 'exon' || type.charAt(0) === 'c' || type.charAt(0) === 'N' || type.includes('*') || type.match(/[0-9][A-Z]/g)) {
              
              let indexm: number;
              let nucleotideChange: string;
              let customid = '';
              let transcript = '';
              let variantAlleleFrequency = '';
              let aminoAcidChange = '';
              let tempAminoAcidChange = '';
              const tier = this.findTier(gene);  // clinical 에서 gene, tier, frequency 찿기
              // p.(xxxx)은 Amino acid change, c.(xxxxx)은 Nucleotide change
              const itemMembers = item.trim().split(' ');
              console.log('[1004][유전자추적]===>', itemMembers);
              
              // 24.02.18  itemMembers.length 체크하도록 추가
              // POLE [N423K;L424P] OR파일에서 이런 경우는 parsion 못 함
              if (itemMembers.length === 2 ) {
              
                if (itemMembers[1].charAt(0) === 'p') {
                  aminoAcidChange = itemMembers[1];
                  tempAminoAcidChange = itemMembers[1];
                } else if (itemMembers[1].charAt(0) === 'c') {
                  nucleotideChange = itemMembers[1];
                }

              }
              
              if (type === 'exon') {
                nucleotideChange = '';
              } else {
                if (itemMembers[2] !== undefined && itemMembers[2].charAt(0) === 'c') {
                  nucleotideChange = itemMembers[2];
                } else if (itemMembers[2] !== undefined && itemMembers[2].charAt(0) === 'p') {
                  aminoAcidChange = itemMembers[2];
                  tempAminoAcidChange = itemMembers[2];
                }
              }

              variantAlleleFrequency = this.findFrequency(gene);

              if (type === 'exon') {
                indexm = this.findGeneInfo(gene);

                if (indexm !== -1) {
                  nucleotideChange = this.filteredOriginData[indexm].coding;
                }
              } else {
                indexm = this.withGeneCoding(gene, nucleotideChange);
              }

              if (indexm !== -1) {
                customid = this.filteredOriginData[indexm].variantID;
                if (customid === undefined || customid === null) { customid = ''; }
                transcript = this.filteredOriginData[indexm].transcript;
                if (transcript === undefined || transcript === null) { transcript = ''; }

                if (gene === 'TERT' && tempAminoAcidChange === 'p.(?)') {
                  aminoAcidChange = 'Promotor mutant';
                } else if (gene !== 'TERT' && tempAminoAcidChange === 'p.(?)') {
                  aminoAcidChange = 'Splicing mutant';
                } else {
                  // aminoAcidChange 값이 없으면 원래것을 사용
                  aminoAcidChange = this.filteredOriginData[indexm].aminoAcidChange;
                  // if (aminoAcidChange === undefined || aminoAcidChange === null || aminoAcidChange === '') {
                  //   aminoAcidChange = tempAminoAcidChange;
                  // }
                }
              } else {
                if (gene === 'TERT' && tempAminoAcidChange === 'p.(?)') {
                  aminoAcidChange = 'Promotor mutant';
                } else if (gene !== 'TERT' && tempAminoAcidChange === 'p.(?)') {
                  aminoAcidChange = 'Splicing mutant';
                }
                customid = '';
                nucleotideChange = '';
              }
              
              console.log('[1069][유전자추적]===>', aminoAcidChange, nucleotideChange );
              // gene, aminoAcidChange, nucleotideChange 조합으로 해당 되는것 삭제
              const result = this.removeGeneCheck(gene, aminoAcidChange, nucleotideChange);
              console.log('[1072][유전자추적]===>', result );
              if (result === -1) {
                //  vc.novel.1169, 계열은 ID 에 빈공간으로 만듬.
                if (customid.indexOf('vc.novel') !== -1) {
                  customid = '';
                }

                this.mutation.push({
                  gene,
                  aminoAcidChange,
                  nucleotideChange,
                  variantAlleleFrequency,
                  ID: customid,
                  tier,
                  transcript
                });
               // console.log('[1055][] ==>',gene, this.mutation);
              }

            } else if (type === 'amplification' || type === 'deletion') { // 2022.06.01 수정 deletion 추가

              const indexa = this.findGeneInfo(gene);
              const atier = this.findTier(gene);
              const geneindexlist = this.findMultiGeneInfo(gene);

              if (indexa !== -1) {
                let cylen;
                const cytobandlen = this.filteredOriginData[indexa].cytoband.length;
                Array.from(geneindexlist, (num: number) => {

                  cylen = this.filteredOriginData[num].cytoband.length;
                  if (cylen) {
                    const cytoband = this.filteredOriginData[num].cytoband.split(')');
                    this.amplifications.push({
                      // gene: this.filteredOriginData[num].gene,
                      gene,
                      region: cytoband[0] + ')',
                      copynumber: cytoband[1],
                      tier: atier
                    });
                  }
                });


              }
            } else if (type === 'fusion') {
              let oncomine;

              const index = this.findFusionInfo(gene);
              const ftier = this.findTier(gene);

              if (index !== -1) {  // 여기주의
                if (this.filteredOriginData[index].oncomine === 'Loss-of-function') {
                  oncomine = 'Loss';
                } else if (this.filteredOriginData[index].oncomine === 'Gain-of-function') {
                  oncomine = 'Gain';
                }

                this.fusion.push({
                  gene: this.filteredOriginData[index].gene,
                  // gene,
                  breakpoint: this.filteredOriginData[index].locus,
                  readcount: this.filteredOriginData[index].readcount,
                  functions: oncomine,
                  tier: ftier
                });

              }

            }  
          }); // 두번째 파싱 끝
        });
        ////////////////////////// Clinically 파싱 끝
        // 파싱한것 결과지 출력
        // Mutation
        this.filteredOriginData.forEach(item => {
          let tempaminoAcidChange = '';
          let oncomine = '';
          const type: string = item.type.toLowerCase();
          const oncomineVariant = item.OncomineVariant.toLocaleLowerCase();
           // tier 값구히가 2032-09-06        
          const threeTier = this.findTier(item.gene);

          // 25.03.29 snv 만 처리하다 mnv도 체크함 
          // case 1
          //if ( (type === 'snv' &&  this.muLists.includes(oncomineVariant)) || type === 'indel') {
          if ( ((type === 'snv' || type === 'mnv') &&  this.muLists.includes(oncomineVariant)) || type === 'indel') {
               // const mutation = this.mutation.filter( list => list.gene === item.gene);
               console.log('[][1160]====>', this.mutation, threeTier);
               const mutation = this.mutation.filter( list => list.gene === item.gene.split(';')[0]);
                if (item.aminoAcidChange === '' || item.aminoAcidChange === null) {
                  tempaminoAcidChange = mutation[0].aminoAcidChange;
                } else  {
                  tempaminoAcidChange = item.aminoAcidChange;
                }
                console.log('[1167][]===>', item.gene.split(';')[0], this.mutation, mutation.length );
                if (mutation.length === 1 && threeTier !== 'III') {
                        this.mutationNew.push({
                        gene: item.gene,
                        aminoAcidChange:  item.aminoAcidChange,
                        nucleotideChange:   item.coding,
                        variantAlleleFrequency:   item.frequency  ? item.frequency + '%' : '',
                        ID: item.variantID,
                        // tier: mutation.length ? mutation[0].tier : '', // 2022.11.25 수정
                        tier: this.findTier(item.gene),
                        transcript: item.transcript
                      });
                } else if (mutation.length > 1 && threeTier !== 'III') {
                  mutation.forEach( mut => {
                    this.mutationNew.push({
                      gene: item.gene,
                      aminoAcidChange:  item.aminoAcidChange,
                      nucleotideChange:   item.coding,
                      variantAlleleFrequency:   item.frequency ? item.frequency + '%' : '',
                      ID: item.variantID,
                      // tier:  mut.tier,  // 2022.11.25 수정
                      tier: this.findTier(item.gene),
                      transcript: item.transcript
                    });
                  });
                } else if (threeTier === 'III') {
                  this.imutation.push({
                    gene: item.gene,
                    aminoAcidChange: item.aminoAcidChange,
                    nucleotideChange: item.coding,
                    variantAlleleFrequency:item.frequency ?  item.frequency + '%' : '', 
                    ID: item.variantID,
                    tier: 'III',
                    transcript: item.transcript
                  });
                   
                }  else if ( threeTier === '') { // tier 정보 없음 mutation.length === 0
                  this.imutation.push({
                    gene: item.gene,
                    aminoAcidChange:  item.aminoAcidChange,
                    nucleotideChange:   item.coding,
                    variantAlleleFrequency:   item.frequency  ? item.frequency + '%' : '',
                    ID: item.variantID,                   
                    tier:  '',
                    transcript: item.transcript  
                  });               
                }
              
            // case 2
            } else if (type === 'cnv' &&  this.amLists.includes(oncomineVariant)) {
                const amplification = this.amplifications.filter( list => list.gene === item.gene);
                const cytoband = item.cytoband.split(')');
                if (amplification.length === 1 && threeTier !== '') {
                  this.amplificationsNew.push({
                    gene: item.gene,
                    region: cytoband[0] + ')',
                    copynumber: cytoband[1],
                    tier:  amplification[0].tier
                  });
                } else if (amplification.length > 1 && threeTier !== '') {
                  amplification.forEach(amp => {
                    this.amplificationsNew.push({
                      gene: item.gene,
                      region: cytoband[0] + ')',
                      copynumber: cytoband[1],
                      tier: amp.tier
                    });
                  });
                } else if (threeTier !== '') {
                  amplification.forEach(amp => {
                    this.iamplifications.push({
                      gene: item.gene,
                      region: cytoband[0] + ')',
                      copynumber: cytoband[1],
                      //tier:  ''
                    });
                  });                
                }

          // case 4
          // mnv 추가 25.03.30
        //} else if (type !== 'cnv' && type !== 'snv'  &&  this.fuLists.includes(oncomineVariant)) {
        } else if (type !== 'cnv' && type !== 'snv'  && type !== 'mnv'  &&  this.fuLists.includes(oncomineVariant)) {
               // console.log('[report][1144]==>', item, this.fuLists);
                const fusion = this.fusion.filter( list => list.gene === item.gene);
                if (item.oncomine.toLocaleLowerCase() === 'loss-of-function') {
                  oncomine = 'Loss';
                } else if (item.oncomine.toLocaleLowerCase() === 'gain-of-function') {
                  oncomine = 'Gain';
                }
                if (fusion.length === 1 && threeTier !== '') {
                  this.fusionNew.push({
                    gene: item.gene,
                    breakpoint: item.locus,
                    readcount: item.readcount,
                    functions: oncomine,
                    tier: fusion.length ? fusion[0].tier : ''
                  });
                } else if (fusion.length > 1 && threeTier !== '') {
                  fusion.forEach( fu => {
                    this.fusionNew.push({
                      gene: item.gene,
                      breakpoint: item.locus,
                      readcount: item.readcount,
                      functions: oncomine,
                      tier: fu.tier
                    });
                  });
                } else if (  threeTier !== '') {
                  this.ifusion.push({
                    gene: item.gene,
                    breakpoint: item.locus,
                    readcount: item.readcount,
                    functions: oncomine,
                    tier: ''
                  });
                }

          } 
        });

        //////////////////////////////////////////////

        if (this.mutationNew.length) {
          this.mutationNew.forEach((mItem, index) => {
            this.mutationLists().push(this.createMutaion(mItem, index.toString()));
          });
        }

        if (this.amplificationsNew.length) {
          this.amplificationsNew.forEach((aItem, index) => {
            this.amplificationsLists().push(this.createAmplifications(aItem, index.toString()));
          });
        }

        if (this.fusionNew.length) {
          this.fusionNew.forEach((fItem, index) => {
            this.fusionLists().push(this.createFusion(fItem, index.toString()));
          });
        } else {
          this.fusionNew = [];
        }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        this.prevalent.forEach(item => {
          const members = item.trim().split(',');
          const temps = members[0].split(' ');
          const gene = temps[0].trim().replace(/"/g, '');
          const type = temps[1].trim().replace(/"/g, '');
         
          if (type.charAt(0) === 'p' || type.charAt(0) === 'c' || type.includes('*')) {  // 임시수정

            let customid = '';
            let transcript = '';
            let aminoAcidchange = '';
            let tempaminoAcidchange = '';
            let nucleotidechange = '';
            let variantAlleleFrequency = '';
            const items = members[0].split(' ');
            
            if (items[1].charAt(0) === 'p') {
              aminoAcidchange = items[1];
              tempaminoAcidchange = items[1];
              if (items[2] !== undefined && items[2].length > 0) {
                nucleotidechange = items[2];
              }
              // 유전자 c.(xxxx), 없거나, p.(xxxx)
            } else if (items[1].charAt(0) === 'c') {
              nucleotidechange = items[1];
              if (items[2] !== undefined && items[2].length > 0) {
                aminoAcidchange = items[2];
                tempaminoAcidchange = items[2];
              }
            }


            // 유전자와 nucleotidechange 2개로 찿는다.
            const indexm = this.withGeneCoding(gene, nucleotidechange);

            if (indexm !== -1) {
              customid = this.filteredOriginData[indexm].variantID;
              if (customid === undefined || customid === null) { customid = ''; }

              transcript = this.filteredOriginData[indexm].transcript;
              if (transcript === undefined || transcript === null) { transcript = ''; }

              variantAlleleFrequency = this.filteredOriginData[indexm].frequency;
              if (variantAlleleFrequency === undefined || variantAlleleFrequency === null || variantAlleleFrequency === '') {
                variantAlleleFrequency = '';
              }
              if (gene === 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Promotor mutant';
              } else if (gene !== 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Splicing mutant';
              } else {
                // aminoAcidchange 값이 없으면 원래것을 사용
                aminoAcidchange = this.filteredOriginData[indexm].aminoAcidChange;
                if (aminoAcidchange === undefined || aminoAcidchange === null || aminoAcidchange === '') {
                  aminoAcidchange = tempaminoAcidchange;
                }

              }
            } else {
              if (gene === 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Promotor mutant';
              } else if (gene !== 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Splicing mutant';
              }
              customid = '';
            }

            // 2022.11.24 수정
            let muduplicatedGene = -100;
            if (items[1].includes('*')) {
              
              this.filteredOriginData.forEach( list => {
                // console.log('[1322] ===> ', list.gene.split(';')[0],items, list.type, this.imutation);

                if (list.gene.split(';')[0] === items[0] && list.type.toLowerCase() === 'indel') {
                  // 동일한 유전자가 없을때 추가
                  if(this.imutation.length) {
                    muduplicatedGene = this.imutation.findIndex(item => item.gene === items[0]);
                  } else {
                    this.imutation.push({
                      gene: items[0],
                      aminoAcidChange: list.aminoAcidChange,
                      nucleotideChange: list.coding,
                      variantAlleleFrequency: list.frequency ?  list.frequency + '%' : '', // 2022.11.29 수정
                      ID: list.variantID,
                      tier: '',
                      transcript: list.transcript
                    });                   
                  }

                  if (muduplicatedGene === -1) {
                    this.imutation.push({
                      gene: items[0],
                      aminoAcidChange: list.aminoAcidChange,
                      nucleotideChange: list.coding,
                      variantAlleleFrequency: list.frequency ?  list.frequency + '%' : '', // 2022.11.29 수정
                      ID: list.variantID,
                      tier: '',
                      transcript: list.transcript
                    });
                  }

                }
            });
            //  console.log('[1335][prevalent] ==> ', items[0], items[1],   this.filteredOriginData);
          } else {
            const result = this.removeGeneCheck(gene, aminoAcidchange, nucleotidechange);
            if (result === -1) {
              //  vc.novel.1169, 계열은 ID 에 빈공간으로 만듬.
              if (customid.indexOf('vc.novel') !== -1) {
                customid = '';
              }
              // console.log('[680][vc.novel] ', customid);
              let tempVariantAlleleFrequency;
              if (variantAlleleFrequency.length === 0) {
                tempVariantAlleleFrequency = variantAlleleFrequency;
              } else {
                tempVariantAlleleFrequency = variantAlleleFrequency + '%';
              }
                    // 동일한 유전자가 없을때 추가
                    if(this.imutation.length) {
                        muduplicatedGene = this.imutation.findIndex(item => item.gene === items[0]);
                    }

                    if (muduplicatedGene === -1) {
                      this.imutation.push({
                        gene,
                        aminoAcidChange: aminoAcidchange,
                        nucleotideChange: nucleotidechange,
                        variantAlleleFrequency: tempVariantAlleleFrequency,
                        ID: customid,
                        tier: '',
                        transcript
                      });
                    }

            }
          }

          } else if (type === 'amplification') {
            let ampduplicatedGene = -100;
            const indexa = this.findGeneInfo(gene);
            // console.log(' ######[840][prevelant][amplification] ', gene);
            if (indexa !== -1) {
              const cytoband = this.filteredOriginData[indexa].cytoband.split(')');
              // 동일한 유전자가 없을때 추가
                if(this.amplifications.length) {
                  ampduplicatedGene = this.iamplifications.findIndex(item => item.gene === gene);
               } else {
                this.iamplifications.push({
                  // gene: this.filteredOriginData[indexa].gene,
                  gene,
                  region: cytoband[0] + ')',
                  copynumber: cytoband[1],
                  note: ''
                });               
               }

               if (ampduplicatedGene === -1) {
                this.iamplifications.push({
                  // gene: this.filteredOriginData[indexa].gene,
                  gene,
                  region: cytoband[0] + ')',
                  copynumber: cytoband[1],
                  note: ''
                });
               }

            }
          } else if (type === 'fusion') {
            let oncomine;
            let fuduplicatedGene = -100;
            // if (gene === 'PTPRZ1-MET') {
            // gene = 'PTPRZ1(1) - MET(2)';
            // }
            const index = this.findFusionInfo(gene);

            // const index = this.findGeneInfo(gene);

            if (index !== -1) {
              if (this.filteredOriginData[index].oncomine === 'Loss-of-function') {
                oncomine = 'Loss';
              } else if (this.filteredOriginData[index].oncomine === 'Gain-of-function') {
                oncomine = 'Gain';
              }

              // 동일한 유전자가 없을때 추가
              if(this.ifusion.length) {
                fuduplicatedGene = this.ifusion.findIndex(item => item.gene === gene);
             } else {
                  this.ifusion.push({
                    gene,
                    breakpoint: this.filteredOriginData[index].locus,
                    readcount: this.filteredOriginData[index].readcount,
                    functions: oncomine
                  });
             }
              
             if (fuduplicatedGene === -1) {
              this.ifusion.push({
                gene,
                breakpoint: this.filteredOriginData[index].locus,
                readcount: this.filteredOriginData[index].readcount,
                functions: oncomine
              });
             }



            }
          }
        });

        if (this.imutation.length) {
          this.imutation.forEach((mItem, index) => {
            this.imutationLists().push(this.createIMutaion(mItem, index.toString()));
          });
        }

        if (this.iamplifications.length) {
          this.iamplifications.forEach((aItem, index) => {
            this.iamplificationsLists().push(this.createIAmplifications(aItem, index.toString()));
          });
        }

        if (this.ifusion.length) {
          this.ifusion.forEach((fItem, index) => {
            this.ifusionLists().push(this.createIFusion(fItem, index.toString()));
          });
        }

        /// Genomic Alteration
        this.essentialMent();

      }); // End of Subscirbe;
    // console.log(' ######[1227][prevelant][amplification] ');
    // 필수 유전자 코멘트
    // combineLatest([tumortype$.pipe(
    //   map(data => data[0].tumortype)
    // ),
    // clinically$.pipe(
    //   tap(data => console.log('[필수 유전자 코멘트][1234]', data)),
    //   map(datas => datas.map(data => data.clinically)),
    //   map(items => items.map(item => {
    //     const lists = item.split(' ');
    //     if (lists[1].toLowerCase() === 'fusion') {
    //       return { type: 'fusion', dna: lists[0] };
    //     } else if (lists[1].toLowerCase() === 'amplification') {
    //       return { type: 'amplification', dna: lists[0] };
    //     }
    //     return { type: 'mutation', dna: lists[0] };
    //   })),
    // )])
    //   .subscribe(([type, dnaData]) => {
    //     // console.log('[1246]', type, dnaData);
    //     // this.essenceDNAComment(type, dnaData);
    //   });

  }

  /*

    */
  withGeneCoding(gene: string, coding: string): number {
    const idx = this.filteredOriginData.findIndex(item =>
      item.gene.split(';').includes(gene) && item.coding.split(';').toString().trim().includes(coding));
    // item.gene === gene && item.coding === coding);
    // item.gene.split(';').includes(gene) && item.coding === coding);
    return idx;
  }
  // Fusion 검색은 variant ID 값을 파싱하여 비교한다.
  //
  findFusionInfo(gene: string): number {
    const idx = this.filteredOriginData.findIndex(item => gene === item.variantID.split('.')[0]);
    return idx;
  }


  findGeneInfo(gene: string): number {
    let tempGene;
    if (gene === 'PTPRZ1-MET') {
      tempGene = 'PTPRZ1(1) - MET(2)';
      gene = tempGene;
    } else if (gene === 'KIF5B-RET') {
      tempGene = 'KIF5B(18) - RET(12)';
      gene = tempGene;
    }
    // const idx = this.filteredOriginData.findIndex(item => item.gene === gene);21.01-26 화 수정
    const idx = this.filteredOriginData.findIndex(item => item.gene.split(';').includes(gene));
    return idx;
  }

  findMultiGeneInfo(gene: string): any {
    const len = this.filteredOriginData.length;
    const geneinfo = [];
    for (let i = 0; i < len; i++) {
      // if (this.filteredOriginData[i].gene === gene) {
      if (this.filteredOriginData[i].gene.split(';').includes(gene)) {
        geneinfo.push(i);
      }
    }
    return geneinfo;
  }

  // tslint:disable-next-line:member-ordering
  private visitedGene = [];
  findFrequency(gene): string {
    const ix = this.visitedGene.findIndex(name => name === gene);
    if (ix === -1) {
      const idx = this.clinical.findIndex(list => list.gene === gene);
      if (idx === -1) {
        this.visitedGene.push(gene);
        return 'none';
      }
      this.visitedGene.push(gene);
      return this.clinical[idx].frequency;
    } else {

      return this.findBackFrequency(gene);
    }

  }

  findBackFrequency(gene): string {
    const idx = this.clinical.reverse().findIndex(list => list.gene === gene);
    // console.log('[1426][findBackFrequency]',  this.clinical[idx]);
    if (idx === -1) {
      return 'none';
    }
    return this.clinical[idx].frequency;
  }

  findTier(gene): string {
    
    const idx = this.clinical.findIndex(list => list.gene === gene );
    
    if (idx === -1) {
      return '';
    }
    return this.clinical[idx].tier;
  }
  ///////////////////////////////////////
  // DNA and RNA extraction

  setDNAandRNAextraction(dna: string): void {
    // console.log('[663][setDNAandRNAextraction]', dna);
    this.extraction.dnarna = dna;
  }

  // tslint:disable-next-line:variable-name
  setManagementNum(rel_pathology_num: string): void {
    this.extraction.managementNum = rel_pathology_num;
    // console.log('********* [906][환자병리번호]', this.extraction.managementNum);
  }

  setKeyblock(keyblock: string): void {
    this.extraction.keyblock = keyblock;
  }

  setTumorpercentage(percentage): void {
    // const temp = percentage[percentage.length - 1];
    // console.log('[909][PERCENTAGE] ', percentage);
    // if (temp === '%') {
    //   this.extraction.tumorcellpercentage = percentage.slice(0, -1);
    // } else {
    //
    // }
    const per = percentage.replace('/\%/g', '');
    this.extraction.tumorcellpercentage = per;
    console.log('******* [1245][퍼센티지] ', percentage, per, this.extraction.tumorcellpercentage);
  }
  setOrgan(organ: string): void {
    // console.log('[672][setDNAandRNAextraction]', organ);
    this.extraction.organ = organ;
  }

  setTumorType(type: string): void {
    this.extraction.tumortype = type;
  }

  setDiagnosis(diagnosis: string): void {

    this.extraction.diagnosis = diagnosis;
  }
  diagnosisFocus(): void {
    this.diagnosis.selectionStart += 30;

  }

  // 정도관리
  setDnaRnasep(dnarnasep: string): void {
    this.stateControl.dnaRnasep = dnarnasep;
  }

  setRna18s(rna18s: string): void {
    this.stateControl.rna18s = rna18s;
  }

  setAverageBase(averageBase: string): void {
    this.stateControl.averageBase = averageBase;
  }

  setUniformity(uniformity: string): void {
    this.stateControl.uniformity = uniformity;
  }

  setMeanRead(meanRead: string): void {
    this.stateControl.meanRead = meanRead;
  }

  setMeanRaw(meanRaw: string): void {
    this.stateControl.meanRaw = meanRaw;
  }

  setMapd(mapd: string): void {
    console.log('[1572] ====> ', mapd);
    this.stateControl.mapd = mapd;
    const val = parseFloat(this.stateControl.mapd);
    if (val <= 0.5) {
      this.notecontents = this.notement;
    } else {
      this.notecontents = this.notement3; // notement2 => notement3 로 2022.11.24 수정
    }
  }

  setRnaMapped(rnaMapped: string): void {
    this.stateControl.rnaMapped = rnaMapped;
  }


  convertFormData(): void {
    const mControl = this.mutationForm.get('mutationLists') as FormArray;
    // this.mutation = mControl.getRawValue();
    const tempMu = mControl.getRawValue();
    const tempMuLen = tempMu.length;
    this.mutation = [];
    if (tempMuLen > 0) {
      tempMu.forEach((item, index) => {
        item.seq = index;
        this.mutation.push(item);
      });
    }

    const aControl = this.amplificationsForm.get('amplificationsLists') as FormArray;
    // this.amplifications = aControl.getRawValue();
    const tempAm = aControl.getRawValue();
    const tempAmLen = tempAm.length;
    this.amplifications = [];
    if (tempAmLen > 0) {
      tempAm.forEach((item, index) => {
        item.seq = index;
        this.amplifications.push(item);
      });
    }

    const fControl = this.fusionForm.get('fusionLists') as FormArray;
    // this.fusion = fControl.getRawValue();
    const tempFu = fControl.getRawValue();
    const tempFuLen = tempFu.length;
    this.fusion = [];
    if (tempFuLen > 0) {
      tempFu.forEach((item, index) => {
        item.seq = index;
        this.fusion.push(item);
      });
    }

    const imControl = this.imutationForm.get('imutationLists') as FormArray;
    // this.imutation = imControl.getRawValue();

    const tempIMu = imControl.getRawValue();
    const tempIMuLen = tempIMu.length;
    this.imutation = [];
    if (tempIMuLen > 0) {
      tempIMu.forEach((item, index) => {
        item.seq = index;
        this.imutation.push(item);
      });
    }

    const iaControl = this.iamplificationsForm.get('iamplificationsLists') as FormArray;
    // this.iamplifications = iaControl.getRawValue();
    const tempIAm = iaControl.getRawValue();
    const tempIAmLen = tempIAm.length;
    this.iamplifications = [];
    if (tempIAmLen > 0) {
      tempIAm.forEach((item, index) => {
        item.seq = index;
        this.iamplifications.push(item);
      });
    }

    const ifControl = this.ifusionForm.get('ifusionLists') as FormArray;
    // this.ifusion = ifControl.getRawValue();
    this.ifusion = [];
    const tempIFu = ifControl.getRawValue();
    const tempIFuLen = tempIFu.length;
    if (tempIFu.length > 0) {
      tempIFu.forEach((item, index) => {
        item.seq = index;
        this.ifusion.push(item);
      });
    }

  }

  /////////////////////////////////////////////////////////////
  // tslint:disable-next-line: typedef
  sendEMR() {
    const userid = localStorage.getItem('pathuser');
    const emrDate = this.patientInfo.sendEMRDate.toString().slice(0, 10);
    this.convertFormData();
    console.log('[1064][Burden/MSI', this.tumorMutationalBurden, this.msiScore);
    console.log('[1064][검사자/확인자]', this.examedno, this.examedname, this.checkeredno, this.checkername);
    console.log('[1065][검사자리스트', this.mt, this.dt);
    console.log('[1065][SER]', this.basicInfo);
    console.log('[1066][SER]', this.extraction, this.mutation, this.amplifications,
      this.fusion, this.imutation, this.iamplifications, this.ifusion);
    console.log('[1066][SER]', this.specialment);
    /////////////
    const form = makeReport(
      emrDate,
      this.examedno,    // 검사자 번호
      this.examedname,  // 검사자 이름
      this.checkeredno, // 확인자 번호
      this.checkername, // 확인자 이름
      this.dnanrna,
      this.organ,
      this.basicInfo,
      this.extraction,
      this.stateControl,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.tumorMutationalBurden,
      this.msiScore,
      this.generalReport,
      this.specialment,
      this.notecontents,
      this.pathimage,
      this.patientInfo.sw_ver
    );
    console.log(form);

    // this.searchService.resetscreenstatus(this.pathologyNum, '3')
    //   .subscribe(data => {
    //     this.screenstatus = '3';
    //   });

    // NU로 데이터 전송
    this.pathologyService.sendEMR(this.patientInfo, form).subscribe(data => {
      // const message = data;
      // const result1 = converter.xml2json( message, { compact: true, spaces: 2 });
      console.log('[1121][sendEMR 보낸결과]', data);
      // alert(data);
      alert('EMR로 전송했습니다.');
      // this.router.navigate(['/pathology']);
    });

    this.searchService.resetscreenstatus(this.pathologyNum, '3')
      .subscribe(data => {
        this.patientInfo.screenstatus = '3';
        this.screenstatus = '3';
        console.log('[EMR 전송후 상태]', this.screenstatus);
      });

    // this.subs.sink = this.searchService.finishPathologyEMRScreen(this.patientInfo.pathology_num, userid)
    //   .subscribe(data => {
    //     console.log('[1101][][finishPathologyEMRScreen]', data);
    //     if (data.message === 'SUCCESS') {
    //       // alert(data);
    //       // this.router.navigate(['/pathology']);
    //     }
    //   });

  }

  makeEMRBase(): void {
    const patient$ = this.pathologyService.findPatientinfo(this.pathologyNum);
    patient$.subscribe(patientInfoEMR => {
      console.log('[1498][makeEMRBase] ', patientInfoEMR);
      this.tumorMutationalBurdenEMR = patientInfoEMR.tumorburden;
      this.msiScoreEMR = patientInfoEMR.msiscore;
      this.extractionEMR.dnarna = 'FFPE tissue';
      this.extractionEMR.managementNum = patientInfoEMR.rel_pathology_num;

      if (patientInfoEMR.key_block === undefined || patientInfoEMR.key_block === null) {
        this.extractionEMR.keyblock = '';
      } else if (patientInfoEMR.key_block.length > 0) {
        this.extractionEMR.keyblock = patientInfoEMR.key_block;
      } else {
        this.extractionEMR.keyblock = '';
      }

      if (patientInfoEMR.tumor_cell_per === undefined || patientInfoEMR.tumor_cell_per === null) {
        this.extractionEMR.tumorcellpercentage = '';
      } else {
        this.extractionEMR.tumorcellpercentage = patientInfoEMR.tumor_cell_per; // 공백 없앰
      }

      if (this.extractionEMR.organ === undefined || this.extractionEMR.organ === null) {
        this.extractionEMR.organ = '';
      } else {
        this.extractionEMR.organ = patientInfoEMR.organ;
      }

      if (this.extractionEMR.tumortype === undefined || this.extractionEMR.tumortype === null) {
        this.extractionEMR.tumortype = '';
      } else {
        this.extractionEMR.tumortype = patientInfoEMR.tumor_type;
      }

      if (patientInfoEMR.pathological_dx === undefined || patientInfoEMR.pathological_dx === null) {
        this.extractionEMR.diagnosis = '';
      } else {
        this.extractionEMR.diagnosis = patientInfoEMR.pathological_dx;
      }

      this.extractionEMR.tumorburden = patientInfoEMR.tumorburden;
      this.extractionEMR.msiscore = patientInfoEMR.msiscore;
      // 검체 검사자,확인자
      const exam = patientInfoEMR.examin.split('_');  // 기사
      this.examednoEMR = exam[0];
      this.examednameEMR = exam[1];

      const reck = patientInfoEMR.recheck.split('_'); // 의사
      this.checkerednoEMR = reck[0];
      this.checkernameEMR = reck[1];

      this.basicInfoEMR.name = patientInfoEMR.name;
      this.basicInfoEMR.registerNum = patientInfoEMR.patientID;
      this.basicInfoEMR.gender = patientInfoEMR.gender;
      this.basicInfoEMR.pathologyNum = patientInfoEMR.pathology_num;
      this.basicInfoEMR.age = patientInfoEMR.age;
      this.makeEMRData(patientInfoEMR);
    });
  }

  makeEMRData(info: IPatient): void {
    // let msg: string;
    // let result: boolean;
    const pathologyNo = info.pathology_num;

    const ment$ = this.searchService.getPathmentlist(pathologyNo);
    const mutationc$ = this.searchService.getMutationC(pathologyNo);
    const amplificationc$ = this.searchService.getAmplificationC(pathologyNo);
    const fusionc$ = this.searchService.getFusionC(pathologyNo);
    const mutationp$ = this.searchService.getMutationP(pathologyNo);
    const amplificationp$ = this.searchService.getAmplificationP(pathologyNo);
    const fusionp$ = this.searchService.getFusionP(pathologyNo);
    const pathologyimage$ = this.searchService.getPathImage(pathologyNo);
    // const howmanyimages$ = this.searchService.howManyImages(pathologyNo);
    combineLatest([ment$, mutationc$, amplificationc$,
      fusionc$, mutationp$, amplificationp$, fusionp$, pathologyimage$])
      .subscribe(([ment, mutationc, amplificationc, fusionc,
        mutationp, amplificationp, fusionp, pathimagelist]) => {
        // 멘트
        if (ment.message !== 'no data') {
          this.generalReportEMR = ment[0].generalReport;
          this.specialmentEMR = ment[0].specialment;
          this.notementEMR = ment[0].notement;
        } else {
          this.generalReportEMR = '';
          this.specialmentEMR = '';
          this.notementEMR = '';
        }
        // mutation
        if (mutationc.message !== 'no data') {
          let tempmu;
          if (mutationc.length > 1) {
            tempmu = mutationc.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempmu = mutationc;
          }
          tempmu.forEach((item, index) => {
            this.mutationEMR.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
              seq: index
            });
          });
        } else {
          this.mutationEMR = [];
        }

        if (amplificationc.message !== 'no data') {
          let tempam;
          if (amplificationc.length > 1) {
            tempam = amplificationc.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempam = amplificationc;
          }
          tempam.forEach((item, index) => {
            this.amplificationsEMR.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              tier: item.tier,
              seq: index
            });
          });
        } else {
          this.amplificationsEMR = [];
        }

        if (fusionc.message !== 'no data') {
          let tempfu;
          if (fusionc.length > 1) {
            tempfu = fusionc.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempfu = fusionc;
          }
          tempfu.forEach((item, index) => {
            this.fusionEMR.push({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              readcount: item.readcount,
              functions: item.fusion_function,
              tier: item.tier
            });
          });
        } else {
          this.fusionEMR = [];
        }

        if (mutationp.message !== 'no data') {
          let tempimu;
          if (mutationp.length > 1) {
            tempimu = mutationp.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempimu = mutationp;
          }
          tempimu.forEach((item, index) => {
            this.imutationEMR.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier
            });
          });
        } else {
          this.imutationEMR = [];
        }

        if (amplificationp.message !== 'no data') {
          let tempiam;
          if (amplificationp.length > 1) {
            tempiam = amplificationp.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempiam = amplificationp;
          }
          tempiam.forEach((item, index) => {
            this.iamplificationsEMR.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              note: item.note
            });
          });
        } else {
          this.iamplificationsEMR = [];
        }

        if (fusionp.message !== 'no data') {
          let tempifu;
          if (fusionp.length > 1) {
            tempifu = fusionp.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempifu = fusionp;
          }
          tempifu.forEach((item, index) => {
            this.ifusionEMR.push({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              functions: item.fusion_function,
              readcount: item.readcount,
              tier: item.tier
            });
          });
        } else {
          this.ifusionEMR = [];
        }


        if (pathimagelist.message !== 'no data') {
          // console.log('[1563][pathimage]', pathimagelist);
          pathimagelist.forEach(item => {
            this.pathimage.push(item.filepath);
          });
        } else {
          this.pathimage = [];
        }
        /*

       */
        this.toEMR();
      }); // End of combineLatest

  }

  toEMR(): void {
    const userid = localStorage.getItem('pathuser');
    console.log('[EMR 사용자ID]', userid);
    console.log('[EMR 전송날자]', this.today());
    console.log('[EMR 검사자/확인자]', this.examednoEMR, this.examednameEMR, this.checkerednoEMR, this.checkernameEMR);
    console.log('[EMR 환자정보]', this.basicInfoEMR, this.extractionEMR);
    console.log('[EMR 검사내용]', this.mutationEMR, this.amplificationsEMR, this.fusionEMR);
    console.log('[EMR 검사내용]', this.imutationEMR, this.iamplificationsEMR, this.ifusionEMR);
    console.log('[EMR tumor/msi]', this.tumorMutationalBurdenEMR, this.msiScoreEMR);
    console.log('[EMR 멘트]', this.generalReportEMR, this.specialmentEMR, this.notementEMR);
    console.log('[EMR 사진경로]', this.pathimage);
    console.log('[EMR 정도관리', this.stateControl);
    // const emrDate = this.patientInfo.sendEMRDate.toString().slice(0, 10);
    const emrDate = this.today();
    const form = makeReport(
      emrDate,   // EMR 전송일
      this.examednoEMR,    // 검사자 번호
      this.examednameEMR,  // 검사자 이름
      this.checkerednoEMR, // 확인자 번호
      this.checkernameEMR, // 확인자 이름
      '', '',
      this.basicInfoEMR, this.extractionEMR, this.stateControl,
      this.mutationEMR, this.amplificationsEMR, this.fusionEMR,
      this.imutationEMR, this.iamplificationsEMR, this.ifusionEMR,
      this.tumorMutationalBurdenEMR, this.msiScoreEMR,
      this.generalReportEMR, this.specialmentEMR, this.notementEMR,
      this.pathimage,
      this.patientInfo.sw_ver
    );
    console.log(form);
    // NU로 데이터 전송
    this.pathologyService.sendEMR(this.patientInfo, form).subscribe(data => {
      console.log('[1566][sendEMR 보낸결과]', data);
      alert('EMR로 전송했습니다.');

      this.mutationEMR = [];
      this.amplificationsEMR = [];
      this.fusionEMR = [];
      this.imutationEMR = [];
      this.iamplificationsEMR = [];
      this.ifusionEMR = [];
      // this.tumorMutationalBurdenEMR = '';
      // this.msiScoreEMR = '';
    });

    this.searchService.resetscreenstatus(this.pathologyNum, '3')
      .subscribe(data => {
        this.patientInfo.screenstatus = '3';
        this.screenstatus = '3';
        console.log('[EMR 전송후 상태]', this.screenstatus);
      });

    this.searchService.finishPathologyEMRScreen(this.patientInfo.pathology_num, userid)
      .subscribe(data => {
        console.log('[1101][][finishPathologyEMRScreen]', data);
        if (data.message === 'SUCCESS') {
          // alert(data);
          // this.router.navigate(['/pathology']);
        }
      });


  }

  mutationTier(index: number, i: string): void {
    this.mutation[index].tier = i;
  }

  amplificationTier(index: number, i: string): void {
    this.amplifications[index].tier = i;
  }

  fusionTier(index: number, i: string): void {
    this.fusion[index].tier = i;
  }
  imutationTier(index: number, i: string): void {
    this.imutation[index].tier = i;
  }

  ifusionTier(index: number, i: string): void {
    this.ifusion[index].tier = i;
  }

  // 의사
  checked(rechecked: string): void {
    const reck = rechecked.split('_');
    this.checkeredno = reck[0];
    this.checkername = reck[1];

    this.patientInfo.recheck = rechecked;
    // console.log('[1690][Rechecked][의사]', this.checkername, this.checkeredno);
  }
  // 기사
  examimed(examin: string): void {
    const exam = examin.split('_');
    this.examedno = exam[0];
    this.examedname = exam[1];


    this.patientInfo.examin = examin;
    this.examin = examin;
    // console.log('[1705][Examine][기사]', exam, this.examedname, this.examedno);
  }

  // tslint:disable-next-line: typedef
  savePathologyData() {
    this.convertFormData();
    console.log('[1128][1차전송][savePathologyData][환자정보][this.basicInfo]', this.basicInfo);
    console.log('[1182][1차전송][환자정보][patientInfo]', this.patientInfo);
    console.log('[1182][1차전송][savePathologyData][검체정보][extraction]', this.extraction);
    console.log('[1182][1차전송][savePathologyData][MUTATION]', this.mutation);
    console.log('[1182][1차전송][savePathologyData][AMFLIFICATIONS]', this.amplifications);
    console.log('[1182][1차전송][savePathologyData][FUSION]', this.fusion);
    console.log('[1182][1차전송][savePathologyData][I-MUTAION]', this.imutation);
    console.log('[1182][1차전송][savePathologyData][I-AMPLIFICATIONS]', this.iamplifications);
    console.log('[1182][1차전송][savePathologyData][I-FUSION]', this.ifusion);
    console.log('[1182][1차전송][savePathologyData][멘트][ment]', this.generalReport, this.specialment, this.notement);
    console.log('[1182][1차전송][검수자/확인자][1]', this.examedname, this.examedno, this.checkername, this.checkeredno);
    console.log('[1182][1차전송][검수자/확인자][2]', this.mt, this.dt);
    console.log('[검체번호]', this.pathologyNum);


    this.subs.sink = this.savepathologyService.savePathologyData(
      this.basicInfo.pathologyNum,
      this.patientInfo,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction,
      this.generalReport,
      this.specialment,
      this.notement,
      this.stateControl
    )
      .subscribe(data => {
        console.log('[1182][savePathologyData]', data);
        if (data.info === 'SUCCESS') {
          alert('저장 했습니다.');
          this.store.setDBSaved(true);


          this.subs.sink = this.searchService.screenPathologyEmrUpdate(this.basicInfo.pathologyNum)
            .subscribe(datas => {
              console.log('[1189][savePathologyData][screenPathologyEmrUpdate]', datas);
              this.router.navigate(['/pathology']);
            });

        }
      });

  }

  updatePathologyData(): void {
    this.convertFormData();

    console.log('[1227][report][updatePathologyData][환자정보][this.basicInfo]', this.basicInfo);
    console.log('[1227][updatePathologyData][환자정보][patientInfo]', this.patientInfo);
    console.log('[1227][report][updatePathologyData][검체정보][extraction]', this.extraction);
    console.log('[1227][report][updatePathologyData][mutaion]', this.mutation);
    console.log('[1227][report][updatePathologyData][amplifications]', this.amplifications);
    console.log('[1227][report][updatePathologyData][fusion]', this.fusion);
    console.log('[1227][report][updatePathologyData][imutation]', this.imutation);
    console.log('[1227][report][updatePathologyData][iamplifications]', this.iamplifications);
    console.log('[1227][report][updatePathologyData][ifusion]', this.ifusion);
    console.log('[1227][report][updatePathologyData][멘트][ment]', this.generalReport, this.specialment, this.notement);
    console.log('[1227][updatePathologyData][검수자/확인자][]', this.examedname, this.examedno, this.checkername, this.checkeredno);

    this.subs.sink = this.savepathologyService.updatePathologyData(
      this.basicInfo.pathologyNum,
      this.patientInfo,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction,
      this.generalReport,
      this.specialment,
      this.notement
    ).subscribe(data => {
      console.log('[1219][savePathologyData]', data);
      if (data.info === 'SUCCESS') {
        alert('저장 했습니다.');
        this.store.setDBSaved(true);


        this.subs.sink = this.searchService.screenPathologyUpdate(this.basicInfo.pathologyNum)
          .subscribe(datas => {
            console.log('[1226][savePathologyData][screenPathologyEmrUpdate]', datas);
            this.router.navigate(['/pathology']);
          });
      }
    });

  }
  ////////////////////////////////////////////////////////////////////////////////////////////
  tempSave(): void {
    if (this.examedno === 'none') {
      const tempex = confirm('검사자 선택이 안되어 있습니다. 전송하시겠습니까.');
      if (tempex === false) {
        return;
      }
    } else if (this.checkeredno === 'none') {
      const tempch = confirm('확인자 선택이 안되어 있습니다. 전송하시겠습니까.');
      if (tempch === false) {
        return;
      }
    }

    this.convertFormData();

    console.log('[2026][임시저장][환자정보][this.basicInfo]', this.basicInfo);
    console.log('[2026][임시저장][환자정보][patientInfo]', this.patientInfo);
    console.log('[2026][임시저장][검체정보][extraction]', this.extraction);
    console.log('[2026][임시저장][mutaion]', this.mutation);
    console.log('[2026][임시저장][amplifications]', this.amplifications);
    console.log('[2026][임시저장][fusion]', this.fusion);
    console.log('[2026][임시저장][imutation]', this.imutation);
    console.log('[2026][임시저장][iamplifications]', this.iamplifications);
    console.log('[2026][임시저장][ifusion]', this.ifusion);
    console.log('[2026][임시저장][멘트][ment]', this.generalReport, this.specialment, this.notecontents);
    console.log('[2026][임시저장][검수자/확인자][]', this.examedname, this.examedno, this.checkername, this.checkeredno);
    console.log('[2026][임시저장][정도관리] ', this.stateControl);
    this.subs.sink = this.savepathologyService.savePathologyData(
      this.basicInfo.pathologyNum,
      this.patientInfo,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction,
      this.generalReport,
      this.specialment,
      this.notecontents,
      // this.notement,
      this.stateControl
    ).subscribe(data => {
      console.log('[2054][tempSave]  ====> ', data);
      if (data.info === 'SUCCESS') {
        alert('저장 했습니다.');
        this.store.setDBSaved(true);

        this.searchService.resetscreenstatus(this.pathologyNum, '1')
          .subscribe(msg => {
            this.screenstatus = '1';
            console.log('[]', msg.message);
          });
      }
    });


  }

  initSave(): void {
    this.convertFormData();

    console.log('[2026][초기저장][환자정보][this.basicInfo]', this.basicInfo);
    console.log('[2026][초기저장][환자정보][patientInfo]', this.patientInfo);
    console.log('[2026][초기저장][검체정보][extraction]', this.extraction);
    console.log('[2026][초기저장][mutaion]', this.mutation);
    console.log('[2026][초기저장][amplifications]', this.amplifications);
    console.log('[2026][초기저장][fusion]', this.fusion);
    console.log('[2026][초기저장][imutation]', this.imutation);
    console.log('[2026][초기저장][iamplifications]', this.iamplifications);
    console.log('[2026][초기저장][ifusion]', this.ifusion);
    console.log('[2026][초기저장][멘트][ment]', this.generalReport, this.specialment, this.notecontents);
    console.log('[2026][초기저장][검수자/확인자][]', this.examedname, this.examedno, this.checkername, this.checkeredno);
    console.log('[2026][초기저장][정도관리] ', this.stateControl);
    this.subs.sink = this.savepathologyService.savePathologyData(
      this.basicInfo.pathologyNum,
      this.patientInfo,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction,
      this.generalReport,
      this.specialment,
      this.notecontents,
      // this.notement,
      this.stateControl
    ).subscribe(data => {
      console.log('[2054][tempSave]  ====> ', data);
      if (data.info === 'SUCCESS') {
        alert('저장 했습니다.');
        this.store.setDBSaved(true);

        this.searchService.resetscreenstatus(this.pathologyNum, '1')
          .subscribe(msg => {
            this.screenstatus = '1';
            console.log('[]', msg.message);
          });
      }
    });
  }


  ////////////////////////////////////////////////////////////////////////////////////////////
  // mutationForm

  createMutaion(mutation: IMutation, index: string): FormGroup {
    // console.log('[617][][createMutaion][mutation]', mutation);
    return this.fb.group({
      gene: mutation.gene,
      aminoAcidChange: mutation.aminoAcidChange,
      nucleotideChange: mutation.nucleotideChange,
      variantAlleleFrequency: mutation.variantAlleleFrequency,
      ID: mutation.ID,
      tier: mutation.tier,
      seq: index,
      transcript: mutation.transcript
    });
  }

  mutationLists(): FormArray {
    return this.mutationForm.get('mutationLists') as FormArray;
  }

  newMutation(): FormGroup {
    return this.fb.group({
      gene: '',
      aminoAcidChange: '',
      nucleotideChange: '',
      variantAlleleFrequency: '',
      ID: '',
      tier: '',
      seq: '',
      transcript: ''
    });
  }

  addMutation(): void {
    // console.log('[1815][addMutation]');
    this.mutationLists().push(this.newMutation());
    this.mutation.push({
      gene: '', aminoAcidChange: '', nucleotideChange: '', variantAlleleFrequency: '', ID: '', seq: ''
    });
    const len = this.mutationLists().getRawValue().length;
    // console.log('[1233][addMutation]', len);
    if (len > 0) {
      this.noneMu = '';
    } else {
      this.noneMu = 'None';
    }

    console.log('[1828][addMutation]', len, this.noneMu);
  }

  removeMutation(i: number): void {
    this.mutationLists().removeAt(i);
    this.mutation.splice(i, 1);
    const len = this.mutationLists().getRawValue().length;
    if (len === 0) {
      this.noneMu = 'None';
    } else {
      this.noneMu = '';
    }
    console.log('[1316][removeMutation]', len, this.noneMu);
  }
  /////////////////////////////////////////////////////////////////////
  // amplificationsForm

  createAmplifications(amplifications: IAmplification, index: string): FormGroup {
    return this.fb.group({
      gene: amplifications.gene,
      region: amplifications.region,
      copynumber: amplifications.copynumber,
      tier: amplifications.tier,
      seq: index
    });
  }

  amplificationsLists(): FormArray {
    return this.amplificationsForm.get('amplificationsLists') as FormArray;
  }

  newAmplifications(): FormGroup {
    return this.fb.group({
      gene: '',
      region: '',
      copynumber: '',
      tier: '',
      seq: ''
    });
  }

  addAmplifications(): void {
    this.amplificationsLists().push(this.newAmplifications());
    this.amplifications.push({
      gene: '', region: '', copynumber: '', tier: '', seq: ''
    });
    const len = this.amplificationsLists().getRawValue().length;
    if (len > 0) {
      this.noneAm = '';
    } else {
      this.noneAm = 'None';
    }
  }

  removeAmplifications(i: number): void {
    this.amplificationsLists().removeAt(i);
    this.amplifications.splice(i, 1);
    const len = this.amplificationsLists().getRawValue().length;
    if (len === 0) {
      this.noneAm = 'None';
    }
  }
  ////////////////////////////////////////////////////////////////////
  // fusionForm

  createFusion(fusion: IFusion, index: string): FormGroup {
    // console.log('[925][fusion][3][createFusion 호출]', fusion);
    return this.fb.group({
      gene: fusion.gene,
      breakpoint: fusion.breakpoint,
      functions: fusion.functions,
      readcount: fusion.readcount,
      tier: fusion.tier,
      seq: index
    });
  }

  fusionLists(): FormArray {
    // console.log('[936][fusion][2][fusionLists 호출]');
    return this.fusionForm.get('fusionLists') as FormArray;
  }

  newFusion(): FormGroup {
    // console.log('[941][fusion][newFusion]');
    return this.fb.group({
      gene: '',
      breakpoint: '',
      functions: '',
      readcount: '',
      tier: '',
      seq: ''
    });
  }

  addFusion(): void {
    this.fusionLists().push(this.newFusion());
    this.fusion.push({
      gene: '', breakpoint: '', functions: '', readcount: '', tier: '', seq: ''
    });
    const len = this.fusionLists().getRawValue().length;
    if (len > 0) {
      this.noneFu = '';
    } else {
      this.noneFu = 'None';
    }
  }

  removeFusion(i: number): void {
    this.fusionLists().removeAt(i);
    this.fusion.splice(i, 1);
    const len = this.fusionLists().getRawValue().length;
    if (len === 0) {
      this.noneFu = 'None';
    } else {
      this.noneFu = '';
    }
  }

  ////////////////////////////////////////////////////////////////////
  // imutationForm
  createIMutaion(mutation: IMutation, index: string): FormGroup {
    return this.fb.group({
      gene: mutation.gene,
      aminoAcidChange: mutation.aminoAcidChange,
      nucleotideChange: mutation.nucleotideChange,
      variantAlleleFrequency: mutation.variantAlleleFrequency,
      ID: mutation.ID,
      tier: mutation.tier,
      seq: index,
      transcript: mutation.transcript
    });
  }

  imutationLists(): FormArray {
    return this.imutationForm.get('imutationLists') as FormArray;
  }

  newIMutation(): FormGroup {
    return this.fb.group({
      gene: '',
      aminoAcidChange: '',
      nucleotideChange: '',
      variantAlleleFrequency: '',
      ID: '',
      tier: '',
      seq: '',
      transcript: ''
    });
  }

  addIMutation(): void {
    this.imutationLists().push(this.newIMutation());
    this.imutation.push({
      gene: '', aminoAcidChange: '', nucleotideChange: '', variantAlleleFrequency: '', ID: '', tier: '', seq: '', transcript: ''
    });
    const len = this.imutationLists().getRawValue().length;
    console.log('[1436][ addIMutation]', len);
    if (len > 0) {
      this.noneIMu = '';
    } else {
      this.noneIMu = 'None';
    }
  }

  removeIMutation(i: number): void {
    this.imutationLists().removeAt(i);
    this.imutation.splice(i, 1);
    const len = this.imutationLists().getRawValue().length;
    console.log('[1447][removeIMutation]', len);
    if (len === 0) {
      this.noneIMu = 'None';
    }
  }

  /////////////////////////////////////////////////////////////////////
  // iamplificationsForm
  createIAmplifications(amplifications: IIAmplification, index: string): FormGroup {
    // console.log('[942][createIAmplifications][amplifications]', amplifications);
    return this.fb.group({
      gene: amplifications.gene,
      region: amplifications.region,
      copynumber: amplifications.copynumber,
      note: amplifications.note,
      seq: index
    });
  }

  iamplificationsLists(): FormArray {
    return this.iamplificationsForm.get('iamplificationsLists') as FormArray;
  }

  newIAmplifications(): FormGroup {
    return this.fb.group({
      gene: '',
      region: '',
      copynumber: '',
      note: '',
      seq: ''
    });
  }

  addIAmplifications(): void {
    this.iamplificationsLists().push(this.newIAmplifications());
    this.iamplifications.push({
      gene: '', region: '', copynumber: '', note: '', seq: ''
    });
    const len = this.iamplificationsLists().getRawValue().length;
    if (len > 0) {
      this.noneIAm = '';
    } else {
      this.noneIAm = 'None';
    }
  }

  removeIAmplifications(i: number): void {
    this.iamplificationsLists().removeAt(i);
    this.iamplifications.splice(i, 1);
    const len = this.iamplificationsLists().getRawValue().length;
    if (len === 0) {
      this.noneIAm = 'None';
    }
  }
  ////////////////////////////////////////////////////////////////////
  // ifusionForm
  /*

  */
  createIFusion(fusion: IFusion, index: string): FormGroup {
    // console.log('===== [1471][ createIFusion]', fusion);

    return this.fb.group({
      gene: fusion.gene,
      breakpoint: fusion.breakpoint,
      functions: fusion.functions,
      readcount: fusion.readcount,
      tier: fusion.tier,
      seq: index
    });
  }

  ifusionLists(): FormArray {
    return this.ifusionForm.get('ifusionLists') as FormArray;
  }

  newIFusion(): FormGroup {
    return this.fb.group({
      gene: '',
      breakpoint: '',
      functions: '',
      readcount: '',
      tier: '',
      seq: ''
    });
  }

  addIFusion(): void {
    this.ifusionLists().push(this.newIFusion());
    this.ifusion.push({
      gene: '', breakpoint: '', functions: '', readcount: '', tier: '', seq: ''
    });
    const len = this.ifusionLists().getRawValue().length;
    if (len > 0) {
      this.noneIFu = '';
    } else {
      this.noneIFu = 'None';
    }
  }

  removeIFusion(i: number): void {
    this.ifusionLists().removeAt(i);
    this.ifusion.splice(i, 1);
    const len = this.ifusionLists().getRawValue().length;
    if (len === 0) {
      this.noneIFu = 'None';
    }
  }
  ////////////////////////////////////////////////////////////////////

  today(): string {
    // const today = new Date();

    // const year = today.getFullYear(); // 년도
    // const month = today.getMonth() + 1;  // 월
    // const date = today.getDate();  // 날짜

    // const newmon = ('0' + month).substr(-2);
    // const newday = ('0' + date).substr(-2);
    // const now = year + '.' + newmon + '.' + newday;

    // return now;
    const oneMonthsAgo = moment();

    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');

    const now = yy + '.' + mm + '.' + dd;
    return now;
  }

  reset(): void {

    this.searchService.resetscreenstatus(this.pathologyNum, '1')
      .subscribe(data => {
        /*
        */
        this.patientInfo.screenstatus = '1';
        this.screenstatus = '1';
        console.log(this.screenstatus);
      });

  }
  // polymorphismList에 3개가 동일하면 삭제
  removeGeneCheck(gene: string, amino: string, nucleotide: string): number {
    
    console.log('[2779][removeIMutation]', gene, amino, nucleotide );

    const result = this.polymorphismList.findIndex(item =>
      item.gene === gene && item.amino_acid_change === amino && item.nucleotide_change === nucleotide
    );

    return result;

  }

  tumormutationalburdenChange(burden: string): void {
    this.extraction.tumorburden = burden;
  }

  msiScoreChange(msiscore: string): void {
    // console.log('[2187][MSISCORE]', msiscore.split('').includes('('));
    this.extraction.msiscore = msiscore;
  }
  ///////////////////////////////////////////////////////////////////
  check(): void {
    this.init(this.pathologyNum);
  }

  printScreen(): void {
    window.print();

  }

  getStatus(index): boolean {
    // console.log('[661][getStatus]', index, this.screenstatus);

    if (index === 1) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 3 || parseInt(this.screenstatus, 10) === 4) {
        return true;
      }

    } else if (index === 3) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 3 || parseInt(this.screenstatus, 10) === 4) {
        return true;
      }
    } else if (index === 4) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return false;
      }
    }
  }
  ///////////////////////////////////////////////////////////////////
  statusControl(status: string): void {
    this.searchService.resetscreenstatus(this.pathologyNum, status)
      .subscribe(msg => {
        this.screenstatus = status;
        console.log('[상태변경]', msg.message, this.screenstatus);
      });
  }

  //////////////////////////////////////////////////
  // 필수유전자 코멘트
  essenceDNAComment(typetumor: string, lists: { type: string, dna: string }[]): void {
    let mentContent;
    const mentLists = Object.values(essentialDNAMentList);
    // console.log('[2554][] *** ', typetumor, mentLists);
    // console.log('[2425][] *** ', mentLists.filter(mentlist => mentlist.title.toLowerCase() === typetumor.toLowerCase()));
    const temp = mentLists.filter(mentlist => mentlist.title.toLowerCase() === typetumor.toLowerCase());
    if (temp.length) {
      mentContent = mentLists.filter(mentlist => mentlist.title.toLowerCase() === typetumor.toLowerCase())[0].content;

      lists.forEach(list => {
        mentContent.forEach(ment => {
          if (ment.type.toLowerCase() === list.type.toLowerCase()) {
            // console.log('[2302][]', ment.type.toLowerCase(), list.type.toLowerCase(), ment.data);
            const mentId = ment.data.findIndex(item => item === list.dna);
            if (mentId !== -1) {
              ment.data.splice(mentId, 1);
            }

          }
        });
      });
      // console.log('[2438][ment]', mentContent);
      try {
        if (mentContent.length > 0) {
          let muDNA = '';
          let amDNA = '';
          let fuDNA = '';
          mentContent.forEach(item => {
            if (item.type.toLowerCase() === 'mutation') {
              item.data.forEach((dna, index) => {
                if (index === 0) {
                  muDNA = dna;
                } else {
                  muDNA = muDNA + ', ' + dna;
                }
              });
              // console.log('[2453][mutation]**** ', muDNA);
              muDNA = '-' + item.type + ': ' + muDNA;
            } else if (item.type.toLowerCase() === 'amplification') {
              item.data.forEach((dna, index) => {
                if (index === 0) {
                  amDNA = dna;
                } else {
                  amDNA = amDNA + ', ' + dna;
                }
              });
              amDNA = '-' + item.type + ': ' + amDNA;
            } else if (item.type.toLowerCase() === 'fusion') {
              item.data.forEach((dna, index) => {
                if (index === 0) {
                  fuDNA = dna;
                } else {
                  fuDNA = fuDNA + ', ' + dna;
                }
              });
              fuDNA = '-' + item.type + ' / Exon variant: ' + fuDNA;
            }
          });

          this.specialment = `${muDNA}
 ${amDNA}
 ${fuDNA}`;
        }

      } catch (error) {
        console.log(error);
      }
    } else { this.specialment = ''; } // line 2557

  }

  //////////////////////////////////////////////////////////
  goBack(): void {
    this.router.navigate(['/pathology']);
  }

  ///////////////////////////////////////////////////
  // this.mutationForm.get('mutationLists') as FormArray
  commentDroped(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const mutationControl = this.mutationForm.get('mutationLists') as FormArray;
    this.moveItemInCommentArray(mutationControl, from1, to);
  }
  /////////////////////////////////////////////////////////////////////////////
  //// this.amplificationsForm.get('amplificationsLists')
  commentDroped2(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const amplificationsControl = this.amplificationsForm.get('amplificationsLists') as FormArray;
    this.moveItemInCommentArray(amplificationsControl, from1, to);
  }
  /////////////////////////////////////////////////////////////////////////////////////
  /// this.fusionForm.get('fusionLists')
  commentDroped3(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const fusionControl = this.fusionForm.get('fusionLists') as FormArray;
    this.moveItemInCommentArray(fusionControl, from1, to);
  }
  ///////////////////////////////////////////////////////////////////////////
  /// this.imutationForm.get('imutationLists')
  commentDroped4(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const imutationControl = this.imutationForm.get('imutationLists') as FormArray;
    this.moveItemInCommentArray(imutationControl, from1, to);
  }
  //////////////////////////////////////////////////////////////////
  // this.iamplificationsForm.get('iamplificationsLists')
  commentDroped5(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const iamplificationsControl = this.iamplificationsForm.get('iamplificationsListss') as FormArray;
    this.moveItemInCommentArray(iamplificationsControl, from1, to);
  }

  //////////////////////////////////////////////////////////////////////////////////
  //// this.ifusionForm.get('ifusionLists')
  commentDroped6(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const ifusionControl = this.ifusionForm.get('ifusionLists') as FormArray;
    this.moveItemInCommentArray(ifusionControl, from1, to);
  }
  ////////////////////////////////////////////////////////////////////////////////

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

  /** Clamps a number between zero and a maximum. */
  clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
  }

  ////////////////////////////////////////////////////////
  /// Clinically mutation ===>  Prevalent mutation 로 이동
  fromClinicallyMuToPrevalentMu(i: number): void {

    const muControl = this.mutationLists();
    const muVal = muControl.at(i).value;
    this.removeMutation(i);
    const allmuVal = muControl.getRawValue();
    for (let seq = 0; seq < allmuVal.length; seq++) {
      muControl.at(seq).patchValue({ seq });
    }
    console.log('[2636]', i, allmuVal);

    const imuControl = this.imutationLists();
    const ilen = imuControl.getRawValue().length;
    imuControl.push(this.createIMutaion(muVal, ilen.toString()));
  }

  // Clinically Copy number alteration ===> Prevalent Copy number alteration 로 이동
  fromClinicallyCopynumberToPrevalentCopynumber(i: number): void {
    const cyControl = this.amplificationsLists();
    const cyVal = cyControl.at(i).value;
    this.removeAmplifications(i);
    const allcyVal = cyControl.getRawValue();
    for (let seq = 0; seq < allcyVal.length; seq++) {
      cyControl.at(seq).patchValue({ seq });
    }
    console.log('[2660]', i, allcyVal);

    const icyControl = this.iamplificationsLists();
    const ilen = icyControl.getRawValue().length;
    icyControl.push(this.createIAmplifications({
      ...cyVal, note: cyVal.tier
    }, ilen.toString()));
    // icyControl.push(this.createIAmplifications(cyVal, ilen.toString()));
  }

  /// Clinically fusion ===> Prevalent fusion 로 이동
  fromClinicallyFuToPrevalentFu(i: number): void {
    const fuControl = this.fusionLists();
    const fuVal = fuControl.at(i).value;
    this.removeFusion(i);
    const allFuVal = fuControl.getRawValue();
    for (let seq = 0; seq < allFuVal.length; seq++) {
      fuControl.at(seq).patchValue({ seq });
    }

    const ifuControl = this.ifusionLists();
    const ilen = ifuControl.getRawValue().length;
    ifuControl.push(this.createIFusion(fuVal, ilen.toString()));

  }

  /// Prevalent mutation ===> Clinically mutation  로 이동
  fromPrevalentMuToClinicallyMu(i: number): void {
    const imuControl = this.imutationLists();
    const imuVal = imuControl.at(i).value;
    this.removeIMutation(i);
    const allimuVal = imuControl.getRawValue();
    for (let seq = 0; seq < allimuVal.length; seq++) {
      imuControl.at(seq).patchValue({ seq });
    }

    const muControl = this.mutationLists();
    const len = muControl.getRawValue().length;
    muControl.push(this.createMutaion(imuVal, len.toString()));

  }

  /// Prevalent Copy number alteration ===> Clinically Copy number alteration  2700 줄로 이동
  fromPrevalenCopynumberTotClinicallyCopynumber(i: number): void {
    const icyControl = this.iamplificationsLists();
    const icyVal = icyControl.at(i).value;
    this.removeIAmplifications(i);
    const allicyVal = icyControl.getRawValue();
    for (let seq = 0; seq < allicyVal.length; seq++) {
      icyControl.at(seq).patchValue({ seq });
    }

    const cyControl = this.amplificationsLists();
    const len = cyControl.getRawValue().length;
    cyControl.push(this.createAmplifications({ ...icyVal, tier: icyVal.note }, len.toString()));

  }

  /// Prevalent fusion ===> Clinically fusion  로 이동  2288
  fromPrevalentFuToClinicallyFu(i: number): void {
    const ifuControl = this.ifusionLists();
    const ifuVal = ifuControl.at(i).value;
    this.removeIFusion(i);
    const alliFuVal = ifuControl.getRawValue();
    for (let seq = 0; seq < alliFuVal.length; seq++) {
      ifuControl.at(seq).patchValue({ seq });
    }

    const fuControl = this.fusionLists();
    const len = fuControl.getRawValue().length;
    fuControl.push(this.createFusion(ifuVal, len.toString()));
  }

  openDialog(i: number, type: string): void {
    let rowData;
    let direction = '';
    let itemType = '';
    if (type === 'cMu') {
      const muControl = this.mutationLists();
      rowData = muControl.at(i).value;
      direction = 'C -> P';
      itemType = 'MU';
    } else if (type === 'cCy') {
      const cyControl = this.amplificationsLists();
      rowData = cyControl.at(i).value;
      direction = 'C -> P';
      itemType = 'CP';
    } else if (type === 'cFu') {
      const fuControl = this.fusionLists();
      rowData = fuControl.at(i).value;
      direction = 'C -> P';
      itemType = 'FU';
    } else if (type === 'pMu') {
      const imuControl = this.imutationLists();
      rowData = imuControl.at(i).value;
      direction = 'P -> C';
      itemType = 'MU';
    } else if (type === 'pCy') {
      const icyControl = this.iamplificationsLists();
      rowData = icyControl.at(i).value;
      direction = 'P -> C';
      itemType = 'CP';
    } else if (type === 'pFu') {
      const ifuControl = this.ifusionLists();
      rowData = ifuControl.at(i).value;
      direction = 'P -> C';
      itemType = 'FU';
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      ...rowData, direction, itemType, pathologyNum: this.patientInfo.pathology_num
    };
    dialogConfig.maxWidth = '100vw';
    dialogConfig.maxHeight = '100vh';

    const dialogRef = this.dialog.open(ReportDialogComponent, dialogConfig);
    dialogRef.afterClosed()
      .pipe(
        filter(val => !!val)
      ).subscribe(data => {

        if (type === 'cMu') {
          this.fromClinicallyMuToPrevalentMu(i);
        } else if (type === 'cCy') {
          this.fromClinicallyCopynumberToPrevalentCopynumber(i);
        } else if (type === 'cFu') {
          this.fromClinicallyFuToPrevalentFu(i);
        } else if (type === 'pMu') {
          this.fromPrevalentMuToClinicallyMu(i);
        } else if (type === 'pCy') {
          this.fromPrevalenCopynumberTotClinicallyCopynumber(i);
        } else if (type === 'pFu') {
          this.fromPrevalentFuToClinicallyFu(i);
        }
        console.log('[2478][다이얼로그]', data);

      });
  }

  essentialMent(): void {
    let muDNA = '';
    let amDNA = '';
    let fuDNA = '';
    this.sequencingService.getEssTitle()
      .subscribe(data => {
        console.log('[2916][필수유전자목록][유전자]', data, this.extraction.tumortype);
        const idx = data.findIndex(list => list.title.toLowerCase() === this.extraction.tumortype.toLowerCase());
        if (idx !== -1) {
          const { id, title, mutation, amplification, fusion } = data[idx];
          if (mutation.length) {
            muDNA = '- Mutation: ' + mutation + '\n';
          }

          if (amplification.length) {
            amDNA = '- Amplification: ' + amplification + '\n';
          }

          if (fusion.length) {
            fuDNA = '- Fusion: ' + fusion;
          }
          this.specialment = `${muDNA} ${amDNA} ${fuDNA}`;
        } else {
          this.specialment = '';
        }


      });
  }


  getTierValue(gene: string): string {
        const idx = this.clinical.findIndex(list => list.gene === gene);
        return this.clinical[idx].tier;
  }

}


// const idx = this.clinical.findIndex(list => list.gene === gene && list.tier !== 'III');
    
// if (idx === -1) {
//   return '';
// }
// return this.clinical[idx].tier;
