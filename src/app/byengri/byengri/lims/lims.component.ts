import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { fromEvent, Observable, of, noop } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { catchError, debounceTime, distinct, distinctUntilChanged, filter, map, shareReplay, startWith, take, tap } from 'rxjs/operators';
import { ExperimentList, ExperList, IDNATYPE, ILIMS, IRNATYPE, IUSER, NOLIST } from '../../models/lims.model';
import { LimsService } from '../../services/lims.service';
import { SearchService } from '../../services/search.service';
import * as moment from 'moment';
import { ManageUsersService } from 'src/app/home/services/manageUsers.service';
import { SubSink } from 'subsink';

import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-lims',
  templateUrl: './lims.component.html',
  styleUrls: ['./lims.component.scss']
})
export class LimsComponent implements OnInit, AfterViewInit, OnDestroy {
  LISTS: { no: string, type: string }[] = [];
  listsTemp = [...this.LISTS];
  BLOCKCNT = ['1개', '2개', '3개이상'];
  BXOP = ['BX', 'OP'];
  dnaLists: ILIMS[] = [];
  rnaLists: ILIMS[] = [];

  examinList: { name: string, id: string }[] = [];
  doctorList: { name: string, id: string }[] = [];

  dnaObservable$: Observable<ILIMS[]>;
  exminObservable$: Observable<IUSER[]>;

  examiner = '';
  rechecker = '';

  dnaForm: FormGroup = this.fb.group({
    dnaFormgroup: this.fb.array([]),
  });

  rnaForm: FormGroup = this.fb.group({
    rnaFormgroup: this.fb.array([]),
  });

  lastScrollTop = 0;
  lastScrollLeft = 0;
  topScroll = false;
  leftScroll = true;
  processing = false;
  private subs = new SubSink();
  experLists: ExperList[] = [];
  noLists: NOLIST[] = [];
  // dnaStatus = true;
  // rnaStatus = true;
  @ViewChild('dnaBox', { static: true }) dnaBox: ElementRef;
  @ViewChild('rnaBox', { static: true }) rnaBox: ElementRef;

  @ViewChild('table', { static: true }) table: ElementRef;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @ViewChild('cancertype', { static: true }) cancertype: ElementRef;
  @ViewChild('reckerid', { static: true }) reckerid: ElementRef;
  @ViewChild('cancertype', { static: true }) examinerid: ElementRef;
  @ViewChild('testdate', { static: true }) testdate: ElementRef;
  constructor(
    private limsService: LimsService,
    private searchService: SearchService,
    private manageUsersService: ManageUsersService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.search(this.startToday(), this.endToday());
    this.exminObservable$ = this.manageUsersService.getManageUsersList(this.startToday2(), this.endToday(), '', '', 'P')
      .pipe(
        // tap(data => console.log(data)),
        shareReplay()
      );

    this.subs.sink = this.exminObservable$
      .pipe(
        map(lists => lists.filter(list => list.part_nm === 'Doctor')),
      )
      .subscribe(data => {
        data.forEach(list => {
          this.doctorList.push({ name: list.user_nm, id: list.user_id });
        });
      });

    this.subs.sink = this.exminObservable$
      .pipe(
        map(lists => lists.filter(list => list.part_nm === 'Tester')),
      )
      .subscribe(data => {
        data.forEach(list => {
          this.examinList.push({ name: list.user_nm, id: list.user_id });
        });
      });

    this.subs.sink = this.limsService.experimentList().subscribe(data => {
      data.forEach(list => {
        this.experLists.push({
          examNm: list.exam_nm,
          examin: list.examin,
          recheck: list.recheck,
          recheckNm: list.recheck_nm,
          reportDate: list.report_date
        });
      });
    });

    this.subs.sink = this.limsService.noLists().subscribe(lists => {
      lists.forEach(list => {
        this.LISTS.push({ no: list.orderby, type: list.gene });
      });
      console.log('[118]', this.LISTS);
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  keyUp(evt: any, type: string, idx: number, testcode: string): void {

    of(evt).pipe(
      map(event => event.target.value),
    ).subscribe(data => {
      const result = this.LISTS.filter(list => list.no.toString() === data.toString());
      if (!result.length) {
        alert('없는 번호입니다.');
        return;
      }
      const typename = result[0].type;

      const dnaControl = this.dnaForm.get('dnaFormgroup') as FormArray;
      const rnaControl = this.rnaForm.get('rnaFormgroup') as FormArray;
      dnaControl.at(idx).patchValue({ test_code: typename });
      rnaControl.at(idx).patchValue({ test_code: typename });
      if (type === 'DNA') {
        rnaControl.at(idx).patchValue({ enter_code: data });
      } else if (type === 'RNA') {
        dnaControl.at(idx).patchValue({ enter_code: data });
      }
      // console.log('[147]', testcode, typename);
      this.tumoretypeUpdate(testcode, typename);
    });
  }

  ngAfterViewInit(): void {
    const dnacontrol = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dnaFormData = dnacontrol.getRawValue();
    const rnacontrol = this.rnaForm.get('rnaFormgroup') as FormArray;
    const rnaFormData = rnacontrol.getRawValue();
    if (dnaFormData.length || rnaFormData.length) {
      fromEvent<any>(this.cancertype.nativeElement, 'keyup')
        .pipe(
          map(event => event.target.value),
          debounceTime(400),
          distinctUntilChanged(),
          catchError(err => of(''))
        ).subscribe(data => {
          console.log(data);
        });
    }
  }

  search(searchdate: string, end: string): void {
    // 2021-05-20
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    controlDNA.clear();
    controlRNA.clear();
    this.dnaLists = [];
    this.rnaLists = [];
    // DNA, RNA 구분 dna_rna_gbn 을 구분

    this.processing = true;
    this.dnaObservable$ = this.limsService.search(searchdate, end);
    this.dnaObservable$
      .pipe(
        tap(data => console.log('[조회]', data)),
        filter(data => !!data),
        tap(data => {
          if (data.length) {
            if (data[0].examin.length) {
              this.examiner = data[0].examin;
            }

            if (data[0].recheck.length) {
              this.rechecker = data[0].recheck;
            }
          }

        }),

      )
      .subscribe(data => {
        this.processing = false;
        this.makeDNARNAList(data);

      });

  }

  makeDNARNAList(data: ILIMS[], type: string = ''): void {
    if (type === 'TEST') {
      data.forEach(i => {  // 시험용

        if (parseInt(i.dna_rna_gbn, 10) === 0) {
          let totCt: string;
          let quanTotVol: string;
          if (i.dan_rna.length && i.dw) {
            totCt = (parseFloat(i.dan_rna) + parseFloat(i.dw)).toFixed(1);
          }
          if (i.quan_dna && i.te) {
            quanTotVol = (parseFloat(i.quan_dna) + parseFloat(i.te)).toFixed(1);
          }
          const val = {
            checkbox: true,
            id: i.id,
            pathology_num: i.pathology_num,
            rel_pathology_num: i.rel_pathology_num,
            prescription_date: i.prescription_date,
            report_date: i.report_date,
            patientID: i.patientID,
            name: i.name,
            gender: '(' + i.gender + '/' + i.age + ')',
            path_type: i.path_type,
            block_cnt: i.block_cnt,
            key_block: i.key_block,
            prescription_code: i.prescription_code,
            test_code: i.test_code,
            tumorburden: i.tumorburden,
            nano_ng: i.nano_ng,
            nano_280: i.nano_280,
            nano_230: i.nano_230,
            nano_dil: i.nano_dil,
            ng_ui: i.ng_ui,
            dan_rna: i.dan_rna,
            dw: i.dw,
            tot_ct: totCt,
            ct: i.ct,
            quantity: i.quantity,
            quantity_2: i.quantity_2,
            quan_dna: i.quan_dna,
            te: i.te,
            quan_tot_vol: quanTotVol,
            lib_hifi: i.lib_hifi,
            pm: i.pm,
            x100: i.x100,
            lib: i.lib,
            lib_dw: i.lib_dw,
            lib2: i.lib2,
            lib2_dw: i.lib2_dw,
            pathology_num2: i.pathology_num,
          };
          this.dnaLists.push(val);


        } else if (parseInt(i.dna_rna_gbn, 10) === 1) {
          let rnatotCt: string;
          let rnaquanTotVol: string;
          if (i.dan_rna.length && i.dw) {
            rnatotCt = (parseFloat(i.dan_rna) + parseFloat(i.dw)).toFixed(1);
          }
          if (i.quan_dna && i.te) {
            rnaquanTotVol = (parseFloat(i.quan_dna) + parseFloat(i.te)).toFixed(1);
          }
          const val = {
            checkbox: true,
            id: i.id,
            pathology_num: i.pathology_num,
            rel_pathology_num: i.rel_pathology_num,
            prescription_date: i.prescription_date,
            report_date: i.report_date,
            patientID: i.patientID,
            name: i.name,
            gender: '(' + i.gender + '/' + i.age + ')',
            path_type: i.path_type,
            block_cnt: i.block_cnt,
            key_block: i.key_block,
            prescription_code: i.prescription_code,
            test_code: i.test_code,
            tumorburden: i.tumorburden,
            nano_ng: i.nano_ng,
            nano_280: i.nano_280,
            nano_230: i.nano_230,
            nano_dil: i.nano_dil,
            ng_ui: i.ng_ui,
            dan_rna: i.dan_rna,
            dw: i.dw,
            tot_ct: rnatotCt,
            ct: i.ct,
            quantity: i.quantity,
            quantity_2: i.quantity_2,
            quan_dna: i.quan_dna,
            te: i.te,
            quan_tot_vol: rnaquanTotVol,
            lib_hifi: i.lib_hifi,
            pm: i.pm,
            x100: i.x100,
            lib: i.lib,
            lib_dw: i.lib_dw,
            lib2: i.lib2,
            lib2_dw: i.lib2_dw,
            pathology_num2: i.pathology_num
          };
          this.rnaLists.push(val);
        }
      });
    } else { // 정상
      data.forEach(i => {
        if (parseInt(i.dna_rna_gbn, 10) === 0) {
          let totCt: string;
          let quanTotVol: string;
          if (i.dan_rna.length && i.dw) {
            totCt = (parseFloat(i.dan_rna) + parseFloat(i.dw)).toFixed(1);
          }
          if (i.quan_dna && i.te) {
            quanTotVol = (parseFloat(i.quan_dna) + parseFloat(i.te)).toFixed(1);
          }

          const val = {
            checkbox: false,
            id: i.id,
            pathology_num: i.pathology_num,
            rel_pathology_num: i.rel_pathology_num,
            prescription_date: i.prescription_date,
            report_date: i.report_date,
            patientID: i.patientID,
            name: i.name,
            gender: '(' + i.gender + '/' + i.age + ')',
            path_type: i.path_type,
            block_cnt: i.block_cnt,
            key_block: i.key_block,
            prescription_code: i.prescription_code,
            test_code: i.test_code,
            tumorburden: i.tumorburden,
            nano_ng: i.nano_ng,
            nano_280: i.nano_280,
            nano_230: i.nano_230,
            nano_dil: i.nano_dil,
            ng_ui: i.ng_ui,
            dan_rna: i.dan_rna,
            dw: i.dw,
            tot_ct: totCt,
            ct: i.ct,
            quantity: i.quantity,
            quantity_2: i.quantity_2,
            quan_dna: i.quan_dna,
            te: i.te,
            quan_tot_vol: quanTotVol,
            lib_hifi: i.lib_hifi,
            pm: i.pm,
            x100: i.x100,
            lib: i.lib,
            lib_dw: i.lib_dw,
            lib2: i.lib2,
            lib2_dw: i.lib2_dw,
            pathology_num2: i.pathology_num,
          };
          this.dnaLists.push(val);

        } else if (parseInt(i.dna_rna_gbn, 10) === 1) {
          let rnatotCt: string;
          let rnaquanTotVol: string;
          if (i.dan_rna.length && i.dw) {
            rnatotCt = (parseFloat(i.dan_rna) + parseFloat(i.dw)).toFixed(1);
          }
          if (i.quan_dna && i.te) {
            rnaquanTotVol = (parseFloat(i.quan_dna) + parseFloat(i.te)).toFixed(1);
          }
          const val = {
            checkbox: false,
            id: i.id,
            pathology_num: i.pathology_num,
            rel_pathology_num: i.rel_pathology_num,
            prescription_date: i.prescription_date,
            report_date: i.report_date,
            patientID: i.patientID,
            name: i.name,
            gender: '(' + i.gender + '/' + i.age + ')',
            path_type: i.path_type,
            block_cnt: i.block_cnt,
            key_block: i.key_block,
            prescription_code: i.prescription_code,
            test_code: i.test_code,
            tumorburden: i.tumorburden,
            nano_ng: i.nano_ng,
            nano_280: i.nano_280,
            nano_230: i.nano_230,
            nano_dil: i.nano_dil,
            ng_ui: i.ng_ui,
            dan_rna: i.dan_rna,
            dw: i.dw,
            tot_ct: rnatotCt,
            ct: i.ct,
            quantity: i.quantity,
            quantity_2: i.quantity_2,
            quan_dna: i.quan_dna,
            te: i.te,
            quan_tot_vol: rnaquanTotVol,
            lib_hifi: i.lib_hifi,
            pm: i.pm,
            x100: i.x100,
            lib: i.lib,
            lib_dw: i.lib_dw,
            lib2: i.lib2,
            lib2_dw: i.lib2_dw,
            pathology_num2: i.pathology_num
          };
          this.rnaLists.push(val);
        }
      });
    }
    console.log('[446][DNA]', this.dnaLists);
    console.log('[447][순서변경전][RNA]', this.rnaLists);
    console.log('[448]', this.dnaLists.length, this.rnaLists.length);
    // 순서맞춤
    const tempDNA = [];
    const tempRNA = [];
    if (this.dnaLists.length >= this.rnaLists.length) {

      this.dnaLists.forEach((list, index) => {
        const dnaTestcode = list.pathology_num;
        const tempId = list.id;
        const idx = this.rnaLists.findIndex(rnaList => rnaList.pathology_num === dnaTestcode);
        if (idx !== -1) {
          const rnaTestcode = this.rnaLists[idx].pathology_num;
          if (dnaTestcode === rnaTestcode) {
            tempDNA.push(list);
            this.rnaLists[idx].id = tempId;
            tempRNA.push(this.rnaLists[idx]);
          }
        }
      });
      this.dnaLists = [];
      this.rnaLists = [];
      this.dnaLists = tempDNA;
      this.rnaLists = tempRNA;

    } else if (this.dnaLists.length < this.rnaLists.length) {
      this.rnaLists.forEach((list, index) => {
        const rnaTestcode = list.pathology_num;
        const tempId = list.id;
        const idx = this.dnaLists.findIndex(dnaList => dnaList.pathology_num === rnaTestcode);
        if (idx !== -1) {
          const dnaTestcode = this.dnaLists[idx].pathology_num;
          if (rnaTestcode === dnaTestcode) {
            tempRNA.push(list);
            this.dnaLists[idx].id = tempId;
            tempDNA.push(this.dnaLists[idx]);
          }
        }
      });
      this.dnaLists = [];
      this.rnaLists = [];
      console.log(this.dnaLists, this.rnaLists);
      this.rnaLists = tempRNA;
      this.dnaLists = tempDNA;

    }

    console.log('[517][순서변경후][DNA, RNA]', this.dnaLists, this.rnaLists);
    this.dnaLists.forEach((list, index) => {
      list.id = index.toString();
      this.dnaFormLists().push(this.createDNA(list));
    });

    this.rnaLists.forEach((list, index) => {
      list.id = index.toString();
      this.rnaFormLists().push(this.createRNA(list));
    });
  }

  testSearch(info: string): void {

    // if (this.examiner.length === 0 || this.rechecker.length === 0) {
    //   alert('검사자항목이 없습니다.');
    //   return;
    // }
    const testInfo = info.split('/');
    const testdate = testInfo[0];
    const examiner = testInfo[1];
    this.examiner = examiner;
    const rechecker = testInfo[2];
    this.rechecker = rechecker;

    const year = testdate.substring(0, 4);
    const mm = testdate.substring(4, 6);
    const dd = testdate.substring(6);
    const newDate = year + '-' + mm + '-' + dd;
    console.log('[492]', testInfo, testdate, examiner, rechecker, newDate);
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    controlDNA.clear();
    controlRNA.clear();
    this.dnaLists = [];
    this.rnaLists = [];
    // DNA, RNA 구분 dna_rna_gbn 을 구분

    this.processing = true;
    this.dnaObservable$ = this.limsService.testSearch(testdate, examiner, rechecker);
    this.dnaObservable$.subscribe(data => {
      this.processing = false;
      if (data) {
        this.makeDNARNAList(data, 'TEST');
        this.testdate.nativeElement.value = newDate;
      }

    });


  }

  createDNA(i: ILIMS): FormGroup {
    return this.fb.group({
      checkbox: i.checkbox,
      id: i.id,
      pathology_num: i.pathology_num,
      rel_pathology_num: i.rel_pathology_num,
      prescription_date: i.prescription_date,
      patientID: i.patientID,
      name: i.name,
      gender: i.gender,
      path_type: i.path_type,
      block_cnt: i.block_cnt,
      key_block: i.key_block,
      prescription_code: i.prescription_code,
      enter_code: '',
      test_code: i.test_code,
      tumorburden: i.tumorburden,
      nano_ng: i.nano_ng,
      nano_280: i.nano_280,
      nano_230: i.nano_230,
      nano_dil: i.nano_dil,
      ng_ui: i.ng_ui,
      dan_rna: i.dan_rna,
      dw: i.dw,
      tot_ct: i.tot_ct,
      ct: i.ct,
      quantity: i.quantity,
      quantity_2: i.quantity_2,
      quan_dna: i.quan_dna,
      te: i.te,
      quan_tot_vol: i.quan_tot_vol,
      lib_hifi: i.lib_hifi,
      pm: i.pm,
      x100: i.x100,
      lib: 1,
      lib_dw: i.lib_dw,
      lib2: 3,
      lib2_dw: i.lib2_dw,
      dna_rna_gbn: '0',
      report_date: i.report_date,
      pathology_num2: i.pathology_num,

    });
  }

  removeDNA(i: number): void {
    const result = confirm('삭제 하시겠습니까?');
    console.log(result);
    if (!result) {
      return;
    }
    const testCode = this.dnaFormLists().at(i).get('pathology_num').value;
    this.dnaFormLists().removeAt(i);
    this.reArrange(testCode, this.rnaFormLists());
  }

  reArrange(testCode: string, control: FormArray): void {
    const rnaLists = control.getRawValue();
    const idx = rnaLists.findIndex(item => item.pathology_num === testCode);
    if (idx !== -1) {
      control.removeAt(idx);
    }
  }

  dnaFormLists(): FormArray {
    return this.dnaForm.get('dnaFormgroup') as FormArray;
  }

  createRNA(i: ILIMS): FormGroup {
    return this.fb.group({
      id: i.id,
      checkbox: i.checkbox,
      pathology_num: i.pathology_num,
      rel_pathology_num: i.rel_pathology_num,
      prescription_date: i.prescription_date,
      patientID: i.patientID,
      name: i.name,
      gender: i.gender,
      path_type: i.path_type,
      block_cnt: i.block_cnt,
      key_block: i.key_block,
      prescription_code: i.prescription_code,
      enter_code: '',
      test_code: i.test_code,
      tumorburden: i.tumorburden,
      nano_ng: i.nano_ng,
      nano_280: i.nano_280,
      nano_230: i.nano_230,
      nano_dil: i.nano_dil,
      ng_ui: i.ng_ui,
      dan_rna: i.dan_rna,
      dw: i.dw,
      tot_ct: i.tot_ct,
      ct: i.ct,
      quantity: i.quantity,
      quantity_2: i.quantity_2,
      quan_dna: i.quan_dna,
      te: i.te,
      quan_tot_vol: i.quan_tot_vol,
      lib_hifi: i.lib_hifi,
      pm: i.pm,
      x100: i.x100,
      lib: 1,
      lib_dw: i.lib_dw,
      lib2: 3,
      lib2_dw: i.lib2_dw,
      dna_rna_gbn: '1',
      report_date: i.report_date,
      pathology_num2: i.pathology_num,
    });
  }

  removeRNA(i: number): void {
    const testCode = this.rnaFormLists().at(i).get('pathology_num').value;
    this.rnaFormLists().removeAt(i);
    this.reArrange(testCode, this.dnaFormLists());
  }


  rnaFormLists(): FormArray {
    return this.rnaForm.get('rnaFormgroup') as FormArray;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    let type = '';

    if (event.target.files.length > 0) {
      const tempstr = event.target.files[0].name.split('.')[0];
      type = tempstr.substring(tempstr.length - 3);

      if (type.toLowerCase() === 'dna') {
        this.dnaData(file, 'DNA');
      } else if (type.toLowerCase() === 'rna') {
        this.dnaData(file, 'RNA');
      } else {
        this.dnaData(file, 'DNARNA');
      }
    }
    this.fileInput.nativeElement.value = '';
  }

  dnaData(file: File, type: string): void {
    const dnaFileLists: IDNATYPE[] = [];
    const rnaFileLists: IRNATYPE[] = [];
    let id = '';
    let ngui = 0;
    let dna260280 = 0;
    let dna260230 = 0;
    const reader = new FileReader();
    let zeroval = '';
    let dnaSubtype = '';
    let rnaSubtype = '';
    let subtype = '';
    reader.onload = (e) => {
      const fileData = reader.result;

      const wb = XLSX.read(fileData, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const range = XLSX.utils.decode_range(sheet['!ref']); // 범위값 얻음

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellref = XLSX.utils.encode_cell({ c: C, r: R }); //   A1 참조
          if (!sheet[cellref]) { continue; } // 없으면게속
          const cell = sheet[cellref];

          if (C === 1 && R > 0) {  // 검체번호

            if (type === 'DNA') {
              const temp = cell.v.split('D')[0];
              const nameTemp = temp.split('-');
              const zeroLen = 6 - nameTemp[1].toString().length;
              for (let i = 0; i <= zeroLen; i++) {
                zeroval = zeroval + '0';
              }
              id = nameTemp[0] + '-' + zeroval + nameTemp[1];
              zeroval = '';
            } else if (type === 'RNA') {
              const temp = cell.v.split('R')[0];
              const nameTemp = temp.split('-');
              const zeroLen = 6 - nameTemp[1].toString().length;
              for (let i = 0; i <= zeroLen; i++) {
                zeroval = zeroval + '0';
              }
              id = nameTemp[0] + '-' + zeroval + nameTemp[1];
              zeroval = '';
            } else if (type === 'DNARNA') {
              try {

                if (cell.v.split(/(\s+)/).filter(item => item.trim().length > 0)[1] === 'D') {
                  id = this.addZero(cell.v, 'D');
                  dnaSubtype = 'D';
                  subtype = 'D';
                } else if (cell.v.split(/(\s+)/).filter(item => item.trim().length > 0)[1] === 'R') {
                  id = this.addZero(cell.v, 'R');
                  rnaSubtype = 'R';
                  subtype = 'R';
                }
              } catch (err) {
                console.log(err);
              }

            }

          } else if (C === 4 && R > 0) {
            ngui = cell.v;
          } else if (C === 8 && R > 0) { // 260/280
            dna260280 = cell.v;
          } else if (C === 9 && R > 0) { // 260/230
            dna260230 = cell.v;
          }
        }
        if (R > 0 && type === 'DNA') {
          const idx = dnaFileLists.findIndex(list => list.pathology_num.trim() === id);
          // console.log(idx);
          if (idx === -1) {
            dnaFileLists.push({
              pathology_num: id.toString().trim(),
              nano_280: dna260280.toString(),
              nano_230: dna260230.toString(),
              ng_ui: ngui.toString()
            });
          } else {
            //  2개 이상인 경우, DNA는 260/280의 값이 1.9에 가까운값
            const { pathology_num, nano_280, nano_230, ng_ui } = dnaFileLists[idx];
            const newNano280Diff = 1.9 - parseFloat(dna260280.toString());
            const oldNano280Diff = 1.9 - parseFloat(nano_280.toString());
            if (oldNano280Diff > newNano280Diff) { // 기존 값보다 작은 경우 교체
              dnaFileLists[idx].nano_280 = dna260280.toString();
              dnaFileLists[idx].nano_230 = dna260230.toString();
              dnaFileLists[idx].ng_ui = ngui.toString();
            }

          }

        } else if (R > 0 && type === 'RNA') {
          const idx = rnaFileLists.findIndex(list => list.pathology_num.trim() === id);
          if (idx === -1) {
            rnaFileLists.push({
              pathology_num: id.toString().trim(),
              nano_280: dna260280.toString(),
              nano_230: dna260230.toString(),
              ng_ui: ngui.toString()
            });
          } else {
            // RNA는 260/280의 값이 2.0에 가까운값 으로 업데이트 한다.
            const { pathology_num, nano_280, nano_230, ng_ui } = rnaFileLists[idx];
            const newNano280Diff = parseFloat(dna260280.toString()) - 2;
            const oldNano280Diff = parseFloat(nano_280.toString()) - 2;
            if (oldNano280Diff > newNano280Diff) { // 기존 값보다 작은 경우 교체
              rnaFileLists[idx].nano_280 = dna260280.toString();
              rnaFileLists[idx].nano_230 = dna260230.toString();
              rnaFileLists[idx].ng_ui = ngui.toString();
            }
          }
        } else if (R > 0 && type === 'DNARNA') {

          if (subtype === 'D') {

            const idx = dnaFileLists.findIndex(list => list.pathology_num.trim() === id);
            // console.log('[DNA 766]', idx, id);
            if (idx === -1) {
              dnaFileLists.push({
                pathology_num: id.toString().trim(),
                nano_280: dna260280.toString(),
                nano_230: dna260230.toString(),
                ng_ui: ngui.toString()
              });
            } else {
              //  2개 이상인 경우, DNA는 260/280의 값이 1.9에 가까운값
              const { pathology_num, nano_280, nano_230, ng_ui } = dnaFileLists[idx];
              const newNano280Diff = 1.9 - parseFloat(dna260280.toString());
              const oldNano280Diff = 1.9 - parseFloat(nano_280.toString());
              if (oldNano280Diff > newNano280Diff) { // 기존 값보다 작은 경우 교체
                dnaFileLists[idx].nano_280 = dna260280.toString();
                dnaFileLists[idx].nano_230 = dna260230.toString();
                dnaFileLists[idx].ng_ui = ngui.toString();
              }

            }
          } else if (subtype === 'R') {

            const idx = rnaFileLists.findIndex(list => list.pathology_num.trim() === id);
            if (idx === -1) {
              rnaFileLists.push({
                pathology_num: id.toString().trim(),
                nano_280: dna260280.toString(),
                nano_230: dna260230.toString(),
                ng_ui: ngui.toString()
              });
            } else {
              // RNA는 260/280의 값이 2.0에 가까운값 으로 업데이트 한다.
              const { pathology_num, nano_280, nano_230, ng_ui } = rnaFileLists[idx];
              const newNano280Diff = parseFloat(dna260280.toString()) - 2;
              const oldNano280Diff = parseFloat(nano_280.toString()) - 2;
              if (oldNano280Diff > newNano280Diff) { // 기존 값보다 작은 경우 교체
                rnaFileLists[idx].nano_280 = dna260280.toString();
                rnaFileLists[idx].nano_230 = dna260230.toString();
                rnaFileLists[idx].ng_ui = ngui.toString();
              }
            }

          }
        }


        id = '';
        ngui = 0;
        dna260280 = 0;
        dna260230 = 0;

      }
      console.log('[828][DNA]', dnaFileLists);
      console.log('[829][RNA]', rnaFileLists);

      if (type === 'DNA') {
        this.updateDNAScreen(dnaFileLists);
      } else if (type === 'RNA') {
        this.updateRNAScreen(rnaFileLists);
      } else if (type === 'DNARNA') {
        if (dnaSubtype === 'D') {
          this.updateDNAScreen(dnaFileLists);
        }
        if (rnaSubtype === 'R') {
          this.updateRNAScreen(rnaFileLists);
        }
      }

    };
    reader.readAsArrayBuffer(file);
  }

  updateDNAScreen(lists: IDNATYPE[]): void {
    //  2개 이상인 경우, DNA는 260/280의 값이 1.9에 가까운값 ,
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const formData: ILIMS[] = control.getRawValue();
    if (formData.length === 0) {
      alert('데이터가 없습니다.');
      return;
    }

    formData.forEach((data, index) => {
      const idx = lists.findIndex(list => list.pathology_num.trim() === data.pathology_num.trim());

      if (idx !== -1) {
        const { pathology_num, nano_280, nano_230, ng_ui } = lists[idx];
        control.at(index).patchValue({
          nano_ng: ng_ui, nano_280, nano_230
        });
      }
    });
    this.snackBar.open('DNA/RNA 완료 하였습니다.', '닫기', { duration: 2000 });
  }

  addZero(testId: string, celltype: string): string {
    let zeroval = '';
    let temp = '';
    if (celltype === 'D') {
      temp = testId.split('D')[0];
    } else if (celltype === 'R') {
      temp = testId.split('R')[0];
    }
    // console.log('[868]', testId, temp);
    const nameTemp = temp.split('-');
    const zeroLen = 6 - nameTemp[1].toString().length;
    for (let i = 0; i <= zeroLen; i++) {
      zeroval = zeroval + '0';
    }
    const testedCode = nameTemp[0] + '-' + zeroval + nameTemp[1];
    // console.log('[875]', testedCode);
    return testedCode.trim();
  }

  updateRNAScreen(lists: IDNATYPE[]): void {

    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const formData: ILIMS[] = control.getRawValue();
    if (formData.length === 0) {
      alert('데이터가 없습니다.');
      return;
    }

    formData.forEach((data, index) => {
      const idx = lists.findIndex(list => list.pathology_num.trim() === data.pathology_num.trim());
      if (idx !== -1) {
        const { pathology_num, nano_280, nano_230, ng_ui } = lists[idx];
        // const danRna = (20 / parseFloat(ng_ui)) * 5;
        // const dwVal = 20 - danRna;
        control.at(index).patchValue({ nano_ng: ng_ui, nano_280, nano_230 });
      }
    });
    this.snackBar.open('DNA/RNA 완료 하였습니다.', '닫기', { duration: 2000 });
  }


  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    return now;
  }

  startToday(): string {
    const oneMonthsAgo = moment().subtract(4, 'days');
    // console.log(oneMonthsAgo.format('YYYY-MM-DD'));
    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');
    // console.log('[63][오늘날자]년[' + yy + ']월[' + mm + ']일[' + dd + ']');
    const now1 = yy + '-' + mm + '-' + dd;
    return now1;
  }

  startToday2(): string {
    const oneMonthsAgo = moment().subtract(3, 'months');
    // console.log(oneMonthsAgo.format('YYYY-MM-DD'));
    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');
    // console.log('[63][오늘날자]년[' + yy + ']월[' + mm + ']일[' + dd + ']');
    const now1 = yy + '-' + mm + '-' + dd;
    return now1;
  }

  dnaNgUl(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const ngul = (20 / parseFloat(val)) * 5;
    const dw = 20 - ngul;
    control.at(i).patchValue({
      dan_rna: ngul.toFixed(1), dw: dw.toFixed(1)
    });
  }

  rnaNgUl(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const ngul = (20 / parseFloat(val)) * 5;
    const dw = 20 - ngul;
    control.at(i).patchValue({
      dan_rna: ngul.toFixed(1), dw: dw.toFixed(1)
    });
  }

  dnaDanRna(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dw = 20 - parseFloat(val);
    control.at(i).patchValue({
      dw: dw.toFixed(1)
    });
  }

  rnaDanRna(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dw = 20 - parseFloat(val);
    control.at(i).patchValue({
      dw: dw.toFixed(1)
    });
  }

  dnaQuatity(i: number, val: string): void {
    console.log('[886]', i, val);
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const quantity2 = parseFloat(val) / 2;
    const quanDna = 20 / quantity2;
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quantity_2: quantity2.toFixed(1), quan_dna: quanDna.toFixed(1), te: te.toFixed(1)
    });
  }

  rnaQuatity(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const quantity2 = parseFloat(val) / 2;
    const quanDna = 20 / quantity2;
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quantity_2: quantity2.toFixed(1), quan_dna: quanDna.toFixed(2), te: te.toFixed(1)
    });
  }

  dnaQuatity2(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const quanDna = 20 / parseFloat(val);
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quan_dna: quanDna.toFixed(1), te: te.toFixed(1)
    });
  }

  rnaQuatity2(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const quanDna = 20 / parseFloat(val);
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quan_dna: quanDna.toFixed(1), te: te.toFixed(1)
    });
  }

  dnaQuanDna(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const te = 5.5 - parseFloat(val);
    control.at(i).patchValue({
      te: te.toFixed(1)
    });
  }

  rnaQuanDna(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const te = 5.5 - parseFloat(val);
    control.at(i).patchValue({
      te: te.toFixed(1)
    });
  }

  dnaPm(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const x100 = parseFloat(val) * 100;
    const libDw = (x100 / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      x100: x100.toFixed(1), lib_dw: libDw.toFixed(1), lib2_dw: lib2Dw.toFixed(1)
    });
  }

  rnaPm(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const x100 = parseFloat(val) * 100;
    const libDw = (x100 / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      x100: x100.toFixed(1), lib_dw: libDw.toFixed(1), lib2_dw: lib2Dw.toFixed(1)
    });
  }


  dnax100(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const libDw = (parseFloat(val) / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib_dw: libDw.toFixed(1), lib2_dw: lib2Dw.toFixed(1)
    });
  }

  rnax100(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const libDw = (parseFloat(val) / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib_dw: libDw.toFixed(1), lib2_dw: lib2Dw.toFixed(1)
    });
  }



  dnalibdw(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const libDw = parseFloat(val) * 100;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib2_dw: lib2Dw.toFixed(1)
    });
  }

  rnalibdw(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const libDw = parseFloat(val) * 100;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib2_dw: lib2Dw.toFixed(1)
    });
  }

  selectedExamin(id: string): void {
    this.examiner = id;
  }

  selectedRecheck(id: string): void {
    this.rechecker = id;
  }

  save(testdate: string): void {
    const rearrangeDNA = [];
    const rearrangeRNA = [];
    const testeddate = testdate.replace(/-/g, '');
    const dnacontrol = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dnaFormData = dnacontrol.getRawValue();
    dnaFormData.map(item => item.report_date = testeddate);
    const tempdnaFormData = dnaFormData.filter(item => item.checkbox === true);
    const dnaCount = tempdnaFormData.length;


    const rnacontrol = this.rnaForm.get('rnaFormgroup') as FormArray;
    const rnaFormData = rnacontrol.getRawValue();
    rnaFormData.map(item => item.report_date = testeddate);
    const temprnaFormData = rnaFormData.filter(item => item.checkbox === true);
    const rnaCount = temprnaFormData.length;


    const allData: ILIMS[] = [...tempdnaFormData, ...temprnaFormData];
    console.log(allData);

    if (this.examiner.length === 0 || this.rechecker.length === 0) {
      alert('검사자항목이 없습니다.');
      return;
    }

    if (allData.length === 0) {
      alert('선택된 DNA/RNA 데이터가 없습니다.');
      return;
    }

    const result = confirm('저장 하시겠습니까?');
    if (result) {
      console.log('[1074][저장]', allData, this.examiner, this.rechecker, testeddate);
      this.limsService.save(allData, this.examiner, this.rechecker)
        .subscribe((data) => {
          const msg = `DNA: ${dnaCount}건, RNA: ${rnaCount}건 저장 하였습니다.`;
          this.snackBar.open(msg, '닫기', { duration: 5000 });
        });
    }


  }

  tumoretypeUpdate(testcode: string, tumortype: string): void {
    console.log('[1137][tumoretypeUpdate]', testcode, tumortype);
    this.limsService.updateTumoretype(testcode, tumortype)
      .subscribe(data => {
        if (data.message === 'SUCCESS') {
          // this.snackBar.open('변경 하였습니다.', '닫기', { duration: 2000 });
        }
      });
  }




  printexcel(): void {
    const dnacontrol = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dnaFormData = dnacontrol.getRawValue();

    dnaFormData.unshift({
      id: 'No.',
      pathology_num: '병리번호',
      rel_pathology_num: '관련병리번호',
      prescription_date: '접수일자',
      report_date: '실험일자',
      patientID: '등록번호',
      name: '환자명',
      gender: '성별(F/M)',
      path_type: '구분(bx,op)',
      block_cnt: '블록수',
      key_block: 'key block',
      prescription_code: '검체',
      test_code: '암종',
      tumorburden: 'tumor %',
      nano_ng: 'ng/ul',
      nano_280: '260/280',
      nano_230: '260/280',
      nano_dil: 'dil비율',
      ng_ui: 'ng/ul',
      dan_rna: 'DNA',
      dw: 'dw',
      tot_ct: 'toal Vol',
      ct: 'Ct값',
      quantity: 'quantity',
      quantity_2: 'quantity/2(농도)',
      quan_dna: 'DNA',
      te: 'TE',
      quan_tot_vol: 'toal Vol',
      lib_hifi: 'Lib HIFI PCR Cycle',
      pm: 'pM',
      x100: 'x100',
      lib: 'library',
      lib_dw: 'DW (50pm)',
      lib2: 'library',
      lib2_dw: 'DW (50pm)',
      pathology_num2: '병리번호',
    });
    dnaFormData.unshift({
      DNA: 'DNA'
    });


    const rnacontrol = this.rnaForm.get('rnaFormgroup') as FormArray;
    const rnaFormData = rnacontrol.getRawValue();
    rnaFormData.unshift({
      id: 'No.',
      pathology_num: '병리번호',
      rel_pathology_num: '관련병리번호',
      prescription_date: '접수일자',
      report_date: '실험일자',
      patientID: '등록번호',
      name: '환자명',
      gender: '성별(F/M)',
      path_type: '구분(bx,op)',
      block_cnt: '블록수',
      key_block: 'key block',
      prescription_code: '검체',
      test_code: '암종',
      tumorburden: 'tumor %',
      nano_ng: 'ng/ul',
      nano_280: '260/280',
      nano_230: '260/280',
      nano_dil: 'dil비율',
      ng_ui: 'ng/ul',
      dan_rna: 'RNA',
      dw: 'dw',
      tot_ct: 'toal Vol',
      ct: 'Ct값',
      quantity: 'quantity',
      quantity_2: 'quantity/2(농도)',
      quan_dna: 'RNA',
      te: 'TE',
      quan_tot_vol: 'toal Vol',
      lib_hifi: 'Lib HIFI PCR Cycle',
      pm: 'pM',
      x100: 'x100',
      lib: 'library',
      lib_dw: 'DW (50pm)',
      lib2: 'library',
      lib2_dw: 'DW (50pm)',
      pathology_num2: '병리번호',
    });
    rnaFormData.unshift({
      DNA: 'RNA'
    });
    const tempDNA = [];
    const tempRNA = [];

    dnaFormData.forEach((list, index) => {
      const { dna_rna_gbn, checkbox, ...temp } = list;
      if (index >= 2) {
        const id = temp.id;
        const newid = parseInt(id, 10) + 1;
        temp.id = newid.toString();
      }
      tempDNA.push(temp);
    });

    rnaFormData.forEach((list, index) => {
      const { dna_rna_gbn, checkbox, ...temp } = list;
      if (index >= 2) {
        const id = temp.id;
        const newid = parseInt(id, 10) + 1;
        temp.id = newid.toString();
      }
      tempRNA.push(temp);
    });

    const allData: ILIMS[] = [...tempDNA, ...tempRNA];
    console.log('[1246]', allData);
    const width = [{ width: 4 }, { width: 4 }, { width: 16 }, { width: 13 }, { width: 12 }, { width: 11 }, { width: 11 }, // A, B,C,D,E,F,G
    { width: 7 }, { width: 11 }, { width: 10 }, { width: 8 }, { width: 9 }, //  H, I, J, K, L
    { width: 19 }, { width: 18 }, { width: 7 }, { width: 7 }, { width: 8 }, //  M, N, O ,P, Q
    { width: 8 }, { width: 7 }, { width: 6 }, { width: 6 }, { width: 8 }, // R ,S, T, U, V
    { width: 8 }, { width: 8 }, { width: 14 }, { width: 14 }, { width: 14 }, // W, X, Y, Z, AA
    { width: 8 }, { width: 8 }, { width: 9 }, { width: 16 }, { width: 9 }, // AB, AC, AD, AE, AF
    { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }   // AG, AH, AI, AJ, AK
    ];
    this.limsService.exportAsExcelFile(allData, 'LIMS', width);
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

  tableDNAScroll(evt: Event): void {
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

    this.rnaBox.nativeElement.scrollTop = this.lastScrollTop;
    this.rnaBox.nativeElement.scrollLeft = this.lastScrollLeft;
  }

  tableRNAScroll(evt: Event): void {
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

    this.dnaBox.nativeElement.scrollTop = this.lastScrollTop;
    this.dnaBox.nativeElement.scrollLeft = this.lastScrollLeft;
  }

  tableHeader(): {} {
    if (this.topScroll) {
      return { 'header-fix': true, 'td-fix': false };
    }
    return { 'header-fix': false, 'td-fix': true };
  }
  ////////////////////////////////
  dnaDroped(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const dnaControl = this.dnaForm.get('dnaFormgroup') as FormArray;
    this.moveItemInCommentArray(dnaControl, from1, to);

    const rnaControl = this.rnaForm.get('rnaFormgroup') as FormArray;
    this.moveItemInCommentArray(rnaControl, from1, to);
  }

  rnaDroped(event: CdkDragDrop<string[]>): void {
    const from1 = event.previousIndex;
    const to = event.currentIndex;

    const rnaControl = this.rnaForm.get('rnaFormgroup') as FormArray;
    this.moveItemInCommentArray(rnaControl, from1, to);

    const dnaControl = this.dnaForm.get('dnaFormgroup') as FormArray;
    this.moveItemInCommentArray(dnaControl, from1, to);
  }


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

    //// id 순서 바꿈
    for (let i = 0; i < len; i++) {
      formArray.at(i).patchValue({ id: i + 1 });
    }
    ////


  }

  /** Clamps a number between zero and a maximum. */
  clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
  }
  //////////////////////////////////////////////////////////////////////////
  checkboxSync(testcode: string, type: string): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();
    if (type === 'DNA') {
      const dnaidx = dnaLists.findIndex(item => item.pathology_num === testcode);
      const dnacheckbox = dnaLists[dnaidx].checkbox;
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlRNA.at(index).patchValue({ checkbox: dnacheckbox });
      }
    } else if (type === 'RNA') {
      const rnaidx = rnaLists.findIndex(item => item.pathology_num === testcode);
      const rnacheckbox = rnaLists[rnaidx].checkbox;
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);

      if (index !== -1) {
        controlDNA.at(index).patchValue({ checkbox: rnacheckbox });
      }
    }
  }


  pathologySync(testcode: string, pathology: string, type: string, i: number): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();
    if (type === 'DNA') {
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlRNA.at(index).patchValue({ rel_pathology_num: pathology });
      }
      const relPathologyNum = controlDNA.at(i).value;
      // console.log('[1488]', relPathologyNum.pathology_num, relPathologyNum.rel_pathology_num);
      this.limsService.relPathologyNum(relPathologyNum.pathology_num, relPathologyNum.rel_pathology_num).subscribe((data) => {
        console.log(data)
      });
    } else if (type === 'RNA') {
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlDNA.at(index).patchValue({ rel_pathology_num: pathology });
      }
      const relPathologyNum = controlRNA.at(i).value;
      this.limsService.relPathologyNum(relPathologyNum.pathology_num, relPathologyNum.rel_pathology_num).subscribe(data => {
        console.log(data);
      });
    }



  }



  pathTypeSync(testcode: string, pathtype: string, type: string): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();
    console.log('[1101][]', testcode, pathtype);
    if (type === 'DNA') {
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        console.log('[1101][]', testcode, index, pathtype);
        controlRNA.at(index).patchValue({ path_type: pathtype });
      }
    } else if (type === 'RNA') {
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlDNA.at(index).patchValue({ path_type: pathtype });
      }
    }
  }

  blockCntSync(testcode: string, blockcnt: string, type: string): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();

    if (type === 'DNA') {
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlRNA.at(index).patchValue({ block_cnt: blockcnt });
      }
    } else if (type === 'RNA') {
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlDNA.at(index).patchValue({ block_cnt: blockcnt });
      }
    }
  }

  keyBlockSync(testcode: string, keyblock: string, type: string): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();

    if (type === 'DNA') {
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlRNA.at(index).patchValue({ key_block: keyblock });
      }
    } else if (type === 'RNA') {
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlDNA.at(index).patchValue({ key_block: keyblock });
      }
    }

    this.limsService.updateKeyblock(testcode, keyblock)
      .subscribe(data => {
        console.log(data);
      });
  }

  /// organ 갱신
  prescriptionCodeSync(testcode: string, prescriptioncode: string, type: string): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();

    if (type === 'DNA') {
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlRNA.at(index).patchValue({ prescription_code: prescriptioncode });
      }
    } else if (type === 'RNA') {
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlDNA.at(index).patchValue({ prescription_code: prescriptioncode });
      }
    }

    this.limsService.updateOrgan(testcode, prescriptioncode)
      .subscribe(data => {
        console.log(data);
      });

  }

  // DNA ct
  keyDnactSync(testcode: string, i: number): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dnaCtData = controlDNA.at(i).get('ct').value;
    console.log(dnaCtData);
    this.limsService.updateDnact(testcode, dnaCtData)
      .subscribe(data => {
        console.log(data);
      });
  }

  // RNA ct
  keyRnactSync(testcode: string, i: number): void {
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const rnaCtData = controlRNA.at(i).get('ct').value;
    this.limsService.updateRnact(testcode, rnaCtData)
      .subscribe(data => {
        console.log(data);
      });
  }


  testCodeSync(testcode: string, testCode: string, type: string): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();

    if (type === 'DNA') {
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlRNA.at(index).patchValue({ test_code: testCode });
      }
    } else if (type === 'RNA') {
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlDNA.at(index).patchValue({ test_code: testCode });
      }
    }
    this.tumoretypeUpdate(testcode, testCode);
    // if (type === 'DNA') {
    //   this.dnaStatus = true;
    // } else if (type === 'RNA') {
    //   this.rnaStatus = true;
    // }
  }


  tumorcellperSync(testcode: string, percent: string, type: string): void {
    // console.log('[1388][tumorcellperUpdate]', testcode, percent);
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dnaLists = controlDNA.getRawValue();
    const rnaLists = controlRNA.getRawValue();
    let newpercent = '';
    const idx = percent.indexOf('%');
    if (idx !== -1) {
      newpercent = percent.replace(/\%/g, '');
    }
    newpercent = percent;

    if (type === 'DNA') {
      const index = rnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlRNA.at(index).patchValue({ tumorburden: newpercent });
      }
    } else if (type === 'RNA') {
      const index = dnaLists.findIndex(item => item.pathology_num === testcode);
      if (index !== -1) {
        controlDNA.at(index).patchValue({ tumorburden: newpercent });
      }
    }

    this.limsService.updateTumorcellper(testcode, newpercent)
      .subscribe(data => {
        if (data.message === 'SUCCESS') {
          // this.snackBar.open('변경 하였습니다.', '닫기', { duration: 2000 });
        }
      });
  }


  tumorColor(i: number, type: string): boolean {
    let tumorvalue = '';
    if (type === 'DNA') {
      const tempVal = this.dnaFormLists().at(i).value;
      const idx = tempVal.tumorburden.indexOf('%');

      if (idx !== -1) {
        tumorvalue = tempVal.tumorburden.replace(/\%/g, '');
      }
      tumorvalue = tempVal.tumorburden;
    } else if (type === 'RNA') {
      const tempVal = this.rnaFormLists().at(i).value;
      const idx = tempVal.tumorburden.indexOf('%');
      if (idx !== -1) {
        tumorvalue = tempVal.tumorburden.replace(/\%/g, '');
      }
      tumorvalue = tempVal.tumorburden;
    }
    return parseInt(tumorvalue, 10) < 50 ? true : false;
  }

  pmColor(i: number, type: string): boolean {
    let pmvalue = '';
    if (type === 'DNA') {
      const tempVal = this.dnaFormLists().at(i).value;
      pmvalue = tempVal.pm;
    } else if (type === 'RNA') {
      const tempVal = this.rnaFormLists().at(i).value;
      pmvalue = tempVal.pm;
    }
    return parseInt(pmvalue, 10) < 10 ? true : false;
  }

  dwTeColor(i: number, type: string, dwte: string): boolean {
    let dwteval = '';
    if (type === 'DNA') {
      const tempVal = this.dnaFormLists().at(i).value;
      if (dwte === 'DW') {
        dwteval = tempVal.dw;
      } else if (dwte === 'TE') {
        dwteval = tempVal.te;
      }
    } else if (type === 'RNA') {
      const tempVal = this.rnaFormLists().at(i).value;
      if (dwte === 'DW') {
        dwteval = tempVal.dw;
      } else if (dwte === 'TE') {
        dwteval = tempVal.te;
      }
    }
    return parseInt(dwteval, 10) < 0 ? true : false;
  }



  dnaDw(i: number, type: string, dnadw: string, val: number): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const totalVal = 20.0;

    if (type === 'DNA') {
      if (dnadw.toLowerCase() === 'dna') {
        const dnadwval = totalVal - val;
        controlDNA.at(i).patchValue({ dw: dnadwval, tot_ct: 20.0 });
      } else if (dnadw.toLowerCase() === 'dw') {
        const dnadwval = totalVal - val;
        controlDNA.at(i).patchValue({ dan_rna: dnadwval, tot_ct: 20.0 });
      }
    } else if (type === 'RNA') {
      if (dnadw.toLowerCase() === 'dna') {
        const dnadwval = totalVal - val;
        controlRNA.at(i).patchValue({ dw: dnadwval, tot_ct: 20.0 });
      } else if (dnadw.toLowerCase() === 'dw') {
        const dnadwval = totalVal - val;
        controlRNA.at(i).patchValue({ dan_rna: dnadwval, tot_ct: 20.0 });
      }
    }
  }

  dnaTe(i: number, type: string, dnate: string, val: number): void {
    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    const totalVal = 5.5;

    if (type === 'DNA') {
      if (dnate.toLowerCase() === 'dna') {
        const dnateval = totalVal - val;
        controlDNA.at(i).patchValue({ te: dnateval, quan_tot_vol: 5.5 });
      } else if (dnate.toLowerCase() === 'te') {
        const dnateval = totalVal - val;
        controlDNA.at(i).patchValue({ quan_dna: dnateval, quan_tot_vol: 5.5 });
      }
    }

  }

  // keyupStatue(val: any, type: string): void {
  //   if (type === 'DNA') {
  //     this.dnaStatus = false;
  //   } else if (type === 'RNA') {
  //     this.rnaStatus = false;
  //   }

  // }

  // textalign(type: string): { input_direction: boolean, input_align: boolean } {
  //   if (type === 'DNA') {
  //     if (this.dnaStatus) {
  //       return { input_direction: true, input_align: true };
  //     }
  //     return { input_direction: false, input_align: true };
  //   } else if (type === 'RNA') {
  //     if (this.rnaStatus) {
  //       return { input_direction: false, input_align: true };
  //     }
  //     return { input_direction: true, input_align: true };

  //   }

  // }

}
