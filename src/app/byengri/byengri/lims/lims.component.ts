import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, tap } from 'rxjs/operators';
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
export class LimsComponent implements OnInit, OnChanges {
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
  // dnaFileLists: IDNATYPE[] = [];
  // rnaFileLists: IRNATYPE[] = [];

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
  @ViewChild('table', { static: true }) table: ElementRef;

  constructor(
    private limsService: LimsService,
    private searchService: SearchService,
    private manageUsersService: ManageUsersService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.search(this.endToday());
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

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  search(searchdate: string): void {
    // 2021-05-20
    this.dnaObservable$ = this.limsService.search(searchdate);
    this.dnaObservable$
      .pipe(
        map(lists => {
          return lists.sort((a, b) => {
            if (a.id < b.id) { return -1; }
            if (a.id > b.id) { return 1; }
            if (a.id === b.id) { return 0; }
          });
        }),
      )
      .subscribe(data => {

        data.forEach(i => {
          const val = {
            id: i.id,
            pathology_num: i.pathology_num,
            rel_pathology_num: i.rel_pathology_num,
            prescription_date: i.prescription_date,
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
            dan_rna: 0,
            dw: 0,
            tot_ct: i.tot_ct,
            ct: i.ct,
            quantity: i.quantity,
            quantity_2: 0,
            quan_dna: 0,
            te: 0,
            quan_tot_vol: i.quan_tot_vol,
            lib_hifi: i.lib_hifi,
            pm: i.pm,
            x100: 0,
            lib: i.lib,
            lib_dw: 0,
            lib2: i.lib2,
            lib2_dw: 0,
          };

          this.dnaLists.push(val);
        });
        // console.log(this.dnaLists);
        this.dnaLists.forEach(list => {
          this.dnaFormLists().push(this.createDNA(list));
        });

        this.dnaLists.forEach(list => {
          this.rnaFormLists().push(this.createRNA(list));
        });

      });

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
      dan_rna: 0,
      dw: 0,
      tot_ct: i.tot_ct,
      ct: i.ct,
      quantity: i.quantity,
      quantity_2: 0,
      quan_dna: 0,
      te: 0,
      quan_tot_vol: i.quan_tot_vol,
      lib_hifi: i.lib_hifi,
      pm: i.pm,
      x100: 0,
      lib: i.lib,
      lib_dw: 0,
      lib2: i.lib2,
      lib2_dw: 0,
      dna_rna_gbn: '0',
      pathology_num2: i.pathology_num,
      id2: i.id,
    });
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
      dan_rna: 0,
      dw: 0,
      tot_ct: i.tot_ct,
      ct: i.ct,
      quantity: i.quantity,
      quantity_2: 0,
      quan_dna: 0,
      te: 0,
      quan_tot_vol: i.quan_tot_vol,
      lib_hifi: i.lib_hifi,
      pm: i.pm,
      x100: 0,
      lib: i.lib,
      lib_dw: 0,
      lib2: i.lib2,
      lib2_dw: 0,
      dna_rna_gbn: '1',
      pathology_num2: i.pathology_num,
      id2: i.id,
    });
  }

  rnaFormLists(): FormArray {
    return this.rnaForm.get('rnaFormgroup') as FormArray;
  }

  onFileSelected(event: any): void {
    // console.log('[243][tsvupload] ', event);
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
          if (C === 1) {
            if (type === 'DNA') {
              id = cell.v.split('D')[0];
            } else if (type === 'RNA') {
              id = cell.v.split('R')[0];
            }

          } else if (C === 4) {
            ngui = cell.v;
          } else if (C === 8) {
            dna260280 = cell.v;
          } else if (C === 9) {
            dna260230 = cell.v;
          }
        }
        if (R > 0 && type === 'DNA') {
          dnaFileLists.push({
            pathology_num: id.toString(),
            nano_280: dna260280.toString(),
            nano_230: dna260230.toString(),
            ng_ui: ngui.toString()
          });
        } else if (R > 0 && type === 'RNA') {
          rnaFileLists.push({
            pathology_num: id.toString(),
            nano_280: dna260280.toString(),
            nano_230: dna260230.toString(),
            ng_ui: ngui.toString()
          });
        }
        id = '';
        ngui = 0;
        dna260280 = 0;
        dna260230 = 0;

      }

      if (type === 'DNA') {
        // console.log(dnaFileLists);
        this.updateDNAScreen(dnaFileLists);
      } else if (type === 'RNA') {
        this.updateRNAScreen(rnaFileLists);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  updateDNAScreen(lists: IDNATYPE[]): void {
    const control = this.dnaForm.get('dnaFormgroup') as FormArray;
    const formData: ILIMS[] = control.getRawValue();

    formData.forEach((data, index) => {
      const idx = lists.findIndex(list => list.pathology_num.trim() === data.pathology_num.trim());
      if (idx !== -1) {
        const { pathology_num, nano_280, nano_230, ng_ui } = lists[idx];
        const danRna = (20 / parseFloat(ng_ui)) * 5;
        const dwVal = 20 - danRna;
        control.at(index).patchValue({
          ng_ui, nano_280, nano_230, dan_rna: danRna.toFixed(2), dw: dwVal.toFixed(2)
        });
      }
    });

  }

  updateRNAScreen(lists: IDNATYPE[]): void {
    const control = this.rnaForm.get('rnaFormgroup') as FormArray;
    const formData: ILIMS[] = control.getRawValue();
    formData.forEach((data, index) => {
      const idx = lists.findIndex(list => list.pathology_num.trim() === data.pathology_num.trim());
      if (idx !== -1) {
        const { pathology_num, nano_280, nano_230, ng_ui } = lists[idx];
        const danRna = (20 / parseFloat(ng_ui)) * 5;
        const dwVal = 20 - danRna;
        control.at(index).patchValue({
          ng_ui, nano_280, nano_230, dan_rna: danRna.toFixed(2), dw: dwVal.toFixed(2)
        });
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
    console.log('[583][save]', allData);
    this.limsService.save(allData, this.examiner, this.rechecker)
      .subscribe();
  }


  printexcel(): void {
    const dnacontrol = this.dnaForm.get('dnaFormgroup') as FormArray;
    const dnaFormData = dnacontrol.getRawValue();
    dnaFormData.unshift({
      id: 'No.',
      pathology_num: '병리번호',
      rel_pathology_num: '관련병리번호',
      prescription_date: '접수일자',
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
      lib2_dw: 'library',
      pathology_num2: '병리번호',
      id2: 'No.',
    });

    const rnacontrol = this.rnaForm.get('rnaFormgroup') as FormArray;
    const rnaFormData = rnacontrol.getRawValue();
    rnaFormData.unshift({
      id: 'No.',
      pathology_num: '병리번호',
      rel_pathology_num: '관련병리번호',
      prescription_date: '접수일자',
      patientID: '등록번호',
      name: '등록번호',
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
      lib2_dw: 'library',
      pathology_num2: '병리번호',
      id2: 'No.',
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
    console.log('[672][Excel]', allData);
    const width = [{ width: 4 }, { width: 16 }, { width: 13 }, { width: 12 }, { width: 11 },
    { width: 8 }, { width: 9 }, { width: 5 }, { width: 8 }, { width: 9 },
    { width: 19 }, { width: 18 }, { width: 5 }, { width: 8 }, { width: 8 },
    { width: 8 }, { width: 14 }, { width: 8 }, { width: 8 }, { width: 8 },
    { width: 7 }, { width: 9 }, { width: 9 }, { width: 8 }, { width: 8 },
    { width: 8 }, { width: 8 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 6 }, { width: 9 }, { width: 7 }, { width: 9 }, { width: 15 }, { width: 5 }
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
