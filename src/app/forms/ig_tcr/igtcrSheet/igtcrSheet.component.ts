import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {  concatMap, switchMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IPatient } from 'src/app/home/models/patients';
import { IClonal, IMRDData, INoGraph, ITcrData, IWGraph } from '../igtcr.model';
import { IgtcrService } from '../igtcr.services';
import * as moment from 'moment';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { UtilsService } from '../../commons/utils.service';
import { initalComment, initialTestResult, makeComment } from './commenttype.model';
import {  MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY } from '@angular/material/checkbox';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
 
 

@Component({
  selector: 'app-igtcr-sheet',
  templateUrl: './igtcrSheet.component.html',
  styleUrls: [ './igtcrSheet.component.scss']
})
export class IgTcrSheetComponent implements OnInit {

 
  testCode = '';
  reportID = '';
  bcellLPE555LPE556 = '';
  pcellLPE557 = '';
  mrdBcellLPE555LPE556 = '';
  mrdPcellLPE557 = '';
  mrdnucleatedCells = '';
  densityTablePdf1 = ''; // 400 or 240
  densityTablePdf2 = '';
  firstTotalBcellTcellCount = '';
  secondTotalBcellTcellCount = '';
  geneType = '';
  comment2B =' * Clonal ' + this.geneType +' read depth를 전체' + this.geneType +'read depth로 나눈 값으로 B 세포 중의 클론의 비율을 의미합니다.';
  comment2T = ' * Clonal ' + this.geneType +' read depth를 전체 ' + this.geneType +' read depth로 나눈 값으로 T 세포 중의 클론의 비율을 의미합니다.';
  commentInitial = '';
  commentMRD = '';
  initialAddComment = '';
  mrdAddComment='';
  initialTestResult = '';

  densityTablePdf1CellFEquivalent1 = ''; // 첫번째 검사보고서
  densityTablePdf1CellFEquivalent2 = ''; // 두번째 검사보고서
  comment = '';
  screenstatus = ''; 

  resultStatus = 'Detected';
  // title = '';
  clonalLists: IClonal[] = [];
  deletedClonalLists: IClonal[] =[]; // 클로날 삭제
  mrdData: IMRDData[] =[];
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
    comment: '',
 
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
  clonalTotalIGHReadDepthData: any[] = [];
  clonalTotalnuclelatedCellsData: any[] = [];
  options: any = {};
  colors = ['#5470C6',  '#EE6666'];

  examin = ''; // 검사자
  recheck = ''; // 확인자
  requestDate = ''; // 검사의뢰일
  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일

  acceptDate = ''; // 접수일자
  tableLength = 0;

  /***
   *  LPE555 => IGH CLONALITY REPORT   // IGH MRD REPORT
   *  LPE556 => IGH/IGK CLONALITY REPORT // IGH/IGK MRD REPORT TRG CLONALITY REPORT
   *  LPE557 => TRB CLONALITY REPORT // TRB MRD REPORT TRG MRD REPORT
   */
   pdfFirstTitle = ''; // 첫번째 검사 제목
   pdfMDRTitle = '';   // 두번째 검사 제목
   clonalCountTitle = '';

  igTcrData: ITcrData = {
    specimenNo: this.patientInfo.specimenNo,
    method: this.patientInfo.reportTitle,
    recheck: this.recheck,
    examin: this.examin,
    comment: '',
    sendEMRDate: this.patientInfo.sendEMRDate,
    report_date: this.patientInfo.sendEMRDate,
    init_result1: '',
    init_result2: '',
    init_comment: '',
    fu_result: '',
    fu_comment: '',
    patientid: '',
    detected: this.patientInfo.detected,
    trbtrg: '',
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
        this.reportID = data['id'];
 
      }),
      switchMap(data => of(data['id'])),
      tap(data => {
        this.patientInfo = this.service.patientLists[data];
          
          
        if (this.patientInfo.test_code === 'LPE555') {
          this.geneType = 'IGH';
        } else if(this.patientInfo.test_code === 'LPE556') {
          this.geneType = '';
        } else if(this.patientInfo.test_code === 'LPE557') {
          this.patientInfo.reportTitle = 'TRB/TRG Gene Rearrangement Analysis [NGS]';
          if (this.testCode === 'TRB') {
            this.geneType = 'TRB';
          } else if (this.testCode == 'TRG') {
            this.geneType = 'TRG';
        }

        }
        // 판독자 , 검사자
        if (this.patientInfo.examin?.length) {
            this.examin = this.patientInfo.examin;
        }

        if (this.patientInfo.recheck?.length) {
                this.recheck = this.patientInfo.recheck;
        }

            // 검체 감염유부 확인
        if (parseInt(this.patientInfo.detected, 10) === 0) {
          this.resultStatus = 'Detected';
        } else if (parseInt(this.patientInfo.detected, 10) === 1) {
          this.resultStatus = 'Not Detected';
        }    

        this.requestDate = this.patientInfo.accept_date;   
        if (this.patientInfo.sendEMRDate !== undefined || this.patientInfo.sendEMRDate !== null) {
          this.firstReportDay = this.patientInfo.sendEMRDate;
          this.lastReportDay = this.patientInfo.sendEMRDate;
        }
        this.screenstatus = this.patientInfo.screenstatus;
        this.comment = this.patientInfo.comment;
        this.acceptDate = this.patientInfo.accept_date.replace(/\./g,'-');

        // pdf 제목
        if (this.patientInfo.test_code === 'LPE555') {
          this.pdfFirstTitle = 'IGH CLONALITY REPORT'; // 첫번째 검사 제목
          this.pdfMDRTitle = 'IGH MRD REPORT';   // 두번째 검사 제목
        } else if (this.patientInfo.test_code === 'LPE556') {
          this.pdfFirstTitle = 'IGH/IGK CLONALITY REPORT';
          this.pdfMDRTitle = 'IGH/IGK MRD REPORT';
        }  else if (this.patientInfo.test_code === 'LPE557') {
          this.pdfFirstTitle = 'TRB/TRG CLONALITY REPORT';
          this.pdfMDRTitle = 'TRB/TRG MRD REPORT';
        }
         
      }),
      concatMap(() => {
         if(this.testCode === 'TRB'  ) {
           return this.service.igtcrListTrbTrg(this.patientInfo.specimenNo, 'TRB');
         } else if(this.testCode === 'TRG') {
          return this.service.igtcrListTrbTrg(this.patientInfo.specimenNo, 'TRG');
         } else {
          return this.service.igtcrListInfo(this.patientInfo.specimenNo)
         }
         
      }),
      tap(data => this.clonalLists = data)
    )
    .subscribe(data => {
     
      if (this.clonalLists.length) {
        this.clonalLists.forEach((item, index) => {
          if (index === 0) {
            if (item.gene.length) {
              this.geneType = item.gene;
            }
          }
          this.addRow(item);
          this.clonalTotalIGHReadDepth(index);
          this.clonalTotalNuclelatedCell(index);
          this.totalCellEquivalent(index);
        });
        
        console.log('[270] ==>',this.patientInfo,this.patientInfo.init_result1.length, this.geneType);
        if (this.patientInfo.init_result1.length) {
          this.initialTestResult = this.patientInfo.init_result1;
          this.initialAddComment = this.patientInfo.init_result2;
          this.mrdAddComment = this.patientInfo.fu_result;
          this.commentInitial = this.patientInfo.init_comment;
          this.commentMRD = this.patientInfo.fu_comment;
          
 
        } else {
         // this.btCells();         
        }
        this.btCells();
      }
     
    });
    
    this.utilsService.getListsDig('IGTCR')
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
          ClonalCellSequence:string,
          PercentTotalReads: string
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
          ClonalCellSequence: ClonalCellSequence.substring(0,15),
          PercentTotalReads
        });

 }

////////////////////////////////////////////
 btCells() {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  if (tableRows.length === 1) {
    const totalIGHReadDepth = tableRows.at(0).get('total_IGH_read_depth')?.value;
    
    this.firstTotalBcellTcellCount = tableRows.at(0).get('total_Bcell_Tcell_count')?.value;

 
    if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE556') {
      this.bcellLPE555LPE556 = totalIGHReadDepth;
    } else if(this.patientInfo.test_code === 'LPE557') {
      this.pcellLPE557 = totalIGHReadDepth;
    }
   
    this.clonalCounts(); // 클론갯수 구하기
   
    this.initialTestResult = initialTestResult(this.geneType, this.clonalCountTitle);

  } else if (tableRows.length > 1){
  
    this.getCheckboxMax();
     
  }

 }



  createPdf() {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    if(control.length === 0) {
      alert("데이터가 없어 사용할수 없습니다.");
      return;
    }
    this.screenstatus = '3';
    this.patientInfo.screenstatus = '3';
    this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'3','3000', 'userid').subscribe(data => {
     // this.saveAllData();
    });
 
    
    this.pdfFirstTitle = this.geneType.toUpperCase() + ' CLONALITY REPORT';
    this.pdfMDRTitle = this.geneType.toUpperCase() + ' MRD REPORT';
 
   
    const tableRows = this.tablerowForm.get('tableRows') as FormArray;
    if (tableRows.length === 1 ) {
      const totalIGHReadDepth = tableRows.at(0).get('total_IGH_read_depth')?.value;
      this.densityTablePdf1 = tableRows.at(0).get('density')?.value;
      this.firstTotalBcellTcellCount = tableRows.at(0).get('total_Bcell_Tcell_count')?.value;

      if(this.densityTablePdf1 === '240') {
        this.densityTablePdf1CellFEquivalent1 = '36,923';
      } else {
        this.densityTablePdf1CellFEquivalent1 = '61,538';
      }
      if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE556') {
        this.bcellLPE555LPE556 = totalIGHReadDepth;
      } else if(this.patientInfo.test_code === 'LPE557') {
        this.pcellLPE557 = totalIGHReadDepth;
      }
      
      this.clonalCounts();
      console.log(';');

    } else if (tableRows.length > 1){
      let indexNo = -1;
      let totalIGHReadDepth = '';
      const tableValues= tableRows.getRawValue();
      tableValues.forEach((item, index) => {
    
        const useYN1 = tableRows.at(index).get('use_yn1')?.value;
        if (useYN1 === false && indexNo === -1) {
          indexNo = index;
          totalIGHReadDepth = tableRows.at(index).get('total_IGH_read_depth')?.value;
          this.mrdnucleatedCells = tableRows.at(index).get('total_nucelated_cells')?.value;
          this.secondTotalBcellTcellCount = tableRows.at(index).get('total_Bcell_Tcell_count')?.value;
          this.densityTablePdf2 = tableRows.at(index).get('density')?.value;
          this.secondTotalBcellTcellCount = tableRows.at(index).get('total_Bcell_Tcell_count')?.value;
    
          if(this.densityTablePdf2 === '240') {
            this.densityTablePdf1CellFEquivalent2= '36,923';
           } else {
             this.densityTablePdf1CellFEquivalent2 = '61,538';
           }

          if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE556') {
            this.mrdBcellLPE555LPE556 = totalIGHReadDepth;
          } else if(this.patientInfo.test_code === 'LPE557') {
            this.mrdPcellLPE557 = totalIGHReadDepth;
          }
        }
    
      });

      this.makeMRDData();
    }

    this.getAllData();
    setTimeout(() => {
      this.createPdf2();
    }, 2000);

    this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'3','3000', 'userid').subscribe(data => {
      
   });
  }

  clonalCounts() {
          this.makePDFData();
          // 클론갯수 구하기
          const clonalCount = this.formWithoutgraph.length;
          if (clonalCount === 1) {
              this.clonalCountTitle = '한';
          } else if (clonalCount === 2) {
            this.clonalCountTitle = '두';
          } else if (clonalCount === 3) {
            this.clonalCountTitle = '세';
          } else if (clonalCount === 4) {
            this.clonalCountTitle = '네';
          } else if (clonalCount === 5) {
            this.clonalCountTitle = '다섯';
          } else if (clonalCount === 6) {
            this.clonalCountTitle = '여섯';
          } else if (clonalCount === 7) {
            this.clonalCountTitle = '일곱';
          } else if (clonalCount === 8) {
            this.clonalCountTitle = '여덜';
          } else if (clonalCount === 9) {
            this.clonalCountTitle = '아홉';
          } else if (clonalCount === 10) {
            this.clonalCountTitle = '열';
          }
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
      if (tableRows.length === 1) { // 첫번찌
        if (this.patientInfo.test_code === 'LPE555') {
          filename = 'IGH_CLONALITY_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
        } else if(this.patientInfo.test_code === 'LPE556') {
          filename = 'IGH_IGK_CLONALITY_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
        } else if(this.patientInfo.test_code === 'LPE557') {
          if (this.testCode === 'TRB') {
            filename = 'TRB_CLONALITY_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
          } else  {
            filename = 'TRG_CLONALITY_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
          }
        }
      } else {  // 두번째
        if (this.patientInfo.test_code === 'LPE555') {
          filename = 'IGH_MRD_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
        } else if(this.patientInfo.test_code === 'LPE556') {
          filename = 'IGH_IGK_MRD_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
        } else if(this.patientInfo.test_code === 'LPE557') {
          if (this.testCode === 'TRB') {
            filename = 'TRB_MRD_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
          } else   {
            filename = 'TRG_MRD_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
          }
        }
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
  console.log('[564][createRow]', item, item.gene);
  if (item.raw_count4 || item.sequence4 || item.sequence_length4 || item.v_gene4 || item.j_gene4) {
    this.clonalNo = 4;
    this.clonalDisplay4 = false;
  } 
  if(item.raw_count5 || item.sequence5 || item.sequence_length5 || item.v_gene5 || item.j_gene5) {
    this.clonalNo = 5;
    this.clonalDisplay5 = false;
  }
   if(item.raw_count6 || item.sequence6 || item.sequence_length6 || item.v_gene6 || item.j_gene6) {
    this.clonalNo = 6;
    this.clonalDisplay6 = false;
  }
   if(item.raw_count7 || item.sequence7 || item.sequence_length7 || item.v_gene7 || item.j_gene7) {
    this.clonalNo = 7;
    this.clonalDisplay7 = false;
  }

  if(item.raw_count8 || item.sequence8 || item.sequence_length8 || item.v_gene8 || item.j_gene8) {
    this.clonalNo = 8;
    this.clonalDisplay8 = false;
  }


  return this.fb.group({
    IGHV_mutation : [item.IGHV_mutation],
    bigo : [item.bigo],
    use_yn1: [item.use_yn1.toString() === "true"? true: false],
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
    percent_total_reads1: [item.percent_total_reads1 ],
    percent_total_reads2: [item.percent_total_reads2 ],
    percent_total_reads3: [item.percent_total_reads3 ],
    percent_total_reads4: [item.percent_total_reads4 ],
    percent_total_reads5: [item.percent_total_reads5 ],
    percent_total_reads6: [item.percent_total_reads6 ],
    percent_total_reads7: [item.percent_total_reads7 ],
    percent_total_reads8: [item.percent_total_reads8 ],
    percent_total_reads9: [item.percent_total_reads9 ],
    percent_total_reads10: [item.percent_total_reads10 ],
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
    density: [item.density],
    deleted: [item.deleted]
  });
}

makeNewRow(): FormGroup  {
  
  return this.fb.group({
    IGHV_mutation : [''],
    bigo : [''],
    use_yn1: [false],
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
    report_date: [this.tableLength ? this.startToday() : this.acceptDate],
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
    density: ['400'],
    deleted: ['n']
  });
}


addNewRow(): void {

  const control = this.tablerowForm.get('tableRows') as FormArray;
  this.tableLength = control.length;
  control.insert(0, this.makeNewRow());
  if (control.length === 1) {
    this.initialTestResult = initialTestResult(this.geneType, '');
  } else {
    this.initialTestResult = initialTestResult(this.geneType, this.clonalCountTitle);
  }
  
  // control.push(this.makeNewRow());
}

addRow(item: IClonal): void {
  const control = this.tablerowForm.get('tableRows') as FormArray; 
  control.push(this.createRow(item));
}

removeTableRow(i: number): void {
  this.formControls().at(i).patchValue({ deleted: 'y' });
  this.deletedClonalLists.push(this.formControls().at(i).value); 
  this.formControls().removeAt(i);

  if (this.formControls.length === 0) {
     this.pcellLPE557 = '';
     this.bcellLPE555LPE556 = '';
     this.initialTestResult = '';
   }
}


formControls(): FormArray {
  const control = this.tablerowForm.get('tableRows') as FormArray;
  return control;
}

get getFormControls(): FormArray {
  const control = this.tablerowForm.get('tableRows') as FormArray;
  const val = control.getRawValue();
   
  return control;
}
//////////////////////////////////////////////////////////////////////////
existComma( checkData: string): string {
  let resultValue = '';
  if (checkData !== null) {
    const exist = checkData.indexOf(',');
    if (exist !== -1) {
      resultValue = checkData.replace(/,/g, '');
    } else {
      resultValue = checkData;
    }
    return resultValue;
  }
  return;

}

/////////////////  각종 식  /////////////////////////////////////////////////////////////
// TotalReadCount 값 변경시 percent % total reads1-10 = Raw count1-10 / Total read count
// % of LQIC 에 값 넣음
totalReadCount(index: number, totalReadCountwComma: string): void {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const readOfLQICwComma = tableRows.at(index).get('read_of_LQIC')?.value;

  const totalReadCount = this.existComma(totalReadCountwComma);
  const readOfLQIC = Number(this.existComma(readOfLQICwComma));

   this.percentOfLQIC(index, parseInt(totalReadCount), readOfLQIC);  // 3번 & of LQIC
   this.totalBcellTcellCount(index, parseInt(totalReadCount), readOfLQIC); // 4번 Total B-Cell T-Cell count

   // 7번
   const rawCount1 = Number(this.existComma(tableRows.at(index).get('raw_count1')?.value));
   if (rawCount1 !== 0 && rawCount1 !== null && rawCount1 !== undefined &&  String(rawCount1).length !== 0) {
     this.percentTotalReads(index, rawCount1, Number(totalReadCount), 1);
   }

   const rawCount2 = Number(this.existComma(tableRows.at(index).get('raw_count2')?.value));
   if (rawCount2 !== 0 && rawCount2 !== null && rawCount2 !== undefined &&  String(rawCount2).length !== 0) {
     this.percentTotalReads(index, rawCount2, Number(totalReadCount), 2);
   }

   const rawCount3 = Number(this.existComma(tableRows.at(index).get('raw_count3')?.value));
   if (rawCount3 !== 0 && rawCount3 !== null && rawCount3 !== undefined &&  String(rawCount3).length !== 0) {
     this.percentTotalReads(index, rawCount3, Number(totalReadCount), 3);
   }

   const rawCount4 = Number(this.existComma(tableRows.at(index).get('raw_count4')?.value));
   if (rawCount4 !== 0 && rawCount4 !== null && rawCount4 !== undefined &&  String(rawCount4).length !== 0) {
     this.percentTotalReads(index, rawCount4, Number(totalReadCount), 4);
   }

   const rawCount5 = Number(this.existComma(tableRows.at(index).get('raw_count5')?.value));
   if (rawCount5 !== 0 && rawCount5 !== null && rawCount5 !== undefined &&  String(rawCount5).length !== 0) {
     this.percentTotalReads(index, rawCount5, Number(totalReadCount), 5);
   }

   const rawCount6 = Number(this.existComma(tableRows.at(index).get('raw_count6')?.value));
   if (rawCount6 !== 0 && rawCount6 !== null && rawCount6 !== undefined &&  String(rawCount6).length !== 0) {
     this.percentTotalReads(index, rawCount6, Number(totalReadCount), 6);
   }

   const rawCount7 = Number(this.existComma(tableRows.at(index).get('raw_count7')?.value));
   if (rawCount7 !== 0 && rawCount7 !== null && rawCount7 !== undefined &&  String(rawCount7).length !== 0) {
     this.percentTotalReads(index, rawCount7, Number(totalReadCount), 7);
   }

   const rawCount8 = Number(this.existComma(tableRows.at(index).get('raw_count8')?.value));
   if (rawCount8 !== 0 && rawCount8 !== null && rawCount8 !== undefined &&  String(rawCount8).length !== 0) {
     this.percentTotalReads(index, rawCount8, Number(totalReadCount), 8);
   }

   const rawCount9 = Number(this.existComma(tableRows.at(index).get('raw_count9')?.value));
   if (rawCount9 !== 0 && rawCount9 !== null && rawCount9 !== undefined &&  String(rawCount9).length !== 0) {
     this.percentTotalReads(index, rawCount9, Number(totalReadCount), 9);
   }

   const rawCount10 = Number(this.existComma(tableRows.at(index).get('raw_count10')?.value));
   if (rawCount10 !== 0 && rawCount10 !== null && rawCount10 !== undefined &&  String(rawCount10).length !== 0) {
     this.percentTotalReads(index, rawCount10, Number(totalReadCount), 10);
   }

}


// Read of LQIC 값 변경시
// Total B-Cell/T-Cell count 에 값 넣음
readOfLQIC(index: number, readOfLQICwComma: string): void {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCountwComma = tableRows.at(index).get('total_read_count')?.value;

  const totalReadCount = Number(this.existComma(totalReadCountwComma));
  const readOfLQIC = this.existComma(readOfLQICwComma);

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

// update clonal rowCount
upDateColnalCount() {
  if(this.getFormControls.length === 1) {
    this.clonalCounts();
    this.initialTestResult = initialTestResult(this.geneType, this.clonalCountTitle);
    
  }
}

// Raw count1 변경시  percent % total reads1 = Raw count1 / Total read count
// % total reads 1 - 10 에 값 넣음
rawCount1(index: number , rawcount1wComma: string) {
  
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount1 = this.existComma(rawcount1wComma);
  this.percentTotalReads(index, parseInt(rawcount1), totalReadCount, 1);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }

}

rawCount2(index: number , rawcount2wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount2 = this.existComma(rawcount2wComma);
  this.percentTotalReads(index, parseInt(rawcount2), totalReadCount, 2);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount3(index: number , rawcount3wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount3 = this.existComma(rawcount3wComma);
  this.percentTotalReads(index, parseInt(rawcount3), totalReadCount, 3);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount4(index: number , rawcount4wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount4 = this.existComma(rawcount4wComma);
  this.percentTotalReads(index, parseInt(rawcount4), totalReadCount, 4);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount5(index: number , rawcount5wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount5 = this.existComma(rawcount5wComma);
  this.percentTotalReads(index, parseInt(rawcount5), totalReadCount, 5);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount6(index: number , rawcount6wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  // const totalReadCount =  tableRows.at(index).get('total_read_count')?.value;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount6 = this.existComma(rawcount6wComma);
  this.percentTotalReads(index, parseInt(rawcount6), totalReadCount, 6);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount7(index: number , rawcount7wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount7 = this.existComma(rawcount7wComma);
  this.percentTotalReads(index, parseInt(rawcount7), totalReadCount, 7);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount8(index: number , rawcount8wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount8 = this.existComma(rawcount8wComma);
  this.percentTotalReads(index, parseInt(rawcount8), totalReadCount, 8);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount9(index: number , rawcount9wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount9 = this.existComma(rawcount9wComma);
  this.percentTotalReads(index, parseInt(rawcount9), totalReadCount, 9);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}

rawCount10(index: number , rawcount10wComma: string) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  Number(this.existComma(tableRows.at(index).get('total_read_count')?.value));
  const rawcount10 = this.existComma(rawcount10wComma);
  this.percentTotalReads(index, parseInt(rawcount10), totalReadCount, 10);
  this.clonalTotalIGHReadDepth(index); // 9번
  this.clonalTotalNuclelatedCell(index);
  this.totalCellEquivalent(index);

  if (tableRows.length === 1) {
    this.upDateColnalCount();
  }
}


percentTotalReads(index: number, rawCount: number, totalReadCount:number , clonalNo: number) {
        const tableRows = this.tablerowForm.get('tableRows') as FormArray;
        const newPercentTotalReads =   ((rawCount/totalReadCount)* 100).toFixed(2);
       const newPercentOfLQIC = tableRows.at(index).get('percent_of_LQIC')?.value;
       console.log('[1077][percentTotalReads] ',rawCount,totalReadCount,newPercentTotalReads);

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

        const totalReadCount  =  this.existComma(tableRows.at(index).get('total_read_count')?.value); // total read count
        const readOfLQIC  =  this.existComma(tableRows.at(index).get('read_of_LQIC')?.value); // read of LQIC
       

        if (clonalNo === 1) {
          const rawCount1 =  this.existComma(tableRows.at(index).get('raw_count1')?.value);

         
          if (Number.isNaN(parseInt(rawCount1))) {
            tableRows.at(index).patchValue({ cell_equipment1:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment1: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount1))});
          }
        } else if (clonalNo === 2) {
          const rawCount2 =  this.existComma(tableRows.at(index).get('raw_count2')?.value);
          
          if (Number.isNaN(parseInt(rawCount2))) {
            tableRows.at(index).patchValue({ cell_equipment2:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment2: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount2))});
          }          
        }  else if (clonalNo === 3) {
          const rawCount3 =  this.existComma(tableRows.at(index).get('raw_count3')?.value);
         
          if (Number.isNaN(parseInt(rawCount3))) {
            tableRows.at(index).patchValue({ cell_equipment3:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment3: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount3))});
          }
        } else if (clonalNo === 4) {
          const rawCount4 =  this.existComma(tableRows.at(index).get('raw_count4')?.value);
          
          if (Number.isNaN(parseInt(rawCount4))) {
            tableRows.at(index).patchValue({ cell_equipment4:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment4: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount4))});
          }         
        } else if (clonalNo === 5) {
          const rawCount5 =  this.existComma(tableRows.at(index).get('raw_count5')?.value);
          
          if (Number.isNaN(parseInt(rawCount5))) {
            tableRows.at(index).patchValue({ cell_equipment5:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment5: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount5))});
          }
        } else if (clonalNo === 6) {
          const rawCount6 =  (tableRows.at(index).get('raw_count6')?.value);
           
          if (Number.isNaN(parseInt(rawCount6))) {
            tableRows.at(index).patchValue({ cell_equipment6:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment6: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount6))});
          }

        } else if (clonalNo === 7) {
          const rawCount7 =  (tableRows.at(index).get('raw_count7')?.value);
          
          if (Number.isNaN(parseInt(rawCount7))) {
            tableRows.at(index).patchValue({ cell_equipment7:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment7: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount7))});
          }
        } else if (clonalNo === 8) {
          const rawCount8 =  tableRows.at(index).get('raw_count8')?.value;
          
          if (Number.isNaN(parseInt(rawCount8))) {
            tableRows.at(index).patchValue({ cell_equipment8:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment8: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount8))});
          }
        } else if (clonalNo === 9) {
          const rawCount9 =  this.existComma(tableRows.at(index).get('raw_count9')?.value);
          
          if (Number.isNaN(parseInt(rawCount9))) {
            tableRows.at(index).patchValue({ cell_equipment9:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment9: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount9))});
          }
        } else if (clonalNo === 10) {
          const rawCount10 =  this.existComma(tableRows.at(index).get('raw_count10')?.value);
           
          if (Number.isNaN(parseInt(rawCount10))) {
            tableRows.at(index).patchValue({ cell_equipment10:0});
          } else {
            tableRows.at(index).patchValue({ cell_equipment10: this.calulateCellEquivalent(Number(totalReadCount),Number(readOfLQIC), Number(rawCount10))});
          }
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

  // 
  
  if (Number.isNaN(parseInt(clonalTotalIGHReadDepth))) {
    tableRows.at(index).patchValue({ total_IGH_read_depth:  0});
  } else {
    tableRows.at(index).patchValue({ total_IGH_read_depth: clonalTotalIGHReadDepth});
  }

    // LPE555 LPE556 B-Cells
  // LPE557 P-Cells
  if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE555') {
    this.bcellLPE555LPE556 = clonalTotalIGHReadDepth;
  } else if(this.patientInfo.test_code === 'LPE557') {
    this.pcellLPE557 = clonalTotalIGHReadDepth;
  }

 
}

getClonalTotalIGHReadDepth(index: number): string {
    const tableRows = this.tablerowForm.get('tableRows') as FormArray;
    const totalReadCount  =  this.existComma(tableRows.at(index).get('total_read_count')?.value);
    let rawCount1 =  this.existComma(tableRows.at(index).get('raw_count1')?.value);
    let rawCount2 =  this.existComma(tableRows.at(index).get('raw_count2')?.value);
    let rawCount3 =  this.existComma(tableRows.at(index).get('raw_count3')?.value);
    let rawCount4 =  this.existComma(tableRows.at(index).get('raw_count4')?.value);
    let rawCount5 =  this.existComma(tableRows.at(index).get('raw_count5')?.value);
    let rawCount6 =  this.existComma(tableRows.at(index).get('raw_count6')?.value);
    let rawCount7 =  this.existComma(tableRows.at(index).get('raw_count7')?.value);
    let rawCount8 =  this.existComma(tableRows.at(index).get('raw_count8')?.value);
    let rawCount9 =  this.existComma(tableRows.at(index).get('raw_count9')?.value);
    let rawCount10 = this.existComma(tableRows.at(index).get('raw_count10')?.value);

    if (Number.isNaN(parseInt(rawCount1))) {   rawCount1 = '0'; }
    if (Number.isNaN(parseInt(rawCount2))) {  rawCount2 = '0';  }
    if (Number.isNaN(parseInt(rawCount3))) {  rawCount3 = '0';  }
    if (Number.isNaN(parseInt(rawCount4))) {  rawCount4 = '0';  }
    if (Number.isNaN(parseInt(rawCount5))) {  rawCount5 = '0';  }
    if (Number.isNaN(parseInt(rawCount6))) {  rawCount6 = '0';  }
    if (Number.isNaN(parseInt(rawCount7))) {  rawCount7 = '0';  }
    if (Number.isNaN(parseInt(rawCount8))) {  rawCount8 = '0';  }
    if (Number.isNaN(parseInt(rawCount9))) {   rawCount9 = '0'; }
    if (Number.isNaN(parseInt(rawCount10))) { rawCount10 = '0'; }

    const totalRawCount =(Number(rawCount1) + Number(rawCount2) + Number(rawCount3) + Number(rawCount4) + Number(rawCount5) +
       Number(rawCount6) + Number(rawCount7) + Number(rawCount8) + Number(rawCount9) + Number(rawCount10));
       const totalIGH = (totalRawCount / Number(totalReadCount)* 100).toFixed(2);
    return totalIGH;
}

// Clonal/ total nuclelated cells %
clonalTotalNuclelatedCell(index: number) {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const reportDate = tableRows.at(index).get('report_date')?.value;
  const clonalTotalNuclelatedCell = this.getClonalTotalNuclelatedCell(index);
  
 // tableRows.at(index).patchValue({ total_nucelated_cells: clonalTotalNuclelatedCell});
 if (Number.isNaN(parseInt(clonalTotalNuclelatedCell))) {
  tableRows.at(index).patchValue({ total_nucelated_cells: 0});
} else {
  tableRows.at(index).patchValue({ total_nucelated_cells: clonalTotalNuclelatedCell});
}
   
}

getClonalTotalNuclelatedCell(index: number): string {
  let totalReadCountReadOfLQIC = 0;
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const totalReadCount =  this.existComma(tableRows.at(index).get('total_read_count')?.value); // total read count
  const readOfLQIC =  this.existComma(tableRows.at(index).get('read_of_LQIC')?.value); // read of LQIC
 
  const density = tableRows.at(index).get('density')?.value;

  if (density === '400') {
    totalReadCountReadOfLQIC = ((Number(totalReadCount)/Number(readOfLQIC)) / 61539) * 100;
  } else  if(density === '240') {
    totalReadCountReadOfLQIC = ((Number(totalReadCount)/Number(readOfLQIC)) / 36923) * 100;
  }

  
  const totalRawCount = this.totalRawCount(index)
  const clonalTotalIGHReadDepth =  (totalRawCount / Number(totalReadCount))* 100;
  const clonalTotalNuclatedCell = (Number(totalReadCountReadOfLQIC) * Number(clonalTotalIGHReadDepth)).toFixed(4);
  return clonalTotalNuclatedCell;
}

totalRawCount(index: number): number {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  let rawCount1 = this.existComma(tableRows.at(index).get('raw_count1')?.value);
  let rawCount2 = this.existComma(tableRows.at(index).get('raw_count2')?.value);
  let rawCount3 = this.existComma(tableRows.at(index).get('raw_count3')?.value);
  let rawCount4 = this.existComma(tableRows.at(index).get('raw_count4')?.value);
  let rawCount5 = this.existComma(tableRows.at(index).get('raw_count5')?.value);
  let rawCount6 = this.existComma(tableRows.at(index).get('raw_count6')?.value);
  let rawCount7 = this.existComma(tableRows.at(index).get('raw_count7')?.value);
  let rawCount8 = this.existComma(tableRows.at(index).get('raw_count8')?.value);
  let rawCount9 = this.existComma(tableRows.at(index).get('raw_count9')?.value);
  let rawCount10 = this.existComma(tableRows.at(index).get('raw_count10')?.value);

  if (Number.isNaN(parseInt(rawCount1))) {   rawCount1 = '0'; }
  if (Number.isNaN(parseInt(rawCount2))) {  rawCount2 = '0';  }
  if (Number.isNaN(parseInt(rawCount3))) {  rawCount3 = '0';  }
  if (Number.isNaN(parseInt(rawCount4))) {  rawCount4 = '0';  }
  if (Number.isNaN(parseInt(rawCount5))) {  rawCount5 = '0';  }
  if (Number.isNaN(parseInt(rawCount6))) {  rawCount6 = '0';  }
  if (Number.isNaN(parseInt(rawCount7))) {  rawCount7 = '0';  }
  if (Number.isNaN(parseInt(rawCount8))) {  rawCount8 = '0';  }
  if (Number.isNaN(parseInt(rawCount9))) {   rawCount9 = '0'; }
  if (Number.isNaN(parseInt(rawCount10))) { rawCount10 = '0'; }

  const totalRawCount =(Number(rawCount1) + Number(rawCount2) + Number(rawCount3) + Number(rawCount4) + Number(rawCount5) +
     Number(rawCount6) + Number(rawCount7) + Number(rawCount8) + Number(rawCount9) + Number(rawCount10));

  return totalRawCount;
}


totalCellEquivalent(index: number) {
  // 공식(rawCount sum / total_read_count) / (read_of_LQIC / total_read_count) * 100
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
   
  const totalReadCount =  this.existComma(tableRows.at(index).get('total_read_count')?.value); // total read count
  const readOfLQIC =  this.existComma(tableRows.at(index).get('read_of_LQIC')?.value); // read of LQIC 
  const totalRawCount = this.totalRawCount(index);

  const totalReadCountTotalRawCount = (totalRawCount/Number(totalReadCount));

  // 분수의 역수를 곱한다.
  const totalReadCountRawCountTotalReadCount =  Number(totalReadCountTotalRawCount) * Number(totalReadCount);
  const cellEquivalent = ((Number(totalReadCountRawCountTotalReadCount) /Number(readOfLQIC)) * 100).toFixed(0);

    if (Number.isNaN(parseInt(cellEquivalent))) {
      tableRows.at(index).patchValue({ total_cell_equipment: 0});
    } else {
      tableRows.at(index).patchValue({ total_cell_equipment: cellEquivalent});
    }
    
}


///////////////////////////////////////////////////////////////////////////////////
makePDFData() {
  /// 초기화
  this.formWithoutgraph = [];
  // 데이터 길이 기준으로 폼종류로 분류
  const clonalListsLength = this.clonalLists.length;
  const control = this.tablerowForm.get('tableRows') as FormArray;

  
    const totalIGHreadDepth = this.existComma(control.at(0).get('total_read_count')?.value);
    const clonalTotalIGHReadDepth = control.at(0).get('total_IGH_read_depth')?.value;
    const clonalCellEquivalent = control.at(0).get('total_cell_equipment')?.value;
   

    const vregion1 = control.at(0).get('v_gene1')?.value ? control.at(0).get('v_gene1')?.value : "";
    const jregion1 = control.at(0).get('j_gene1')?.value ? control.at(0).get('j_gene1')?.value : "";
    const rowcount1 = control.at(0).get('raw_count1')?.value ? control.at(0).get('raw_count1')?.value : "";
    const length1  = control.at(0).get('sequence_length1')?.value;
    const clonalIGHDepth1  = Number(control.at(0).get('raw_count1')?.value);
    const sequence1 = control.at(0).get('sequence1')?.value;
    const percentTotalReads1 = control.at(0).get('percent_total_reads1')?.value;
    const percentTotalReads2 = control.at(0).get('percent_total_reads2')?.value;
    const percentTotalReads3 = control.at(0).get('percent_total_reads3')?.value;
    const percentTotalReads4 = control.at(0).get('percent_total_reads4')?.value;
    const percentTotalReads5 = control.at(0).get('percent_total_reads5')?.value;
    const percentTotalReads6 = control.at(0).get('percent_total_reads6')?.value;
    const percentTotalReads7 = control.at(0).get('percent_total_reads7')?.value;
    const percentTotalReads8 = control.at(0).get('percent_total_reads8')?.value;
    const percentTotalReads9 = control.at(0).get('percent_total_reads9')?.value;
    const percentTotalReads10 = control.at(0).get('percent_total_reads10')?.value;

  

    if (vregion1.length !== 0 || jregion1.length !== 0 || rowcount1 !== 0) {
      this.putFormWithoutgraph('1',vregion1,jregion1,length1,totalIGHreadDepth,clonalIGHDepth1,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence1,percentTotalReads1);
    }

    const vregion2 = control.at(0).get('v_gene2')?.value ? control.at(0).get('v_gene2')?.value : "";
    const jregion2 = control.at(0).get('j_gene2')?.value ? control.at(0).get('j_gene2')?.value : "";
    const rowcount2 = control.at(0).get('raw_count2')?.value ? control.at(0).get('raw_count2')?.value : "";
    const length2  = control.at(0).get('sequence_length2')?.value;
    const clonalIGHDepth2  = Number(control.at(0).get('raw_count2')?.value);
    const sequence2 = control.at(0).get('sequence2')?.value;
    if (vregion2.length !== 0 || jregion2.length !== 0 || rowcount2.length !== 0) {
      this.putFormWithoutgraph('2',vregion2,jregion2,length2,totalIGHreadDepth,clonalIGHDepth2,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence2,percentTotalReads2);
    }

    const vregion3 = control.at(0).get('v_gene3')?.value ? control.at(0).get('v_gene3')?.value : "";
    const jregion3 = control.at(0).get('j_gene3')?.value ? control.at(0).get('j_gene3')?.value : "";
    const rowcount3 = control.at(0).get('raw_count3')?.value ? control.at(0).get('raw_count3')?.value : "";
    const length3  = control.at(0).get('sequence_length3')?.value;
    const clonalIGHDepth3  = Number(control.at(0).get('raw_count3')?.value);
    const sequence3 = control.at(0).get('sequence3')?.value;
    if (vregion3.length !== 0 || jregion3.length !== 0 || rowcount3.length !== 0) {
      this.putFormWithoutgraph('3',vregion3,jregion3,length3,totalIGHreadDepth,clonalIGHDepth3,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence3,percentTotalReads3);
    }

    const vregion4 = control.at(0).get('v_gene4')?.value ? control.at(0).get('v_gene4')?.value : "";
    const jregion4 = control.at(0).get('j_gene4')?.value ? control.at(0).get('j_gene4')?.value : "";
    const rowcount4 = control.at(0).get('raw_count4')?.value ? control.at(0).get('raw_count4')?.value : "";
    const length4  = control.at(0).get('sequence_length4')?.value;
    const clonalIGHDepth4  = Number(control.at(0).get('raw_count4')?.value);
    const sequence4 = control.at(0).get('sequence4')?.value;
     
    if (vregion4.length !== 0 || jregion4.length !== 0 || rowcount4.length !== 0) {
      this.putFormWithoutgraph('4',vregion4,jregion4,length4,totalIGHreadDepth,clonalIGHDepth4,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence4,percentTotalReads4);
    }

    const vregion5 = control.at(0).get('v_gene5')?.value ? control.at(0).get('v_gene5')?.value : "";
    const jregion5 = control.at(0).get('j_gene5')?.value ? control.at(0).get('j_gene5')?.value : "";
    const rowcount5 = control.at(0).get('raw_count5')?.value ? control.at(0).get('raw_count5')?.value : "";
    const length5  = control.at(0).get('sequence_length5')?.value;
    const sequence5 = control.at(0).get('sequence5')?.value;
    const clonalIGHDepth5  = Number(control.at(0).get('raw_count5')?.value);
    if (vregion5.length !== 0 || jregion5.length !== 0 || rowcount5.length !== 0) {
      this.putFormWithoutgraph('5',vregion5,jregion5,length5,totalIGHreadDepth,clonalIGHDepth5,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence5,percentTotalReads5);
    }

    const vregion6 = control.at(0).get('v_gene6')?.value ? control.at(0).get('v_gene6')?.value : "";
    const jregion6 = control.at(0).get('j_gene6')?.value ? control.at(0).get('j_gene6')?.value : "";
    const rowcount6 = control.at(0).get('raw_count6')?.value ? control.at(0).get('raw_count6')?.value : "";
    const length6  = control.at(0).get('sequence_length6')?.value;
    const clonalIGHDepth6  = Number(control.at(0).get('raw_count6')?.value);
    const sequence6 = control.at(0).get('sequence6')?.value;
    if (vregion6.length !== 0 || jregion6.length !== 0 || rowcount6.length !== 0) {
      this.putFormWithoutgraph('6',vregion6,jregion6,length6,totalIGHreadDepth,clonalIGHDepth6,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence6,percentTotalReads6);
    }

    const vregion7 = control.at(0).get('v_gene7')?.value ? control.at(0).get('v_gene7')?.value : "";
    const jregion7 = control.at(0).get('j_gene7')?.value ? control.at(0).get('j_gene7')?.value : "";
    const rowcount7 = control.at(0).get('raw_count7')?.value ? control.at(0).get('raw_count7')?.value : "";
    const length7  = control.at(0).get('sequence_length7')?.value;
    const clonalIGHDepth7  = Number(control.at(0).get('raw_count7')?.value);
    const sequence7 = control.at(0).get('sequence7')?.value;
    if (vregion7.length !== 0 || jregion7.length !== 0 || rowcount7.length !== 0) {
      this.putFormWithoutgraph('7',vregion7,jregion7,length7,totalIGHreadDepth,clonalIGHDepth7,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence7,percentTotalReads7);
    }

    const vregion8 = control.at(0).get('v_gene8')?.value ? control.at(0).get('v_gene8')?.value : "";
    const jregion8 = control.at(0).get('j_gene8')?.value ? control.at(0).get('j_gene8')?.value : "";
    const rowcount8 = control.at(0).get('raw_count8')?.value ? control.at(0).get('raw_count8')?.value : "";
    const length8  = control.at(0).get('sequence_length8')?.value;
    const clonalIGHDepth8  = Number(control.at(0).get('raw_count8')?.value);
    const sequence8 = control.at(0).get('sequence8')?.value;
    if (vregion8.length !== 0 || jregion8.length !== 0 || rowcount8.length !== 0) {
      this.putFormWithoutgraph('8',vregion8,jregion8,length8,totalIGHreadDepth,clonalIGHDepth8,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence8,percentTotalReads8);
    }

    const vregion9 = control.at(0).get('v_gene9')?.value ? control.at(0).get('v_gene9')?.value : "";
    const jregion9 = control.at(0).get('j_gene9')?.value ? control.at(0).get('j_gene9')?.value : "";
    const rowcount9 = control.at(0).get('raw_count9')?.value ? control.at(0).get('raw_count9')?.value : "";
    const length9  = control.at(0).get('sequence_length9')?.value;
    const clonalIGHDepth9  = Number(control.at(0).get('raw_count9')?.value);
    const sequence9 = control.at(0).get('sequence9')?.value;
    if (vregion9.length !== 0 || jregion9.length !== 0 || rowcount9.length !== 0) {
      this.putFormWithoutgraph('9',vregion9,jregion9,length9,totalIGHreadDepth,clonalIGHDepth9,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence9,percentTotalReads9);
    }

    const vregion10 = control.at(0).get('v_gene10')?.value ? control.at(0).get('v_gene10')?.value : "";
    const jregion10 = control.at(0).get('j_gene10')?.value ? control.at(0).get('j_gene10')?.value : "";
    const rowcount10 = control.at(0).get('raw_count10')?.value ? control.at(0).get('raw_count10')?.value : "";
    const length10  = control.at(0).get('sequence_length10')?.value;
    const clonalIGHDepth10  = Number(control.at(0).get('raw_count10')?.value);
    const sequence10 = control.at(0).get('sequence10')?.value;
    if (vregion10.length !== 0 || jregion10.length !== 0 || rowcount10.length !== 0) {
      this.putFormWithoutgraph('10',vregion10,jregion10,length10,totalIGHreadDepth,clonalIGHDepth10,clonalTotalIGHReadDepth,clonalCellEquivalent,sequence10,percentTotalReads10);
    }


}

makeMRDData() {
  let sequence = 0;
  this.mrdData = [];
  let tempMrdData =[];
  const control = this.tablerowForm.get('tableRows') as FormArray;
  const tableLength = control.length -1;
  const rawValue = control.getRawValue().reverse();
  // console.log('[1512][mrd데이터]', rawValue);
  rawValue.forEach((item, index) => {
    
        if (item.use_yn1 === false) {
    
            
              if (sequence ===  0) {
                tempMrdData.push({
                  dateSequence: 'initial',
                  reportDate: item.report_date,
                  totalReadCount: item.total_read_count.replace(/,/g, ''),
                  readOfLQIC: item.read_of_LQIC,
                  totalBcellTcellCount :item.total_Bcell_Tcell_count.replace(/,/g, ''),
                  totalIGHReadDepth : item.total_IGH_read_depth,
                  totalNucelatedCells : item.total_IGH_read_depth,
                  totalCellEquipment : item.total_cell_equipment.replace(/,/g, ''),
                });
              } else {
                tempMrdData.push({
                  dateSequence: sequence + ' f/u',
                  reportDate: item.report_date,
                  totalReadCount: item.total_read_count.replace(/,/g, ''),
                  readOfLQIC: item.read_of_LQIC,
                  totalBcellTcellCount :item.total_Bcell_Tcell_count.replace(/,/g, ''),
                  totalIGHReadDepth : item.total_IGH_read_depth,
                  totalNucelatedCells : item.total_nucelated_cells,
                  totalCellEquipment : item.total_cell_equipment.replace(/,/g, ''),
                });   
            }
            sequence++;
        }
  });
  this.mrdData = tempMrdData.reverse();
  // console.log('[1542][mrd데이터 순서]', this.mrdData);
}
//////////////////////////////////////////////////////////////////////
// 그래프 데이타
makeGraphclonalTotalIGHReadDepthData(index: number = 0, date: string = '', clonalTotalIGHReadDepthData: string = '' ) {
  console.log('[1552][]', clonalTotalIGHReadDepthData);
  if ((Number(clonalTotalIGHReadDepthData)/100) < 0.0001 || clonalTotalIGHReadDepthData === '0.00') {
    this.clonalTotalIGHReadDepthData.unshift(Number(0.0001));
  
  } else {
    this.clonalTotalIGHReadDepthData.unshift(Number(clonalTotalIGHReadDepthData) /100);
  }
   this.checkDate.unshift(date);
   this.updateGraphData();
}

makeGraphclonalTotalNuclelatedCellsData(index: number = 0, date: string = '',   clonalTotalnuclelatedCells: string = '') { 
  // 값이 0.0001 이하면 0.0001 로 설정
  if ( (Number(clonalTotalnuclelatedCells)/100) < 0.0001 || clonalTotalnuclelatedCells === '0.0000') {
    
    this.clonalTotalnuclelatedCellsData.unshift(Number(0.0001));
  } else {
    this.clonalTotalnuclelatedCellsData.unshift(Number(clonalTotalnuclelatedCells) /100);
  }
  
  
  this.updateGraphData();
}

getAllData() {
  const control = this.tablerowForm.get('tableRows') as FormArray;
  const formValue = control.getRawValue();
  this.clonalTotalIGHReadDepthData= [];
  this.clonalTotalnuclelatedCellsData = [];
  this.checkDate= [];
  const len = formValue.length -1;

  formValue.forEach( (item, index) => {
     
      if (item.use_yn1 === false ) {  
          this.makeGraphclonalTotalIGHReadDepthData(index, item.report_date, item.total_IGH_read_depth );
        if (index === len) {  
            this.makeGraphclonalTotalNuclelatedCellsData(index,item.date, item.total_IGH_read_depth);   
        } else {    
           this.makeGraphclonalTotalNuclelatedCellsData(index,item.date, item.total_nucelated_cells);
        }
        
      }

  });

  this.updateGraphData();
}

updateGraphData() {
  this.options = {
    color: this.colors,
    legend: {
      data: ['Clonal/total ' + this.geneType + ' read depth (%)*  ', 'Clonal/total nuclelated cells (%)**'],
      left: 360,
      bottom: 20,
    },
    xAxis: {
      type: 'category',
      data:  this.checkDate,
    },
    yAxis: [
      {
        type: 'log',
      //  min: 0 ,
        minorSplitLine: {
            show: true
        },
        axisTick: {
          show: true,
          length: 4
        }
     },
 
    ]

      ,
    series: [
      {
        name: 'Clonal/total ' + this.geneType + ' read depth (%)*  ',
        type: 'line',
        data: this.clonalTotalIGHReadDepthData,
      },
      {
        name: 'Clonal/total nuclelated cells (%)**',
        type: 'line',
        data: this.clonalTotalnuclelatedCellsData
      }
    ],
  };
}
////////////////////////////////////////////////////////////////////////
increaseClonal() {
    
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

    if(control.length === 0) {
      alert("저장할수 없습니다.");
      return;
    }

    let init_result1= '';
    let init_result2= '';
    let init_comment= '';
    let fu_result= '';
    let fu_comment  = '';
    // 삭제된 것 추가함.
    if (this.deletedClonalLists.length) {
      this.deletedClonalLists.forEach(item => {
        formData.push(item);
      });
    }
    
    // 환자정보 저장
    this.patientInfo.examin = this.examin; // 검사자
    this.patientInfo.recheck = this.recheck; // 확인자
    this.patientInfo.accept_date = this.requestDate; // 의뢰한 날자
    // 멘트저장
 
      init_result1 = this.initialTestResult;
      init_result2 = this.initialAddComment;
      fu_result = this.mrdAddComment;
           
      if(this.commentInitial.length) {
        init_comment = this.commentInitial;
      } else {
        this.commentInitial =  initalComment(this.geneType,this.patientInfo.test_code) ;
        init_comment = this.commentInitial;
      }
      
      if (this.commentMRD.length) {
        fu_comment = this.commentMRD;
      } else {
        this.commentMRD =  makeComment(this.geneType,this.patientInfo.test_code) ;
        fu_comment = this.commentMRD;
      }
    
    this.firstReportDay = this.today2().replace(/-/g, '.'); 
   
    this.igTcrData = {
        specimenNo: this.patientInfo.specimenNo,
        method: this.patientInfo.reportTitle,
        recheck: this.recheck,
        examin: this.examin,
        sendEMRDate: this.firstReportDay,
        report_date: '',
        comment: this.comment,
        init_result1,
        init_result2,
        init_comment,
        fu_result,
        fu_comment,
        detected: this.resultStatus === "Detected" ? '0' : '1',
        patientid: this.patientInfo.patientID,
        trbtrg: '',
        data:  formData
      };


      this.service.igtSave(this.igTcrData).subscribe(data => {
        if (data.message === 'OK') {
          alert('저장 했습니다.');
          // this.saveAfterRender(); // 임시
        } else {
          alert('저장 실패.');
        }
      });
  
  }

  // 저장한것 다시 불러오기
  saveAfterRender() {
  this.service.igtcrListInfo(this.patientInfo.specimenNo)
      .pipe(
        tap(data => {
          this.clonalLists = [];
          this.clonalLists = data
        })
      ).subscribe((data) => {
        const control = this.tablerowForm.get('tableRows') as FormArray;
        control.clear();
        this.clonalLists.forEach((item, index) => {
          if (index === 0) {
            if (item.gene.length) {
              this.geneType = item.gene;
            }
          }
          this.addRow(item);
          this.clonalTotalIGHReadDepth(index);
          this.clonalTotalNuclelatedCell(index);
          this.totalCellEquivalent(index);
          this.makeMent(); 
        });        
      });

}

  screenRead(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    if(control.length === 0) {
      alert("데이터가 없어 사용할수 없습니다.");
      return;
    }

    this.patientInfo.screenstatus = '1';
    this.screenstatus = '1';
      this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'1','1000', 'userid').subscribe(data => {
        this.saveAllData();
        alert('저장했습니다.');
      });
     
  }
  
  
  // 판독완료
  screenReadFinish(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    if(control.length === 0) {
      alert("데이터가 없어 사용할수 없습니다.");
      return;
    }

    this.patientInfo.screenstatus = '2';   
    this.screenstatus = '2';
    this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'2','2000', 'userid').subscribe(data => {
      this.saveAllData();
      
   });
  }

  reset(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const temp = control.getRawValue();
   
    if (control.length === 0) {
      alert("수정할수 없습니다.");
    } else {
      this.patientInfo.screenstatus = '1';
      this.screenstatus = '1';
      this.patientsListService.changescreenstatus( this.patientInfo.specimenNo,'1','100', 'userid').subscribe(data => {
        alert('변경했습니다.');
     });
    }
 
  }

  //// 스크린판독 ////
getStatus(index: number): boolean {
    
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

  changeGeneType(gene: string) {
    this.geneType = gene;
 }
  
  ///////////////////////////////////////////////////////////////

    // tslint:disable-next-line: typedef
    startToday(): string {
        const oneMonthsAgo = moment().subtract('months');
    
        const yy = oneMonthsAgo.format('YYYY');
        const mm = oneMonthsAgo.format('MM');
        const dd = oneMonthsAgo.format('DD');
    
        const now1 = yy + '-' + mm + '-' + dd;
    
        return now1;
    }

//////////////////////////////////////////
initialAddCommentChange(contents: string) {
  if (contents.length > 0) {
    this.commentInitial = this.commentInitial  + contents;
  }
}

mrdAddCommentChange(contents: string) {
  if (contents.length > 0) {
    this.commentMRD = this.commentMRD  + contents;
  }
  
}

boxstatus(i: number, event: any) {

  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const gene = tableRows.at(i).get('gene')?.value;  
  tableRows.at(i).patchValue({ use_yn1: event.target.checked});
   
  this.getCheckboxMax();
}

// checkbox 있으면 다름값 구하기
getCheckboxMax() {
  let indexNo = -1;
  let totalIGHReadDepth = '';
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  // mrdPcellLPE557  mrdnucleatedCells mrdPcellLPE557 mrdnucleatedCells

  const tableValues= tableRows.getRawValue();
  tableValues.forEach((item, index) => {

    const useYN1 = tableRows.at(index).get('use_yn1')?.value;
    if (useYN1 === false && indexNo === -1) {
      indexNo = index;
      totalIGHReadDepth = tableRows.at(index).get('total_IGH_read_depth')?.value;
      this.mrdnucleatedCells = tableRows.at(index).get('total_nucelated_cells')?.value;
      this.secondTotalBcellTcellCount = tableRows.at(index).get('total_Bcell_Tcell_count')?.value;

      if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE556') {
        this.mrdBcellLPE555LPE556 = totalIGHReadDepth;
      } else if(this.patientInfo.test_code === 'LPE557') {
        this.mrdPcellLPE557 = totalIGHReadDepth;
      }
    }

  });
}

 

// 멘트처리
makeMent() {
  if (this.patientInfo.test_code === 'LPE555' || this.patientInfo.test_code === 'LPE557') {
    this.commentMRD =  makeComment(this.geneType,this.patientInfo.test_code) ;
    this.commentInitial =  initalComment(this.geneType,this.patientInfo.test_code) ;       
  } else if(this.patientInfo.test_code === 'LPE556') {
     this.commentMRD =  makeComment('IGH/IGK',this.patientInfo.test_code) ;
     this.commentInitial =  initalComment('IGH/IGK',this.patientInfo.test_code) ;    
  }  

}
 /////////////////////////////////////////////////////////////
// toolTip
matTooltip(i: number): string {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const comment = tableRows.at(i).get('comment')?.value;
  return comment;
}



////////////////////////////////////////////////////////////////////////

}
