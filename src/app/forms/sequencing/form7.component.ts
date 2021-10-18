import { Component, OnInit, OnDestroy } from '@angular/core';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { UtilsService } from '../commons/utils.service';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IPatient, ISequence } from 'src/app/home/models/patients';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { concatMap, map, shareReplay } from 'rxjs/operators';
import { FindNgsTitleService } from '../commons/findngstitle.service';
import { sequencingForm } from 'src/app/home/models/sequencing.model';
import { listSequencing } from 'src/app/forms/commons/geneList';


@Component({
  selector: 'app-form7',
  templateUrl: './form7.component.html',
  styleUrls: ['./form7.component.scss']
})
export class Form7Component implements OnInit, OnDestroy {

  form2TestedId: string;
  sequences: ISequence[] = [];
  sendEMR = 0; // EMR 보낸 수

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
    tsvFilteredStatus: '',
    bamFilename: '',
    sendEMRDate: '',
    report_date: '',
    specimenNo: '',
    test_code: '',
    screenstatus: '',
    recheck: '',
    examin: '',
  };

  isVisible = false;
  examin = ''; // 검사자
  recheck = ''; // 확인자
  requestDate: string; // 검사의뢰일
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일
  reportType: string; //

  resultStatus = 'Detected';
  vusmsg = '';
  screenstatus: string;
  mockData: ISequence[] = [];

  form: FormGroup;
  ngsTitle: string;
  comment = `수기입력.  APC 유전자 분석결과, 가족성 선종성 용종증과 관련되어 기존에 보고된 nonsense mutation인 p.(Tyr493*) 이 관찰되었습니다. 가족성 선종성 용종증은 상염색체 우성 유전질환으로 환자의 75%-85%에서 이환된 부모의 가족력이 있습니다. 환자의 가족검사를 추천합니다`;
  comment1 = `대장암의 약 70% 정도에서 adenoma-cancer carcinogenesis에 의하여 생기며, 이러한 대장암의 발생`;
  comment2 = `본 검사는 reference sequence NM_000038.5를 기준으로 APC 유전자의 coding exon 및 인접 flanking region을 직접염기서열법으로 분석하는 방법입니다.`;
  resultname = '';
  targetdisease = '';
  analyzedgene = '';
  method = '*Direct sequencing for whole exons including intron-exon boundaries';
  specimen = 'Genomic DNA isolated from peripheral blood leukocytes-adequate specimen';
  seqcomment = `*Sequencing has an analytical sensitivity of approximately 99% for the detection of nucleotide base alterations, small deletions and insertions, but it does not detect large deletions. Low-level mosaicism will not be detected by routine sequencing methodologies. Only the coding and immediate flanking regions of genes are analyzed, new splice sites, changes in the promoter region, and other non-coding or regulatory region will not be detected.`;
  types: string[] = ['Pathogenic', 'Likely Pathogenic', 'VUS'];
  zygosity: string[] = ['Heterozygous', 'Homozygous'];

  variations = '';
  private subs = new SubSink();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private patientsListService: PatientsListService,
    private utilsService: UtilsService,
    private variantsService: DetectedVariantsService,
    private titleService: FindNgsTitleService,
  ) { }

  ngOnInit(): void {
    this.initLoad();
    this.loadForm();
    this.getSequencing();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadForm(): void {
    this.form = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list))),

    });

  }


  initLoad(): void {
    // 검진부서원 리스트 스토어에서 가져옴.
    this.form2TestedId = this.patientsListService.getTestedID();
    // 검사자 정보 가져오기
    if (this.form2TestedId === null || this.form2TestedId === undefined) {
      this.router.navigate(['/diag']);
      return;
    }

    this.patientInfo = this.getPatientinfo(this.form2TestedId);
    // 임시변경
    // this.patientInfo.screenstatus = '0';
    console.log('[128] 환자정보: ', this.patientInfo);
    this.resultname = this.patientInfo.worker; // 병명
    if (parseInt(this.screenstatus, 10) === 0) {
      // 전송횟수, 검사보고일, 수정보고일  저장
      this.setReportdaymgn(this.patientInfo);
    } else if (parseInt(this.screenstatus, 10) > 0) {
      // 판독자 , 검사자
      if (this.patientInfo.examin.length) {
        this.examin = this.patientInfo.examin;
      }

      if (this.patientInfo.recheck.length) {
        this.recheck = this.patientInfo.recheck;
      }

      this.getSendEMR(this.patientInfo);
    }


    this.vusmsg = this.patientInfo.vusmsg;
    // 검체 감염유부 확인
    if (parseInt(this.patientInfo.detected, 10) === 0) {
      this.resultStatus = 'Detected';
    } else if (parseInt(this.patientInfo.detected, 10) === 1) {
      this.resultStatus = 'Not Detected';
    }


    this.requestDate = this.patientInfo.accept_date;

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);

    this.screenstatus = this.patientInfo.screenstatus;

  }

  getPatientinfo(testid: string): any {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.specimenNo === testid)[0];
    }
    return;
  }

  // 내역 가져오기
  getSequencing(): void {
    // this.ngsTitle = this.patientInfo.reportTitle;
    // 임시사용
    this.ngsTitle = this.titleService.findSequencingTitle(this.patientInfo.test_code);
    this.subs.sink = this.variantsService.contentScreen7(this.form2TestedId)
      .subscribe(data => {
        console.log('[178][받은데이터]', data);
        if (data.length > 0) {
          this.comment = data[0].comment;
          this.comment1 = data[0].comment1;
          this.comment2 = data[0].comment2;
          this.seqcomment = data[0].seqcomment;

          data.forEach(item => {
            this.sequencingRows().push(this.createRow(
              {
                type: item.type,
                exonintron: item.exonintron,
                nucleotideChange: item.nucleotideChange,
                aminoAcidChange: item.aminoAcidChange,
                zygosity: item.zygosity,
                rsid: item.rsid,
                genbankaccesion: item.genbankaccesion
              }
            ));
          });

        }

      });

    this.subs.sink = this.variantsService.contentTestScreen7(this.form2TestedId)
      .subscribe(data => {
        console.log('[205][Test Information]', data);
        if (data.length > 0) {
          this.resultname = data[0].result;
          this.targetdisease = data[0].target;
          this.method = data[0].method;
          this.analyzedgene = data[0].analyzedgene;
          this.variations = data[0].identified_variations;
          this.specimen = data[0].specimen;
        }

      });
  }

  // 미리보기
  previewToggle(): void {
    this.isVisible = !this.isVisible;
    const control = this.form.get('tableRows') as FormArray;
    this.sequences = control.getRawValue() as ISequence[];
  }

  // 미리보기 종료
  closeModal(): void {
    this.isVisible = !this.isVisible;
  }

  getSendEMR(patientInfo: IPatient): void {
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
  }



  // 검사일/검사보고일/수정보고일 관리
  setReportdaymgn(patientInfo: IPatient): void {
    this.getSendEMR(patientInfo);

    // 판독자 , 검사자
    if (patientInfo.examin.length) {
      this.examin = patientInfo.examin;
    }

    if (patientInfo.recheck.length) {
      this.recheck = patientInfo.recheck;
    }
    if (patientInfo.examin.length === 0 && patientInfo.recheck.length === 0) {

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
    }

  }

  tempSave(): void {
    const userid = localStorage.getItem('diaguser');
    const control = this.form.get('tableRows') as FormArray;
    const formData = control.getRawValue();

    if (parseInt(this.patientInfo.screenstatus, 10) > 3) {
      this.patientInfo.screenstatus = '3';
      this.screenstatus = '3';
    }
    console.log('[301][임시저장][screenstatus]', this.screenstatus);

    this.patientInfo.recheck = this.recheck;
    this.patientInfo.examin = this.examin;
    // console.log('[1729][tempSave]patient,reform,comment]', this.patientInfo, formData, this.comments);
    this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimenNo)
      .subscribe(datas => console.log(datas));
    this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimenNo)
      .subscribe(datas => console.log(datas));

    this.subs.sink = this.variantsService.saveScreen7(
      this.resultStatus, this.form2TestedId, formData, this.patientInfo, this.comment,
      this.comment1, this.comment2, this.seqcomment, this.resultname, this.patientInfo.test_code, this.variations,
      this.targetdisease, this.method, this.analyzedgene, this.specimen)
      .subscribe(data => {
        this.patientsListService.changescreenstatus(this.form2TestedId, this.screenstatus, userid, 'SEQN').subscribe();
        alert('저장되었습니다.');
      });
  }

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

  gotoEMR(): void {
    const userid = localStorage.getItem('diaguser');
    const control = this.form.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    console.log(formData);

    if (this.firstReportDay === '-') {
      this.firstReportDay = this.today().replace(/-/g, '.');
    }

    if (this.sendEMR >= 1) {
      this.lastReportDay = this.today().replace(/-/g, '.');
    }

    // console.log('[EMR]', this.target, this.formTitle);

    const makeForm = sequencingForm(
      this.resultStatus,
      this.resultname, // 볌명
      this.targetdisease,
      this.analyzedgene,
      this.method,
      this.specimen,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.ngsTitle, // 제목,
      this.patientInfo.accept_date, // 검사의뢰일
      this.firstReportDay,
      this.lastReportDay,
      this.patientInfo,
      formData,
      this.comment,
      this.comment1,
      this.comment2,
      this.seqcomment,
      this.variations
    );

    console.log('[287] ', makeForm);
    const examcode = this.patientInfo.test_code;
    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      examcode,
      makeForm)
      .pipe(
        concatMap(() => this.patientsListService.changescreenstatus(this.form2TestedId, '3', userid, 'SEQN')),
        concatMap(() => this.patientsListService.setEMRSendCount(this.form2TestedId, ++this.sendEMR)), // EMR 발송횟수 전송
      ).subscribe((msg: { screenstatus: string }) => {
        this.screenstatus = '3';
        alert('EMR로 전송했습니다.');
        // 환자정보 가져오기
        this.patientsListService.getPatientInfo(this.form2TestedId)
          .subscribe(patient => {
            // console.log('[307][Sequencing EMR][검체정보]', this.sendEMR, patient);
            // this.setReportdaymgn(patient);
          });
      });

  }

  screenRead(): void {
    const result = confirm('스크린 판독 전송하시겠습니까?');
    if (result) {
      this.screenstatus = '1';
      this.patientInfo.screenstatus = this.screenstatus;
      this.tempSave();
    }

  }

  screenReadFinish(): void {
    const result = confirm('판독완료 전송하시겠습니까?');
    if (result) {
      this.screenstatus = '2';
      this.patientInfo.screenstatus = this.screenstatus;
      this.tempSave();
    }
  }

  // tslint:disable-next-line:typedef
  result(event) {
    console.log(event);
    this.resultStatus = event.srcElement.defaultValue;
    // console.log('[556][라디오 검체]', this.resultStatus);
  }


  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }

  saveComment(comment: string): void {
    this.comment = comment;
  }

  saveComment1(comment: string): void {
    this.comment1 = comment;
  }

  saveComment2(comment: string): void {
    this.comment2 = comment;
  }

  saveSeqComment(comment: string): void {
    this.seqcomment = comment;
  }

  //////////////////////////////////////////////////////////
  goBack(): void {
    this.router.navigate(['/diag', 'sequencing']);
  }

  resultName(result: string): void {
    this.resultname = result;
  }


  //////////////////////////////////////////
  // sequencingForm
  ////////////////////////////////////////////
  createRow(sequencing: ISequence): FormGroup {
    return this.fb.group({
      type: sequencing.type,
      exonintron: sequencing.exonintron,
      nucleotideChange: sequencing.nucleotideChange,
      aminoAcidChange: sequencing.aminoAcidChange,
      zygosity: sequencing.zygosity,
      rsid: sequencing.rsid,
      genbankaccesion: sequencing.genbankaccesion
    });
  }

  newRow(): FormGroup {
    return this.fb.group({
      type: '',
      exonintron: '',
      nucleotideChange: '',
      aminoAcidChange: '',
      zygosity: '',
      rsid: '',
      genbankaccesion: ''
    });
  }

  sequencingRows(): FormArray {
    return this.form.get('tableRows') as FormArray;
  }

  addNewRow(): void {
    this.sequencingRows().push(this.newRow());
  }

  removeRow(i: number): void {
    this.sequencingRows().removeAt(i);
  }
  get getFormControls(): any {
    const control = this.form.get('tableRows') as FormArray;
    return control;
  }
  //////////////////////////////////////////////////////////////
  reset(): void {
    const control = this.form.get('tableRows') as FormArray;
    const temp = control.getRawValue();
    // this.checkboxStatus = [];
    // for (let i = 0; i < temp.length; i++) {
    //   if (String(temp[i].checked) === 'true') {
    //     this.checkboxStatus.push(i);
    //   }
    // }

    const tempUserid: any = localStorage.getItem('diaguser');
    const tempuser: any = JSON.parse(tempUserid);
    const userid = tempuser.userid;

    this.patientsListService.resetscreenstatus(this.form2TestedId, '2', userid, this.reportType)
      .subscribe(data => {
        this.screenstatus = '2';
        this.patientInfo.screenstatus = '2';

      });
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










}
