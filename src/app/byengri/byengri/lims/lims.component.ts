import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { fromEvent, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, debounceTime, distinctUntilChanged, filter, map, shareReplay, take, tap } from 'rxjs/operators';
import { IDNATYPE, ILIMS, IRNATYPE, IUSER } from '../../models/lims.model';
import { LimsService } from '../../services/lims.service';
import { SearchService } from '../../services/search.service';
import * as moment from 'moment';
import { ManageUsersService } from 'src/app/home/services/manageUsers.service';


import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-lims',
  templateUrl: './lims.component.html',
  styleUrls: ['./lims.component.scss']
})
export class LimsComponent implements OnInit, AfterViewInit {
  LISTS = [
    'Bladder cancer', 'Bladder adenocarcinoma', 'Bladder small cell neuroendocrine carcinoma',
    'Bladder squamous cell carcinoma', 'Bladder urothelial carcinoma', 'Breast cancer',
    'Cervical cancer', 'Colorectal cancer', 'Colon cancer',
    'Rectal cancer', 'Esophageal cancer', 'Gastric cancer',
    'Gastroesophageal junction adenocarcinoma', 'Gastrointestinal stromal tumor', 'Glioblastoma',
    'Head and nect cancer', 'Kidney cancer', 'Liver cancer',
    'Cholangiocarcinoma', 'Melanoma', 'Mesothelioma',
    'Non-small cell lung cancer', 'Osteosarcoma', 'Ovarian cancer',
    'Pancreatic cancer', 'Prostate cancer', 'Skin basal cell carcinoma',
    'Small cell lung cancer', 'Soft tissue sarcoma', 'Angiosarcoma',
    'Clear cell sarcoma of soft tissue', 'Dermatofibrosarcoma protuberans', 'Desmoplastic small round cell tumor',
    'Ewing sarcoma/Peripheral primitive neuroectodermal tumor', 'Ewing sarcoma', 'Extraskeletal Ewing sarcoma',
    'Flbrosarcoma', 'Leiomyosarcoma', 'Liposarcoma',
    'Lymphangiosacoma', 'Malignant peripheral nerve sheath tumor', 'Phabdomyosarcoma',
    'Synovial sarcoma', 'Undifferentiated/Unclassified sarcoma', 'Testcular cancer',
    'Thyroid cancer', 'Differentiated thyroid gland carcinoma', 'Poorly differentiated thyroid gland carcinoma',
    'Thyroid gland anaplastic carcinoma', 'Thyroid gland follicular carcinoma', 'Thyroid gland Hurthle cell carcinoma',
    'Thyroid gland medullary carcinoma', 'Sporadic thyroid gland medullary carcinoma',
    'Thyroid gland papillary carcinoma',
    'Columnar cell variant thyroid gland papillary carcinoma', 'Tall cell variant thyroid gland papillary carcinoma',
    'Triple negative breast cancer', 'Unknown primary origin', 'Other soilid tumor',
  ];
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

  @ViewChild('table', { static: true }) table: ElementRef;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @ViewChild('cancertype', { static: true }) cancertype: ElementRef;
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

    this.exminObservable$
      .pipe(
        map(lists => lists.filter(list => list.part_nm === 'Doctor')),
      )
      .subscribe(data => {
        data.forEach(list => {
          this.doctorList.push({ name: list.user_nm, id: list.user_id });
        });
      });

    this.exminObservable$
      .pipe(
        map(lists => lists.filter(list => list.part_nm === 'Tester')),
      )
      .subscribe(data => {
        data.forEach(list => {
          this.examinList.push({ name: list.user_nm, id: list.user_id });
        });
      });
  }


  keyUp(evt: any): void {
    // console.log(evt);
    of(evt).pipe(
      map(event => event.target.value),
      debounceTime(400),
      distinctUntilChanged(),
      catchError(err => of(''))
    ).subscribe(data => {
      if (data.length === 0) {
        this.LISTS = [];
        this.LISTS = [...this.listsTemp];
      } else {
        const list = this.LISTS.filter(item => item.toLowerCase().search(data.toLowerCase()) >= 0);
        this.LISTS = [];
        this.LISTS = [...list];
      }

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
        tap(data => console.log(data)),
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
        map(lists => {
          return lists.sort((a, b) => {
            const aid = parseInt(a.id, 10);
            const bid = parseInt(b.id, 10);

            if (aid < bid) { return -1; }
            if (aid > bid) { return 1; }
            if (aid === bid) { return 0; }
          });
        }),
      )
      .subscribe(data => {
        this.processing = false;
        this.makeDNARNAList(data);

      });

  }

  makeDNARNAList(data: ILIMS[]): void {
    data.forEach(i => {
      if (parseInt(i.dna_rna_gbn, 10) === 0) {
        const val = {
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
          lib: i.lib,
          lib_dw: i.lib_dw,
          lib2: i.lib2,
          lib2_dw: i.lib2_dw,
        };
        this.dnaLists.push(val);
      } else if (parseInt(i.dna_rna_gbn, 10) === 1) {
        const val = {
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
          lib: i.lib,
          lib_dw: i.lib_dw,
          lib2: i.lib2,
          lib2_dw: i.lib2_dw,
        };
        this.rnaLists.push(val);
      }
    });

    console.log('[DNA]', this.dnaLists);
    console.log('[RNA]', this.rnaLists);
    this.dnaLists.forEach(list => {
      this.dnaFormLists().push(this.createDNA(list));
    });

    this.rnaLists.forEach(list => {
      this.rnaFormLists().push(this.createRNA(list));
    });
  }

  testSearch(start: string, testdate: string): void {

    const controlDNA = this.dnaForm.get('dnaFormgroup') as FormArray;
    const controlRNA = this.rnaForm.get('rnaFormgroup') as FormArray;
    controlDNA.clear();
    controlRNA.clear();
    this.dnaLists = [];
    this.rnaLists = [];
    // DNA, RNA 구분 dna_rna_gbn 을 구분

    this.processing = true;
    this.dnaObservable$ = this.limsService.testSearch(start);
    this.dnaObservable$
      .pipe(
        tap(data => console.log(data)),
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
        map(lists => {
          return lists.sort((a, b) => {
            const aid = parseInt(a.id, 10);
            const bid = parseInt(b.id, 10);

            if (aid < bid) { return -1; }
            if (aid > bid) { return 1; }
            if (aid === bid) { return 0; }
          });
        }),
        map(lists => {
          return lists.map(list => {
            list.report_date = testdate;
            return { ...list };
          });
        })
      )
      .subscribe(data => {
        this.processing = false;
        this.makeDNARNAList(data);

      });
    // this.limsService.testSearch(start)
    //   .subscribe(data => {
    //     console.log(data);
    //   });
  }

  createDNA(i: ILIMS): FormGroup {
    return this.fb.group({
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
      lib: i.lib,
      lib_dw: i.lib_dw,
      lib2: i.lib2,
      lib2_dw: i.lib2_dw,
      dna_rna_gbn: '0',
      report_date: i.report_date
    });
  }

  removeDNA(i: number): void {
    this.dnaFormLists().removeAt(i);
  }

  dnaFormLists(): FormArray {
    return this.dnaForm.get('dnaFormgroup') as FormArray;
  }

  createRNA(i: ILIMS): FormGroup {
    return this.fb.group({
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
      lib: i.lib,
      lib_dw: i.lib_dw,
      lib2: i.lib2,
      lib2_dw: i.lib2_dw,
      dna_rna_gbn: '1',
      report_date: i.report_date
    });
  }

  removeRNA(i: number): void {
    this.rnaFormLists().removeAt(i);
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
          if (C === 1) {  // 검체번호
            if (type === 'DNA') {
              const temp = cell.v.split('D')[0];
              const nameTemp = temp.split('-');
              id = nameTemp[0] + '-' + '0' + nameTemp[1];
            } else if (type === 'RNA') {
              const temp = cell.v.split('R')[0];
              const nameTemp = temp.split('-');
              id = nameTemp[0] + '-' + '0' + nameTemp[1];
            }

          } else if (C === 4) {
            ngui = cell.v;
          } else if (C === 8) { // 260/280
            dna260280 = cell.v;
          } else if (C === 9) { // 260/230
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
        }
        id = '';
        ngui = 0;
        dna260280 = 0;
        dna260230 = 0;

      }
      console.log('[559][DNA]', dnaFileLists);
      console.log('[560][RNA]', rnaFileLists);

      if (type === 'DNA') {
        this.updateDNAScreen(dnaFileLists);
      } else if (type === 'RNA') {
        this.updateRNAScreen(rnaFileLists);
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
      const idx = lists.findIndex(list => list.pathology_num === data.pathology_num);

      if (idx !== -1) {
        const { pathology_num, nano_280, nano_230, ng_ui } = lists[idx];

        // const danRna = (20 / parseFloat(ng_ui)) * 5;
        // const dwVal = 20 - danRna;
        console.log('[582]', idx, pathology_num, nano_280, nano_230, ng_ui);
        control.at(index).patchValue({
          nano_ng: ng_ui, nano_280, nano_230
          // nano_ng: ng_ui, nano_280, nano_230, dan_rna: danRna.toFixed(2), dw: dwVal.toFixed(2)
        });
      }
    });

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
      dan_rna: ngul.toFixed(2), dw: dw.toFixed(2)
    });
  }

  rnaNgUl(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const ngul = (20 / parseFloat(val)) * 5;
    const dw = 20 - ngul;
    control.at(i).patchValue({
      dan_rna: ngul.toFixed(2), dw: dw.toFixed(2)
    });
  }

  dnaDanRna(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dw = 20 - parseFloat(val);
    control.at(i).patchValue({
      dw: dw.toFixed(2)
    });
  }

  rnaDanRna(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const dw = 20 - parseFloat(val);
    control.at(i).patchValue({
      dw: dw.toFixed(2)
    });
  }

  dnaQuatity(i: number, val: string): void {
    console.log('[453]', i, val);
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const quantity2 = parseFloat(val) / 2;
    const quanDna = 20 / quantity2;
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quantity_2: quantity2.toFixed(2), quan_dna: quanDna.toFixed(2), te: te.toFixed(2)
    });
  }

  rnaQuatity(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const quantity2 = parseFloat(val) / 2;
    const quanDna = 20 / quantity2;
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quantity_2: quantity2.toFixed(2), quan_dna: quanDna.toFixed(2), te: te.toFixed(2)
    });
  }

  dnaQuatity2(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const quanDna = 20 / parseFloat(val);
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quan_dna: quanDna.toFixed(2), te: te.toFixed(2)
    });
  }

  rnaQuatity2(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const quanDna = 20 / parseFloat(val);
    const te = 5.5 - quanDna;
    control.at(i).patchValue({
      quan_dna: quanDna.toFixed(2), te: te.toFixed(2)
    });
  }

  dnaQuanDna(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const te = 5.5 - parseFloat(val);
    control.at(i).patchValue({
      te: te.toFixed(2)
    });
  }

  rnaQuanDna(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const te = 5.5 - parseFloat(val);
    control.at(i).patchValue({
      te: te.toFixed(2)
    });
  }

  dnaPm(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const x100 = parseFloat(val) * 100;
    const libDw = (x100 / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      x100: x100.toFixed(2), lib_dw: libDw.toFixed(2), lib2_dw: lib2Dw.toFixed(2)
    });
  }

  rnaPm(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const x100 = parseFloat(val) * 100;
    const libDw = (x100 / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      x100: x100.toFixed(2), lib_dw: libDw.toFixed(2), lib2_dw: lib2Dw.toFixed(2)
    });
  }


  dnax100(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const libDw = (parseFloat(val) / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib_dw: libDw.toFixed(2), lib2_dw: lib2Dw.toFixed(2)
    });
  }

  rnax100(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const libDw = (parseFloat(val) / 50) - 1;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib_dw: libDw.toFixed(2), lib2_dw: lib2Dw.toFixed(2)
    });
  }



  dnalibdw(i: number, val: string): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const libDw = parseFloat(val) * 100;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib2_dw: lib2Dw.toFixed(2)
    });
  }

  rnalibdw(i: number, val: string): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const libDw = parseFloat(val) * 100;
    const lib2Dw = libDw * 3;
    control.at(i).patchValue({
      lib2_dw: lib2Dw.toFixed(2)
    });
  }

  selectedExamin(id: string): void {
    this.examiner = id;

    console.log(id);
  }

  selectedRecheck(id: string): void {
    this.rechecker = id;
    console.log(id);
  }

  save(): void {

    const dnacontrol = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dnaFormData = dnacontrol.getRawValue();
    const rnacontrol = this.rnaForm.get('rnaFormgroup') as FormArray;
    const rnaFormData = rnacontrol.getRawValue();

    const allData: ILIMS[] = [...dnaFormData, ...rnaFormData];

    if (this.examiner.length === 0 || this.rechecker.length === 0) {
      alert('검사자항목이 없습니다.');
      return;
    }

    if (allData.length === 0) {
      alert('DNA/RNA 데이터가 없습니다.');
      return;
    }

    console.log('[679][]', this.examiner, this.rechecker);
    this.limsService.save(allData, this.examiner, this.rechecker)
      .subscribe((data) => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
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
    });
    const tempDNA = [];
    const tempRNA = [];

    dnaFormData.forEach(list => {
      const { dna_rna_gbn, ...temp } = list;
      tempDNA.push(temp);
    });

    rnaFormData.forEach(list => {
      const { dna_rna_gbn, ...temp } = list;
      tempRNA.push(temp);
    });

    const allData: ILIMS[] = [...tempDNA, ...tempRNA];
    console.log(allData);
    const width = [{ width: 4 }, { width: 16 }, { width: 13 }, { width: 12 }, { width: 11 }, { width: 11 }, // A, B,C,D,E,F
    { width: 7 }, { width: 11 }, { width: 10 }, { width: 8 }, { width: 9 }, // G, H, I, J, K
    { width: 19 }, { width: 18 }, { width: 7 }, { width: 7 }, { width: 8 }, // L, M, N, O ,P
    { width: 8 }, { width: 7 }, { width: 6 }, { width: 6 }, { width: 8 }, // Q, R ,S, T, U,
    { width: 8 }, { width: 8 }, { width: 14 }, { width: 14 }, { width: 6 }, // V, W, X, Y, Z,
    { width: 8 }, { width: 8 }, { width: 9 }, { width: 9 }, { width: 9 }, // AA,AB, AC, AD, AE
    { width: 10 }, { width: 10 }, { width: 7 }, { width: 10 }, { width: 7 }, { width: 7 }  // AF, AG, AH, AI, AJ, AK
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

  tableHeader(): {} {
    if (this.topScroll) {
      return { 'header-fix': true, 'td-fix': false };
    }
    return { 'header-fix': false, 'td-fix': true };
  }

}
