import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { concatMap, switchMap, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IPatient, IClonal } from '../igtcr.model';
import { IgtcrService } from '../igtcr.services';
import { init } from 'echarts';

@Component({
  selector: 'app-igtcr-sheet',
  templateUrl: './igtcrSheet.component.html',
  styleUrls: [ './igtcrSheet.component.scss']
})
export class IgTcrSheetComponent implements OnInit , OnDestroy {

  examin = ''; // 검사자
  recheck = ''; // 확인자

  firstReportDay = '-'; // 검사보고일
  lastReportDay = '-';  // 수정보고일

 comment2 = '시험용';
 reportType = '';
 reportID = '';
 resultStatus = 'Detected';
 title = '';
 clonalLists: IClonal[] = [];
 private subs = new SubSink();

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
};

mockData: IClonal[] = [];
tablerowForm: FormGroup ;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private service: IgtcrService,
  ){
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list))),
    });
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.route.params
    .pipe(

      tap(data => {
        this.reportType = data['type'];
        this.reportID = data['id'];
        // if (this.reportType === 'LPE555') {

        // } else if (this.reportType === 'LPE556') {

        // }
      }),
      switchMap(data => of(data['id'])),
      tap(data => {
        this.patientInfo = this.service.patientLists[data];
      }),
      concatMap(() => {
        return this.service.igtcrListInfo(this.patientInfo.specimenNo)
       
       }),
       tap(data => this.clonalLists = data)

    )
    .subscribe(params => {
      this.clonalLists.forEach((item, index) => {
        console.log('[111] ... loop',item );
        this.addRow(item);
      })
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  createPdf(): void {
    
    let DATA: any = document.getElementById('resultSheet');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      const filename = 'IGH_CLONALITY_REPORT_'+this.patientInfo.patientID+'_'+this.today() ;
      PDF.save(filename);
    });
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



    // 검사일/검사보고일/수정보고일 관리
  setReportdaymgn(patientInfo: IPatient): void {
      // 전송횟수, 검사보고일, 수정보고일  저장
      console.log('[730][검사일/검사보고일/수정보고일 관리]', patientInfo);
      // this.sendEMR = Number(patientInfo.sendEMR);
      // if (patientInfo.sendEMRDate.length) {
      //   this.firstReportDay = patientInfo.sendEMRDate.replace(/-/g, '.').slice(0, 10);
      // }
      // if (this.sendEMR > 1) {
      //   this.lastReportDay = patientInfo.report_date.replace(/-/g, '.').slice(0, 10);
      // } else if (this.sendEMR === 0) {
      //   this.firstReportDay = '-';
      // }
  
      // 판독자 , 검사자
      if (patientInfo.examin.length) {
        this.examin = patientInfo.examin;
      }
  
      if (patientInfo.recheck.length) {
        this.recheck = patientInfo.recheck;
      }
      if (patientInfo.examin.length === 0 && patientInfo.recheck.length === 0) {
  
        this.subs.sink = this.service.getListsDig('AMLALL')
          .subscribe(data => {
            console.log('[124][검사자]', data);
            this.examin = data[0].checker;
            this.recheck = data[0].reader;
          }); 
      }
  
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
    report_date: [''],
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

// addNewRow(row: IClonal): void {

//   const control = this.tablerowForm.get('tableRows') as FormArray;
//   control.push(this.makeNewRow(row));
// }

// removeTableRow(i: number): void {
//   this.getFormControls().removeAt(i);
// }


// getFormControls(): any {
//   const control = this.tablerowForm.get('tableRows') as FormArray;
//   return control;
// }
////////////////////////////////////////////////
/////////////////  각종 식  ///////////////////////////////////////////////////////
totalReadCount(index: number, count: string, readOfLQIC: number): void {
  const tableRows = this.tablerowForm.get('tableRows') as FormArray;
  const newPercentOfLQIC = ((readOfLQIC/parseInt(count)) * 100).toFixed(2);
  tableRows.at(index).patchValue({ percent_of_LQIC: newPercentOfLQIC });
  console.log('...', index, count, readOfLQIC, newPercentOfLQIC);
}

totalBCellTCellCount(index: number, totalReadCount: number, count: string): void {
 const tableRows = this.tablerowForm.get('tableRows') as FormArray;
 const newTotalBcell = ((totalReadCount/parseInt(count)) * 100).toFixed(0);
 tableRows.at(index).patchValue({ total_Bcell_Tcell_count: newTotalBcell });
}


/////////////////////////////////////////////////////////////////////////////////////

}
