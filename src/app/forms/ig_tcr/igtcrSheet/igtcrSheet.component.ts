import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {  concatMap, switchMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IPatient } from 'src/app/home/models/patients';
import { IClonal, INoGraph, ITcrData, IWGraph } from '../igtcr.model';
import { IgtcrService } from '../igtcr.services';
import * as moment from 'moment';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { UtilsService } from '../../commons/utils.service';
// import { EChartsOption } from 'echarts';


@Component({
  selector: 'app-igtcr-sheet',
  templateUrl: './igtcrSheet.component.html',
  styleUrls: [ './igtcrSheet.component.scss']
})
export class IgTcrSheetComponent implements OnInit {

  comment2 =' * Clonal IGH read depth를 전체 IGH read depth로 나눈 값으로 B 세포 중의 클론의 비율을 의미합니다.';
  commentMRD = `* Clonal IGH read depth를 전체 IGH read depth로 나눈 값으로 B 세포 중의 클론의 비율을 의미합니다.
** LymphoQuant Internal Control (LQIC)을 이용하여 clonal IGH를 전체 유핵세포 내의 세포수 비율로 환산한 근사치입니다.
*** 검체 당 B 세포 100개 정도의 DNA(LymphoQuant Internal Control, LQIC)를 혼합하여 측정된 값을 변환한 것입니다.
  - PCR 증폭은 B 세포의 DNA양에 영향을 받으며 primer결합 부위 변이가 있는 경우 위음성을 보일 가능성이 있습니다.
  - 검사의 분석 민감도는 약 〖10〗^(-4) ~ 〖10〗^(-5)입니다.`;
  testCode = '';
  reportID = '';
  bcellLPE555LPE556 = '';
  pcellLPE557 = '';
  mrdBcellLPE555LPE556 = '';
  mrdPcellLPE557 = '';
  mrdnucleatedCells = '';
  comment = '';
  screenstatus = ''; 

  resultStatus = 'Detected';
  // title = '';
  clonalLists: IClonal[] = [];
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
    gbn: '',
    bamFilename: '',
    sendEMRDate: '',
    report_date: '',
    specimenNo: '',
    test_code: '',
    screenstatus: '',
    recheck: '',
    examin: '',
    comment: ''
  };

  mockData: IClonal[] = [];
  formWithoutgraph: INoGraph[] =[];
  totalBCells = 0;
  formWithgraph: IWGraph[] = [];

  tablerowForm: FormGroup ;
  clonalNo = 3;
  clonalDisplay4 = true;
  clonalDisplay5 = true;
  clonalDisplay6 = true;
  clonalDisplay7 = true;
  clonalDisplay8 = true;
  clonalDisplay9 = true;
  clonalDisplay10 = true;

  // 그래프 데이터
  checkDate: string[] = [];
  clonalTotalIGHReadDepthData: number[] = [];
  clonalTotalnuclelatedCellsData: number[] = [];
  options: any = {};
  colors = ['#5470C6',  '#EE6666'];

  examin = ''; // 검사자
  recheck = ''; // 확인자
  requestDate = ''; // 검사의뢰일
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일

  igTcrData: ITcrData = {
    specimenNo: this.patientInfo.specimenNo,
    method: this.patientInfo.reportTitle,
    recheck: this.recheck,
    examin: this.examin,
    comment: '',
    sendEMRDate: this.patientInfo.sendEMRDate,
    report_date: this.patientInfo.sendEMRDate,
    data:  []
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public service : IgtcrService,
    private patientsListService: PatientsListService,
    private utilsService: UtilsService,

  ){
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list))),
    });
    this.updateGraphData();

  }

  ngOnInit(): void {
    this.init();
  }

  init() {

    this.route.params
    .pipe(

      tap(data => {
        this.testCode = data['type'];
        this.reportID = data['id'];
 
      }),
      switchMap(data => of(data['id'])),
      tap(data => {
        this.patientInfo = this.service.patientLists[data];
        if (this.testCode === 'TRB') {
            this.patientInfo.reportTitle = 'TRB Gene Rearrangement Analysis [NGS]';
          } else if (this.testCode == 'TRG') {
            this.patientInfo.reportTitle = 'TRG Gene Rearrangement Analysis [NGS]';
          }
        // 판독자 , 검사자
        if (this.patientInfo.examin?.length) {
            this.examin = this.patientInfo.examin;
        }

        if (this.patientInfo.recheck?.length) {
                this.recheck = this.patientInfo.recheck;
            }

        this.requestDate = this.patientInfo.accept_date;   
        if (this.patientInfo.sendEMRDate !== undefined || this.patientInfo.sendEMRDate !== null) {
          this.firstReportDay = this.patientInfo.sendEMRDate;
          this.lastReportDay = this.patientInfo.sendEMRDate;
        }
        this.screenstatus = this.patientInfo.screenstatus;
        this.comment = this.patientInfo.comment;
      }),
      concatMap(() => {
       return this.service.igtcrListInfo(this.patientInfo.specimenNo)

      }),
      tap(data => this.clonalLists = data)
    )
    .subscribe(data => {
      this.clonalLists.forEach((item, index) => {
        this.addRow(item);
        this.clonalTotalIGHReadDepth(index);
        this.clonalTotalNuclelatedCell(index);
        this.totalCellEquivalent(index);
      });
      
    });
    
    this.utilsService.getListsDig('AMLALL')
    .subscribe(data => {
      this.examin = data[0].checker;
      this.recheck = data[0].reader;
    });
  }
//////////////////////////////////////////
 putFormWithoutgraph(
          index: string,
          vregion: string,
          jregion: string,
          length: string,
          totalIGHreadDepth: string,
          clonalIGHDepth: number,
          clonalTotalIGHReadDepth: string,
          clonalCellEquivalent: string,
          ClonalCellSequence:string
 ) {
        this.formWithoutgraph.push({
          index,
          vregion,
          jregion,
          length,
          totalIGHreadDepth,
          clonalIGHDepth,
          clonalTotalIGHReadDepth,
          clonalCellEquivalent,
          ClonalCellSequence
        });

 }

////////////////////////////////////////////
  createPdf() {
    this.screenstatus = '3';
    this.patientInfo.screenstatus = '3';
    this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'3','3000', 'userid').subscribe(data => {
      this.saveAllData();
   });
   
    const tableRows = this.tablerowForm.get('tableRows') as FormArray;
    const totalIGHReadDepth = tableRows.at(tableRows.length- 1).get('total_IGH_read_depth')?.value;
    this.mrdPcellLPE557 = tableRows.at(tableRows.length- 1).get('total_nucelated_cells')?.value;

    if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE555') {
      this.mrdBcellLPE555LPE556 = totalIGHReadDepth;
    } else if(this.patientInfo.test_code === 'LPE557') {
      this.mrdPcellLPE557 = totalIGHReadDepth;
    }

    this.makePDFData();
    setTimeout(() => {
      this.createPdf2();
    }, 2000);

    this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'3','3000', 'userid').subscribe(data => {
      console.log('[241][PDF]][3]...',);
   });
  }

  createPdf2() {
    const tableRows = this.tablerowForm.get('tableRows') as FormArray;
    let filename = '';
    let DATA: any;

    if (tableRows.length === 1) {
      DATA = document.getElementById('resultSheet');
    } else {
      DATA = document.getElementById('resultMRD');
    }

    html2canvas(DATA).then((canvas) => {

      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      if (tableRows.length === 1) {
        filename = 'IGH_CLONALITY_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
      } else {
        filename = 'IGH_MRD_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
      }
      
      PDF.save(filename);

    }) ;

  }



  igtcr(): void {
    this.router.navigate(['/diag', 'igtcrMainLists']);
  }

    // tslint:disable-next-line:typedef
  result(event: any) {
      this.resultStatus = event.srcElement.defaultValue;
    }

  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }

  closeModal(): void {
    console.log('시험용');
  }

  changeTitle(title: string) {
    this.patientInfo.reportTitle = title;
  }

  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year  + newmon +  newday;

    return now;
  }

  today2(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;

    return now;
  }

///////////////////////////////////////
createRow(item: IClonal): FormGroup {

  return this.fb.group({
    IGHV_mutation : [item.IGHV_mutation],
    bigo : [item.bigo],
    cell_equipment1: [item.cell_equipment1],
    cell_equipment2: [item.cell_equipment2],
    cell_equipment3: [item.cell_equipment3],
    cell_equipment4: [item.cell_equipment4],
    cell_equipment5: [item.cell_equipment5],
    cell_equipment6: [item.cell_equipment6],
    cell_equipment7: [item.cell_equipment7],
    cell_equipment8: [item.cell_equipment8],
    cell_equipment9: [item.cell_equipment9],
    cell_equipment10: [item.cell_equipment10],
    comment: [item.comment],
    gene: [item.gene],
    j_gene1: [item.j_gene1],
    j_gene2: [item.j_gene2],
    j_gene3: [item.j_gene3],
    j_gene4: [item.j_gene4],
    j_gene5: [item.j_gene5],
    j_gene6: [item.j_gene6],
    j_gene7: [item.j_gene7],
    j_gene8: [item.j_gene8],
    j_gene9: [item.j_gene9],
    j_gene10: [item.j_gene10],
    percent_of_LQIC: [item.percent_of_LQIC],
    percent_total_reads1: [item.percent_total_reads1],
    percent_total_reads2: [item.percent_total_reads2],
    percent_total_reads3: [item.percent_total_reads3],
    percent_total_reads4: [item.percent_total_reads4],
    percent_total_reads5: [item.percent_total_reads5],
    percent_total_reads6: [item.percent_total_reads6],
    percent_total_reads7: [item.percent_total_reads7],
    percent_total_reads8: [item.percent_total_reads8],
    percent_total_reads9: [item.percent_total_reads9],
    percent_total_reads10: [item.percent_total_reads10],
    raw_count1: [item.raw_count1],
    raw_count2: [item.raw_count2],
    raw_count3: [item.raw_count3],
    raw_count4: [item.raw_count4],
    raw_count5: [item.raw_count5],
    raw_count6: [item.raw_count6],
    raw_count7: [item.raw_count7],
    raw_count8: [item.raw_count8],
    raw_count9: [item.raw_count9],
    raw_count10: [item.raw_count10],
    read_of_LQIC: [item.read_of_LQIC],
    report_date: [item.report_date],
    sequence1: [item.sequence1],
    sequence2: [item.sequence2],
    sequence3: [item.sequence3],
    sequence4: [item.sequence4],
    sequence5: [item.sequence5],
    sequence6: [item.sequence6],
    sequence7: [item.sequence7],
    sequence8: [item.sequence8],
    sequence9: [item.sequence9],
    sequence10: [item.sequence10],
    sequence_length1: [item.sequence_length1],
    sequence_length2: [item.sequence_length2],
    sequence_length3: [item.sequence_length3],
    sequence_length4: [item.sequence_length4],
    sequence_length5: [item.sequence_length5],
    sequence_length6: [item.sequence_length6],
    sequence_length7: [item.sequence_length7],
    sequence_length8: [item.sequence_length8],
    sequence_length9: [item.sequence_length9],
    sequence_length10: [item.sequence_length10],
    specimenNo: [item.specimenNo],
    total_Bcell_Tcell_count: [item.total_Bcell_Tcell_count],
    total_IGH_read_depth: [item.total_IGH_read_depth],
    total_cell_equipment: [item.total_cell_equipment],
    total_nucelated_cells: [item.total_nucelated_cells],
    total_read_count: [item.total_read_count],
    v_gene1: [item.v_gene1],
    v_gene2: [item.v_gene2],
    v_gene3: [item.v_gene3],
    v_gene4: [item.v_gene4],
    v_gene5: [item.v_gene5],
    v_gene6: [item.v_gene6],
    v_gene7: [item.v_gene7],
    v_gene8: [item.v_gene8],
    v_gene9: [item.v_gene9],
    v_gene10: [item.v_gene10],
  });
}

makeNewRow(): FormGroup  {
  return this.fb.group({
    IGHV_mutation : [''],
    bigo : [''],
    cell_equipment1: [''],
    cell_equipment2: [''],
    cell_equipment3: [''],
    cell_equipment4: [''],
    cell_equipment5: [''],
    cell_equipment6: [''],
    cell_equipment7: [''],
    cell_equipment8: [''],
    cell_equipment9: [''],
    cell_equipment10: [''],
    comment: [''],
    gene: [''],
    j_gene1: [''],
    j_gene2: [''],
    j_gene3: [''],
    j_gene4: [''],
    j_gene5: [''],
    j_gene6: [''],
    j_gene7: [''],
    j_gene8: [''],
    j_gene9: [''],
    j_gene10: [''],
    percent_of_LQIC: [''],
    percent_total_reads1: [''],
    percent_total_reads2: [''],
    percent_total_reads3: [''],
    percent_total_reads4: [''],
    percent_total_reads5: [''],
    percent_total_reads6: [''],
    percent_total_reads7: [''],
    percent_total_reads8: [''],
    percent_total_reads9: [''],
    percent_total_reads10: [''],
    raw_count1: [''],
    raw_count2: [''],
    raw_count3: [''],
    raw_count4: [''],
    raw_count5: [''],
    raw_count6: [''],
    raw_count7: [''],
    raw_count8: [''],
    raw_count9: [''],
    raw_count10: [''],
    read_of_LQIC: [''],
    report_date: [this.startToday()],
    sequence1: [''],
    sequence2: [''],
    sequence3: [''],
    sequence4: [''],
    sequence5: [''],
    sequence6: [''],
    sequence7: [''],
    sequence8: [''],
    sequence9: [''],
    sequence10: [''],
    sequence_length1: [''],
    sequence_length2: [''],
    sequence_length3: [''],
    sequence_length4: [''],
    sequence_length5: [''],
    sequence_length6: [''],
    sequence_length7: [''],
    sequence_length8: [''],
    sequence_length9: [''],
    sequence_length10: [''],
    specimenNo: [''],
    total_Bcell_Tcell_count: [''],
    total_IGH_read_depth: [''],
    total_cell_equipment: [''],
    total_nucelated_cells: [''],
    total_read_count: [''],
    v_gene1: [''],
    v_gene2: [''],
    v_gene3: [''],
    v_gene4: [''],
    v_gene5: [''],
    v_gene6: [''],
    v_gene7: [''],
    v_gene8: [''],
    v_gene9: [''],
    v_gene10: [''],
  });
}


addNewRow(): void {

  const control = this.tablerowForm.get('tableRows') as FormArray;
  control.push(this.makeNewRow());
}

addRow(item: IClonal): void {
  const control = this.tablerowForm.get('tableRows') as FormArray;
  control.push(this.createRow(item));
}

removeTableRow(i: number): void {
  this.formControls().removeAt(i);
}


formControls(): FormArray {
  const control = this.tablerowForm.get('tableRows') as FormArray;
  return control;
}

get getFormControls(): FormArray {
  const control = this.tablerowForm.get('tableRows') as FormArray;

  return control;
}
//////////////////////////////////////////////////////////////////////////


/////////////////  각종 식  /////////////////////////////////////////////////////////////
// TotalReadCount 값 변경시 percent % total reads1-10 = Raw count1-10 / Total read count
// % of LQIC 에 값 넣음
totalReadCount(index: number, totalReadCount: string): void {
   const tableRows = this.tablerowForm.get('tableRows') as FormArray;
   const readOfLQIC = tableRows.at(index).get('read_of_LQIC')?.value;

   this.percentOfLQIC(index, parseInt(totalReadCount), readOfLQIC);  // 3번 & of LQIC
   this.totalBcellTcellCount(index, parseInt(totalReadCount), readOfLQIC); // 4번 Total B-Cell T-Cell count

   // 7번
   const rawCount1 = tableRows.at(index).get('raw_count1')?.value;
   if (rawCount1 !== 0 && rawCount1 !== null && rawCount1 !== undefined &&  String(rawCount1).length !== 0) {
     this.percentTotalReads(index, rawCount1, Number(totalReadCount), 1);
   }

   const rawCount2 = tableRows.at(index).get('raw_count2')?.value;
   if (rawCount2 !== 0 && rawCount2 !== null && rawCount2 !== undefined &&  String(rawCount2).length !== 0) {
     this.percentTotalReads(index, rawCount2, Number(totalReadCount), 2);
   }

   const rawCount3 = tableRows.at(index).get('raw_count3')?.value;
   if (rawCount3 !== 0 && rawCount3 !== null && rawCount3 !== undefined &&  String(rawCount3).length !== 0) {
     this.percentTotalReads(index, rawCount3, Number(totalReadCount), 3);
   }

   const rawCount4 = tableRows.at(index).get('raw_count4')?.value;
   if (rawCount4 !== 0 && rawCount4 !== null && rawCount4 !== undefined &&  String(rawCount4).length !== 0) {
     this.percentTotalReads(index, rawCount4, Number(totalReadCount), 4);
   }

   const rawCount5 = tableRows.at(index).get('raw_count5')?.value;
   if (rawCount5 !== 0 && rawCount5 !== null && rawCount5 !== undefined &&  String(rawCount5).length !== 0) {
     this.percentTotalReads(index, rawCount5, Number(totalReadCount), 5);
   }

   const rawCount6 = tableRows.at(index).get('raw_count6')?.value;
   if (rawCount6 !== 0 && rawCount6 !== null && rawCount6 !== undefined &&  String(rawCount6).length !== 0) {
     this.percentTotalReads(index, rawCount6, Number(totalReadCount), 6);
   }

   const rawCount7 = tableRows.at(index).get('raw_count7')?.value;
   if (rawCount7 !== 0 && rawCount7 !== null && rawCount7 !== undefined &&  String(rawCount7).length !== 0) {
     this.percentTotalReads(index, rawCount7, Number(totalReadCount), 7);
   }

   const rawCount8 = tableRows.at(index).get('raw_count8')?.value;
   if (rawCount8 !== 0 && rawCount8 !== null && rawCount8 !== undefined &&  String(rawCount8).length !== 0) {
     this.percentTotalReads(index, rawCount8, Number(totalReadCount), 8);
   }

   const rawCount9 = tableRows.at(index).get('raw_count9')?.value;
   if (rawCount9 !== 0 && rawCount9 !== null && rawCount9 !== undefined &&  String(rawCount9).length !== 0) {
     this.percentTotalReads(index, rawCount9, Number(totalReadCount), 9);
   }

   const rawCount10 = tableRows.at(index).get('raw_count10')?.value;
   if (rawCount10 !== 0 && rawCount10 !== null && rawCount10 !== undefined &&  String(rawCount10).length !== 0) {
     this.percentTotalReads(index, rawCount10, Number(totalReadCount), 10);
   }

}


// Read of LQIC 값 변경시
// Total B-Cell/T-Cell count 에 값 넣음
readOfLQIC(index: number, readOfLQIC: string): void {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount = tableRows.at(index).get('total_read_count')?.value;

  this.percentOfLQIC(index, totalReadCount, parseInt(readOfLQIC));
  this.totalBcellTcellCount(index, totalReadCount, parseInt(readOfLQIC));
}


percentOfLQIC(index: number, totalReadCount: number, readOfLQIC: number) : string{
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const newPercentOfLQIC = ((readOfLQIC/totalReadCount) * 100).toFixed(2);
  tableRows.at(index).patchValue({ percent_of_LQIC: newPercentOfLQIC });
  return newPercentOfLQIC;
}

totalBcellTcellCount(index: number, totalReadCount: number, readOfLQIC: number) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const newTotalBcell = ((totalReadCount/readOfLQIC) * 100 ).toFixed(0);
  tableRows.at(index).patchValue({ total_Bcell_Tcell_count: newTotalBcell });
}

// Raw count1 변경시  percent % total reads1 = Raw count1 / Total read count
// % total reads 1 - 10 에 값 넣음
rawCount1(index: number , rawcount1: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount1), totalReadCount, 1);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount2(index: number , rawcount2: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount2), totalReadCount, 2);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount3(index: number , rawcount3: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount3), totalReadCount, 3);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount4(index: number , rawcount4: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount4), totalReadCount, 4);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount5(index: number , rawcount5: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount5), totalReadCount, 5);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount6(index: number , rawcount6: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount6), totalReadCount, 6);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount7(index: number , rawcount7: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount7), totalReadCount, 7);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount8(index: number , rawcount8: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount8), totalReadCount, 8);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount9(index: number , rawcount9: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount9), totalReadCount, 9);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}

rawCount10(index: number , rawcount7: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  this.percentTotalReads(index, parseInt(rawcount7), totalReadCount, 10);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);
}


percentTotalReads(index: number, rawCount: number, totalReadCount:number , clonalNo: number) {
        const tableRows = this.tablerowForm.get('tableRows') as FormArray;
        const newPercentTotalReads =   ((rawCount/totalReadCount)* 100).toFixed(2);
       const newPercentOfLQIC = tableRows.at(index).get('percent_of_LQIC')?.value;


      if (clonalNo === 1) {
          tableRows.at(index).patchValue({ percent_total_reads1: newPercentTotalReads});
      } else if (clonalNo === 2) {
          tableRows.at(index).patchValue({ percent_total_reads2: newPercentTotalReads});
      } else if (clonalNo === 3) {
        tableRows.at(index).patchValue({ percent_total_reads3: newPercentTotalReads});
      } else if (clonalNo === 4) {
        tableRows.at(index).patchValue({ percent_total_reads4: newPercentTotalReads});
      }  else if (clonalNo === 5) {
        tableRows.at(index).patchValue({ percent_total_reads5: newPercentTotalReads});
      }  else if (clonalNo === 6) {
        tableRows.at(index).patchValue({ percent_total_reads6: newPercentTotalReads});
      }  else if (clonalNo === 7) {
        tableRows.at(index).patchValue({ percent_total_reads7: newPercentTotalReads});
      }  else if (clonalNo === 8) {
        tableRows.at(index).patchValue({ percent_total_reads8: newPercentTotalReads});
      }  else if (clonalNo === 9) {
        tableRows.at(index).patchValue({ percent_total_reads9: newPercentTotalReads});
      } else if (clonalNo === 10) {
        tableRows.at(index).patchValue({ percent_total_reads10: newPercentTotalReads});
      }

      this.cellEquivalent(index, Number(newPercentTotalReads), Number(newPercentOfLQIC),clonalNo); // 8번

}

cellEquivalent(index: number, percentTotalReads: number, percentOfLQIC: number, clonalNo: number) {
        const tableRows = this.tablerowForm.get('tableRows') as FormArray;
        const totalReadCount =  tableRows.at(index).get('total_read_count')?.value; // total read count
        const readOfLQIC =  tableRows.at(index).get('read_of_LQIC')?.value; // read of LQIC

        if (clonalNo === 1) {
          const rawCount1 =  tableRows.at(index).get('raw_count1')?.value;
          tableRows.at(index).patchValue({ cell_equipment1: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount1))});
        } else if (clonalNo === 2) {
          const rawCount2 =  tableRows.at(index).get('raw_count2')?.value;
          tableRows.at(index).patchValue({ cell_equipment2: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount2))});
        }  else if (clonalNo === 3) {
          const rawCount3 =  tableRows.at(index).get('raw_count3')?.value;
          tableRows.at(index).patchValue({ cell_equipment3: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount3))});
        } else if (clonalNo === 4) {
          const rawCount4 =  tableRows.at(index).get('raw_count4')?.value;
          tableRows.at(index).patchValue({ cell_equipment4: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount4))});
        } else if (clonalNo === 5) {
          const rawCount5 =  tableRows.at(index).get('raw_count5')?.value;
          tableRows.at(index).patchValue({ cell_equipment5: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount5))});
        } else if (clonalNo === 6) {
          const rawCount6 =  tableRows.at(index).get('raw_count6')?.value;
          tableRows.at(index).patchValue({ cell_equipment6: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount6))});
        } else if (clonalNo === 7) {
          const rawCount7 =  tableRows.at(index).get('raw_count7')?.value;
          tableRows.at(index).patchValue({ cell_equipment7: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount7))});
        } else if (clonalNo === 8) {
          const rawCount8 =  tableRows.at(index).get('raw_count8')?.value;
          tableRows.at(index).patchValue({ cell_equipment8: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount8))});
        } else if (clonalNo === 9) {
          const rawCount9 =  tableRows.at(index).get('raw_count9')?.value;
          tableRows.at(index).patchValue({ cell_equipment9: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount9))});
        } else if (clonalNo === 10) {
          const rawCount10 =  tableRows.at(index).get('raw_count10')?.value;
          tableRows.at(index).patchValue({ cell_equipment10: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount10))});
        }
}

calulateCellEquivalent(totalReadCount: number, readOfLQIC: number, rawCount: number): string {
  const totalReadCountRawCount = totalReadCount * rawCount;
  const totalReadCountreadOfLQIC =  totalReadCount * readOfLQIC;
  return ((totalReadCountRawCount/totalReadCountreadOfLQIC)*100).toFixed(0)
}

// clonal total IGH read depth %
clonalTotalIGHReadDepth(index: number) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const reportDate = tableRows.at(index).get('report_date')?.value;
  const clonalTotalIGHReadDepth = this.getClonalTotalIGHReadDepth(index);
  tableRows.at(index).patchValue({ total_IGH_read_depth: clonalTotalIGHReadDepth});
  // console.log('[703]', index, clonalTotalIGHReadDepth);
    // LPE555 LPE556 B-Cells
  // LPE557 P-Cells
  if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE555') {
    this.bcellLPE555LPE556 = clonalTotalIGHReadDepth;
  } else if(this.patientInfo.test_code === 'LPE557') {
    this.pcellLPE557 = clonalTotalIGHReadDepth;
  }

  this.makeGraphclonalTotalIGHReadDepthData(index, reportDate, clonalTotalIGHReadDepth);

}

getClonalTotalIGHReadDepth(index: number): string {
    const tableRows = this.tablerowForm.get('tableRows') as FormArray;
    const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
    const rawCount1 = tableRows.at(index).get('raw_count1')?.value;
    const rawCount2 = tableRows.at(index).get('raw_count2')?.value;
    const rawCount3 = tableRows.at(index).get('raw_count3')?.value;
    const rawCount4 = tableRows.at(index).get('raw_count4')?.value;
    const rawcount5 = tableRows.at(index).get('raw_count5')?.value;
    const rawCount6 = tableRows.at(index).get('raw_count6')?.value;
    const rawcount7 = tableRows.at(index).get('raw_count7')?.value;
    const rawCount8 = tableRows.at(index).get('raw_count8')?.value;
    const rawCount9 = tableRows.at(index).get('raw_count9')?.value;
    const rawCount10 = tableRows.at(index).get('raw_count10')?.value;

    const totalRawCount =(Number(rawCount1) + Number(rawCount2) + Number(rawCount3) + Number(rawCount4) + Number(rawcount5) +
       Number(rawCount6) + Number(rawcount7) + Number(rawCount8) + Number(rawCount9) + Number(rawCount10));
       const totalIGH = (totalRawCount / Number(totalReadCount)* 100).toFixed(2);
    return totalIGH;
}

// Clonal/ total nuclelated cells %
clonalTotalNuclelatedCell(index: number) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const reportDate = tableRows.at(index).get('report_date')?.value;
  const clonalTotalNuclelatedCell = this.getClonalTotalNuclelatedCell(index);
  tableRows.at(index).patchValue({ total_nucelated_cells: clonalTotalNuclelatedCell});

  this.makeGraphclonalTotalNuclelatedCellsData(index, reportDate,  clonalTotalNuclelatedCell);

}

getClonalTotalNuclelatedCell(index: number): string {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value; // total read count
  const readOfLQIC =  tableRows.at(index).get('read_of_LQIC')?.value; // read of LQIC
 
  const totalReadCountReadOfLQIC = ((Number(totalReadCount)/Number(readOfLQIC)) / 36923) * 100;
  const totalRawCount = this.totalRawCount(index)
  const clonalTotalIGHReadDepth =  (totalRawCount / Number(totalReadCount))* 100;
  const clonalTotalNuclatedCell = (Number(totalReadCountReadOfLQIC) * Number(clonalTotalIGHReadDepth)).toFixed(4);
  return clonalTotalNuclatedCell;
}

totalRawCount(index: number): number {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const rawCount1 = tableRows.at(index).get('raw_count1')?.value;
  const rawCount2 = tableRows.at(index).get('raw_count2')?.value;
  const rawCount3 = tableRows.at(index).get('raw_count3')?.value;
  const rawCount4 = tableRows.at(index).get('raw_count4')?.value;
  const rawcount5 = tableRows.at(index).get('raw_count5')?.value;
  const rawCount6 = tableRows.at(index).get('raw_count6')?.value;
  const rawcount7 = tableRows.at(index).get('raw_count7')?.value;
  const rawCount8 = tableRows.at(index).get('raw_count8')?.value;
  const rawCount9 = tableRows.at(index).get('raw_count9')?.value;
  const rawCount10 = tableRows.at(index).get('raw_count10')?.value;

  const totalRawCount =(Number(rawCount1) + Number(rawCount2) + Number(rawCount3) + Number(rawCount4) + Number(rawcount5) +
     Number(rawCount6) + Number(rawcount7) + Number(rawCount8) + Number(rawCount9) + Number(rawCount10));

  return totalRawCount;
}


totalCellEquivalent(index: number) {
  // 공식(rawCount sum / total_read_count) / (read_of_LQIC / total_read_count) * 100
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  tableRows.at(index).get('total_read_count')?.value; // total read count
  const readOfLQIC =  tableRows.at(index).get('read_of_LQIC')?.value; // read of LQIC
  const totalRawCount = this.totalRawCount(index);

  const totalReadCountTotalRawCount = (totalRawCount/Number(totalReadCount));

  // 분수의 역수를 곱한다.
  const totalReadCountRawCountTotalReadCount =  Number(totalReadCountTotalRawCount) * Number(totalReadCount);
  const cellEquivalent = ((Number(totalReadCountRawCountTotalReadCount) /Number(readOfLQIC)) * 100).toFixed(0);

    tableRows.at(index).patchValue({ total_cell_equipment: cellEquivalent});
}

///////////////////////////////////////////////////////////////////////////////////
makePDFData() {

  // 데이터 길이 기준으로 폼종류로 분류
  const clonalListsLength = this.clonalLists.length;
  const control = this.tablerowForm.get('tableRows') as FormArray;

  // if ( clonalListsLength === 1) {
    const totalIGHreadDepth = control.at(0).get('total_read_count')?.value;
    const clonalTotalIGHReadDepth = control.at(0).get('total_IGH_read_depth')?.value;
    const clonalCellEquivalent = control.at(0).get('total_cell_equipment')?.value;
   // const ClonalCellSequence = control.at(0).get('sequence1')?.value;


    const vregion1 = control.at(0).get('v_gene1')?.value;
    const jregion1 = control.at(0).get('j_gene1')?.value;
    const length1  = control.at(0).get('sequence_length1')?.value;
    const clonalIGHDepth1  = Number(control.at(0).get('raw_count1')?.value);
    const sequence1 = control.at(0).get('sequence1')?.value;

    if (vregion1.length !== 0 && jregion1.length !== 0) {
      this.putFormWithoutgraph('1',vregion1,jregion1,length1,totalIGHreadDepth,clonalIGHDepth1,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence1);
    }

    const vregion2 = control.at(0).get('v_gene2')?.value;
    const jregion2 = control.at(0).get('j_gene2')?.value;
    const length2  = control.at(0).get('sequence_length2')?.value;
    const clonalIGHDepth2  = Number(control.at(0).get('raw_count2')?.value);
    const sequence2 = control.at(0).get('sequence2')?.value;
    if (vregion2.length !== 0 && jregion2.length !== 0) {
      this.putFormWithoutgraph('2',vregion2,jregion2,length2,totalIGHreadDepth,clonalIGHDepth2,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence2);
    }

    const vregion3 = control.at(0).get('v_gene3')?.value;
    const jregion3 = control.at(0).get('j_gene3')?.value;
    const length3  = control.at(0).get('sequence_length3')?.value;
    const clonalIGHDepth3  = Number(control.at(0).get('raw_count3')?.value);
    const sequence3 = control.at(0).get('sequence3')?.value;
    if (vregion3.length !== 0 && jregion3.length !== 0) {
      this.putFormWithoutgraph('3',vregion3,jregion3,length3,totalIGHreadDepth,clonalIGHDepth3,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence3);
    }

    const vregion4 = control.at(0).get('v_gene4')?.value;
    const jregion4 = control.at(0).get('j_gene4')?.value;
    const length4  = control.at(0).get('sequence_length4')?.value;
    const clonalIGHDepth4  = Number(control.at(0).get('raw_count4')?.value);
    const sequence4 = control.at(0).get('sequence4')?.value;
    if (vregion4.length !== 0 && jregion4.length !== 0) {
      this.putFormWithoutgraph('4',vregion4,jregion4,length4,totalIGHreadDepth,clonalIGHDepth4,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence4);
    }

    const vregion5 = control.at(0).get('v_gene5')?.value;
    const jregion5 = control.at(0).get('j_gene5')?.value;
    const length5  = control.at(0).get('sequence_length5')?.value;
    const sequence5 = control.at(0).get('sequence5')?.value;
    const clonalIGHDepth5  = Number(control.at(0).get('raw_count5')?.value);
    if (vregion5.length !== 0 && jregion5.length !== 0) {
      this.putFormWithoutgraph('5',vregion5,jregion5,length5,totalIGHreadDepth,clonalIGHDepth5,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence5);
    }

    const vregion6 = control.at(0).get('v_gene6')?.value;
    const jregion6 = control.at(0).get('j_gene6')?.value;
    const length6  = control.at(0).get('sequence_length6')?.value;
    const clonalIGHDepth6  = Number(control.at(0).get('raw_count6')?.value);
    const sequence6 = control.at(0).get('sequence6')?.value;
    if (vregion6.length !== 0 && jregion6.length !== 0) {
      this.putFormWithoutgraph('6',vregion6,jregion6,length6,totalIGHreadDepth,clonalIGHDepth6,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence6);
    }

    const vregion7 = control.at(0).get('v_gene7')?.value;
    const jregion7 = control.at(0).get('j_gene7')?.value;
    const length7  = control.at(0).get('sequence_length7')?.value;
    const clonalIGHDepth7  = Number(control.at(0).get('raw_count7')?.value);
    const sequence7 = control.at(0).get('sequence7')?.value;
    if (vregion7.length !== 0 && jregion7.length !== 0) {
      this.putFormWithoutgraph('7',vregion7,jregion7,length7,totalIGHreadDepth,clonalIGHDepth7,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence7);
    }

    const vregion8 = control.at(0).get('v_gene8')?.value;
    const jregion8 = control.at(0).get('j_gene8')?.value;
    const length8  = control.at(0).get('sequence_length8')?.value;
    const clonalIGHDepth8  = Number(control.at(0).get('raw_count8')?.value);
    const sequence8 = control.at(0).get('sequence8')?.value;
    if (vregion8.length !== 0 && jregion8.length !== 0) {
      this.putFormWithoutgraph('8',vregion8,jregion8,length8,totalIGHreadDepth,clonalIGHDepth8,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence8);
    }

    const vregion9 = control.at(0).get('v_gene9')?.value;
    const jregion9 = control.at(0).get('j_gene9')?.value;
    const length9  = control.at(0).get('sequence_length9')?.value;
    const clonalIGHDepth9  = Number(control.at(0).get('raw_count9')?.value);
    const sequence9 = control.at(0).get('sequence9')?.value;
    if (vregion9.length !== 0 && jregion9.length !== 0) {
      this.putFormWithoutgraph('9',vregion9,jregion9,length9,totalIGHreadDepth,clonalIGHDepth9,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence9);
    }

    const vregion10 = control.at(0).get('v_gene10')?.value;
    const jregion10 = control.at(0).get('j_gene10')?.value;
    const length10  = control.at(0).get('sequence_length10')?.value;
    const clonalIGHDepth10  = Number(control.at(0).get('raw_count10')?.value);
    const sequence10 = control.at(0).get('sequence10')?.value;
    if (vregion10.length !== 0 && jregion10.length !== 0) {
      this.putFormWithoutgraph('10',vregion10,jregion10,length10,totalIGHreadDepth,clonalIGHDepth10,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence10);
    }

 // }

}

//////////////////////////////////////////////////////////////////////
// 그래프 데이타
makeGraphclonalTotalIGHReadDepthData(index: number = 0, date: string = '', clonalTotalIGHReadDepthData: string = '' ) {
   this.checkDate[index] = date;
   this.clonalTotalIGHReadDepthData[index]= Number(clonalTotalIGHReadDepthData)/100;
   this.updateGraphData();
   console.log('[1026][날자][데이터]',  this.checkDate, this.clonalTotalIGHReadDepthData);
}

makeGraphclonalTotalNuclelatedCellsData(index: number = 0, date: string = '',   clonalTotalnuclelatedCells: string = '') {
  this.checkDate[index] = date;
  this.clonalTotalnuclelatedCellsData[index] = Number(clonalTotalnuclelatedCells) /100;
  this.updateGraphData();
}

updateGraphData() {
  this.options = {
    color: this.colors,
    legend: {
      data: ['Clonal total IGH read depth', 'Clonal total nuclelated cells']
    },
    xAxis: {
      type: 'category',
      data:  this.checkDate,
    },
    yAxis: [
      {
          type: 'value',

     },
     {
          type: 'value',

        }
    ]

      ,
    series: [
      {
        name: 'Clonal total IGH read depth',
        type: 'line',
        data: this.clonalTotalIGHReadDepthData,
      },
      {
        name: 'Clonal total nuclelated cells',
        type: 'line',
        data: this.clonalTotalnuclelatedCellsData
      }
    ],
  };
}
////////////////////////////////////////////////////////////////////////
increaseClonal() {
    console.log('[칸번호]: ', this.clonalNo);
    if (this.clonalNo >= 3 && this.clonalNo <= 10) {
      if (this.clonalNo !== 10) {
        this.clonalNo++;
      }

      if (this.clonalNo === 10) {
        this.clonalDisplay10 = false;
      } else if (this.clonalNo === 9) {
        this.clonalDisplay9 = false;
      } else if (this.clonalNo === 8) {
        this.clonalDisplay8 = false;
      } else if (this.clonalNo === 7) {
        this.clonalDisplay7 = false;
      } else if (this.clonalNo === 6) {
        this.clonalDisplay6 = false;
      } else if (this.clonalNo === 5) {
        this.clonalDisplay5 = false;
      } else if (this.clonalNo === 4) {
        this.clonalDisplay4 = false;
      }

    }
}

decreaseClonal() {
  if (this.clonalNo <= 10 && this.clonalNo > 3) {
    if (this.clonalNo === 10) {
        this.clonalDisplay10 = true;
    } else if (this.clonalNo === 9) {
      this.clonalDisplay9 = true;
    } else if (this.clonalNo === 8) {
      this.clonalDisplay8 = true;
    } else if (this.clonalNo === 7) {
      this.clonalDisplay7 = true;
    } else if (this.clonalNo === 6) {
      this.clonalDisplay6 = true;
    } else if (this.clonalNo === 5) {
      this.clonalDisplay5 = true;
    } else if (this.clonalNo === 4) {
      this.clonalDisplay4 = true;
    }

    this.clonalNo--;
  }
}

//////////////////////////////////////////////////////////////////////////////
// 저장 하기
saveAllData() {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
   
    // 환자정보 저장
    this.patientInfo.examin = this.examin; // 검사자
    this.patientInfo.recheck = this.recheck; // 확인자
    this.patientInfo.accept_date = this.requestDate; // 의뢰한 날자

    // console.log('[저장][962]', formData);
    this.firstReportDay = this.today2().replace(/-/g, '.'); 
    this.igTcrData = {
        specimenNo: this.patientInfo.specimenNo,
        method: this.patientInfo.reportTitle,
        recheck: this.recheck,
        examin: this.examin,
        sendEMRDate: this.firstReportDay,
        report_date: '',
        comment: this.comment,
        data:  formData
      };
    
      this.service.igtSave(this.igTcrData).subscribe(data => {
        if (data.message === 'OK') {
          alert('저장 했습니다.');
        } else {
          alert('저장 실패.');
        }
      });
  
  }

  screenRead(): void {
    this.patientInfo.screenstatus = '1';
    this.screenstatus = '1';
      this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'1','1000', 'userid').subscribe(data => {
        this.saveAllData();
        alert('저장했습니다.');
      });
     
  }
  
  
  // 판독완료
  screenReadFinish(): void {
    this.patientInfo.screenstatus = '2';   
    this.screenstatus = '2';
    this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'2','2000', 'userid').subscribe(data => {
      this.saveAllData();
      
   });
  }

  reset(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const temp = control.getRawValue();
    this.patientInfo.screenstatus = '1';
    this.screenstatus = '1';
    this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'1','100', 'userid').subscribe(data => {
      alert('변경했습니다.');
   })
  
  }

  //// 스크린판독 ////
getStatus(index: number): boolean {
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
    return false;
  
  }
  

  ///////////////////////////////////////////////////////////////

    // tslint:disable-next-line: typedef
    startToday(): string {
        const oneMonthsAgo = moment().subtract(3, 'months');
    
        const yy = oneMonthsAgo.format('YYYY');
        const mm = oneMonthsAgo.format('MM');
        const dd = oneMonthsAgo.format('DD');
    
        const now1 = yy + '-' + mm + '-' + dd;
    
        return now1;
    }

//////////////////////////////////////////


////////////////////////////////////////////////////////////////////////

}
