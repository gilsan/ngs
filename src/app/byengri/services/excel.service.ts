import { Injectable } from '@angular/core';

import * as FileSaver from 'file-saver';
import * as XLSX from 'sheetjs-style';
// import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private jsonData: any = [];
  private excelFileName = 'ngs';


  public exportAsExcelFile(jsonData: any[], excelFileName: string, width: any[]): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData, { skipHeader: true });
    worksheet['!cols'] = width;
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  public igtcrAsExcelFile(jsonData: any[], excelFileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData, { skipHeader: true });
    console.log('[35][/app/byengri/services/excel 서비스][igTcr 데이터 액셀로 변환하기]');
    //const width = [{ width: 12 }];

    ws['!cols'] = [] ;
    ws['!rows'] = [{ hpx: 57 }]; 
   
    // 헤더
    ws.A1 = { t: 's', v: '접수일' };
    ws.A1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.B1 = { t: 's', v: '이름' };
    ws.B1.s = { alignment: { horizontal: 'center', vertical: 'center' } };   
    ws.C1 = { t: 's', v: 'ID' };
    ws.C1.s = { alignment: { horizontal: 'center', vertical: 'center' } }; 
    ws.D1 = { t: 's', v: 'gene' };
    ws.D1.s = { alignment: { horizontal: 'center', vertical: 'center' } }; 

    ws.E1 = { t: 's', v: 'Total\r\nRead\r\nCount' };
    ws.E1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true  } };

    ws.F1 = { t: 's', v: 'Read\r\nof\r\nLQIC' };
    ws.F1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true  } };

    ws.G1 = { t: 's', v: '%\r\nof\r\nLQIC' };
    ws.G1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true  } };

    ws.H1 = { t: 's', v: 'Total\r\nB-cell\r\nT-cell count' };
    ws.H1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true  } };

    ws.I1 = { t: 's', v: 'Clonal sequence 1' };
    ws.I1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.I2 = { t: 's', v: 'Sequence' };
    ws.I2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.J2 = { t: 's', v: 'Length' };
    ws.J2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.K2 = { t: 's', v: 'Raw\r\nCount' };
    ws.K2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.L2 = { t: 's', v: 'v-gene' };
    ws.L2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.M2 = { t: 's', v: 'J-gene' };
    ws.M2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.N2 = { t: 's', v: '% total\r\nreads' };
    ws.N2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.O2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.O2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };

    ws.P1 = { t: 's', v: 'Clonal sequence 2' };
    ws.P1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.P2 = { t: 's', v: 'Sequence' };
    ws.P2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.Q2 = { t: 's', v: 'Length' };
    ws.Q2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.R2 = { t: 's', v: 'Raw\r\nCount' };
    ws.R2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.S2 = { t: 's', v: 'v-gene' };
    ws.S2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.T2 = { t: 's', v: 'J-gene' };
    ws.T2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.U2 = { t: 's', v: '% total\r\nreads' };
    ws.U2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.V2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.V2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };

    ws.W1 = { t: 's', v: 'Clonal sequence 3' };
    ws.W1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.W2 = { t: 's', v: 'Sequence' };
    ws.W2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.X2 = { t: 's', v: 'Length' };
    ws.X2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.Y2 = { t: 's', v: 'Raw\r\nCount' };
    ws.Y2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.Z2 = { t: 's', v: 'v-gene' };
    ws.Z2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AA2 = { t: 's', v: 'J-gene' };
    ws.AA2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AB2 = { t: 's', v: '% total\r\nreads' };
    ws.AB2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.AC2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.AC2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };

    ws.AD1 = { t: 's', v: 'Clonal sequence 4' };
    ws.AD1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AD2 = { t: 's', v: 'Sequence' };
    ws.AD2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AE2 = { t: 's', v: 'Length' };
    ws.AE2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AF2 = { t: 's', v: 'Raw\r\nCount' };
    ws.AF2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.AG2 = { t: 's', v: 'v-gene' };
    ws.AG2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AH2 = { t: 's', v: 'J-gene' };
    ws.AH2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AI2 = { t: 's', v: '% total\r\nreads' };
    ws.AI2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.AJ2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.AJ2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws['!cols'][29]= {hidden: true}; ws['!cols'][30]= {hidden: true}; ws['!cols'][31]= {hidden: true};
    ws['!cols'][32]= {hidden: true}; ws['!cols'][33]= {hidden: true}; ws['!cols'][34]= {hidden: true}; ws['!cols'][35]= {hidden: true};

    ws.AK1 = { t: 's', v: 'Clonal sequence 5' };
    ws.AK1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AK2 = { t: 's', v: 'Sequence' };
    ws.AK2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AL2 = { t: 's', v: 'Length' };
    ws.AL2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AM2 = { t: 's', v: 'Raw\r\nCount' };
    ws.AM2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.AN2 = { t: 's', v: 'v-gene' };
    ws.AN2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AO2 = { t: 's', v: 'J-gene' };
    ws.AO2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AP2 = { t: 's', v: '% total\r\nreads' };
    ws.AP2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.AQ2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.AQ2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws['!cols'][36]= {hidden: true}; ws['!cols'][37]= {hidden: true}; ws['!cols'][38]= {hidden: true};
    ws['!cols'][39]= {hidden: true}; ws['!cols'][40]= {hidden: true}; ws['!cols'][41]= {hidden: true}; ws['!cols'][42]= {hidden: true};
    ws.AR1 = { t: 's', v: 'Clonal sequence 6' };
    ws.AR1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AR2 = { t: 's', v: 'Sequence' };
    ws.AR2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AS2 = { t: 's', v: 'Length' };
    ws.AS2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AT2 = { t: 's', v: 'Raw\r\nCount' };
    ws.AT2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.AU2 = { t: 's', v: 'v-gene' };
    ws.AU2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AV2 = { t: 's', v: 'J-gene' };
    ws.AV2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.AW2 = { t: 's', v: '% total\r\nreads' };
    ws.AW2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.AX2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.AX2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws['!cols'][43]= {hidden: true}; ws['!cols'][44]= {hidden: true}; ws['!cols'][45]= {hidden: true};
    ws['!cols'][46]= {hidden: true}; ws['!cols'][47]= {hidden: true}; ws['!cols'][48]= {hidden: true}; ws['!cols'][49]= {hidden: true};

    ws.AY1 = { t: 's', v: 'Clonal sequence 7' };
    ws.AY1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AY2 = { t: 's', v: 'Sequence' };
    ws.AY2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AZ2 = { t: 's', v: 'Length' };
    ws.AZ2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BA2 = { t: 's', v: 'Raw\r\nCount' };
    ws.BA2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.BB2 = { t: 's', v: 'v-gene' };
    ws.BB2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BC2 = { t: 's', v: 'J-gene' };
    ws.BC2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BD2 = { t: 's', v: '% total\r\nreads' };
    ws.BD2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.BE2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.BE2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws['!cols'][50]= {hidden: true}; ws['!cols'][51]= {hidden: true}; ws['!cols'][52]= {hidden: true};
    ws['!cols'][53]= {hidden: true}; ws['!cols'][54]= {hidden: true}; ws['!cols'][55]= {hidden: true}; ws['!cols'][56]= {hidden: true};

    ws.BF1 = { t: 's', v: 'Clonal sequence 8' };
    ws.BF1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BF2 = { t: 's', v: 'Sequence' };
    ws.BF2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BG2 = { t: 's', v: 'Length' };
    ws.BG2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BH2 = { t: 's', v: 'Raw\r\nCount' };
    ws.BH2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.BI2 = { t: 's', v: 'v-gene' };
    ws.BI2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BJ2 = { t: 's', v: 'J-gene' };
    ws.BJ2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BK2 = { t: 's', v: '% total\r\nreads' };
    ws.BK2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.BL2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.BL2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws['!cols'][57]= {hidden: true}; ws['!cols'][58]= {hidden: true}; ws['!cols'][59]= {hidden: true};
    ws['!cols'][60]= {hidden: true}; ws['!cols'][61]= {hidden: true}; ws['!cols'][62]= {hidden: true}; ws['!cols'][63]= {hidden: true};

    ws.BM1 = { t: 's', v: 'Clonal sequence 9' };
    ws.BM1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BM2 = { t: 's', v: 'Sequence' };
    ws.BM2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BN2 = { t: 's', v: 'Length' };
    ws.BN2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BO2 = { t: 's', v: 'Raw\r\nCount' };
    ws.BO2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.BP2 = { t: 's', v: 'v-gene' };
    ws.BP2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BQ2 = { t: 's', v: 'J-gene' };
    ws.BQ2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BR2 = { t: 's', v: '% total\r\nreads' };
    ws.BR2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.BS2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.BS2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws['!cols'][64]= {hidden: true}; ws['!cols'][65]= {hidden: true}; ws['!cols'][66]= {hidden: true};
    ws['!cols'][67]= {hidden: true}; ws['!cols'][68]= {hidden: true}; ws['!cols'][69]= {hidden: true}; ws['!cols'][70]= {hidden: true};

    ws.BT1 = { t: 's', v: 'Clonal sequence 10' };
    ws.BT1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BT2 = { t: 's', v: 'Sequence' };
    ws.BT2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BU2 = { t: 's', v: 'Length' };
    ws.BU2.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.BV2 = { t: 's', v: 'Raw\r\nCount' };
    ws.BV2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.BW2 = { t: 's', v: 'v-gene' };
    ws.BW2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BX2 = { t: 's', v: 'J-gene' };
    ws.BX2.s = { alignment: { horizontal: 'center', vertical: 'center'  } };
    ws.BY2 = { t: 's', v: '% total\r\nreads' };
    ws.BY2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws.BZ2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.BZ2.s = { alignment: { horizontal: 'center', vertical: 'center' , wrapText: true } };
    ws['!cols'][71]= {hidden: true}; ws['!cols'][72]= {hidden: true}; ws['!cols'][73]= {hidden: true};
    ws['!cols'][74]= {hidden: true}; ws['!cols'][75]= {hidden: true}; ws['!cols'][76]= {hidden: true}; ws['!cols'][77]= {hidden: true};

    ws.CA1 = { t: 's', v: 'TOTAL' };
    ws.CA1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.CA2 = { t: 's', v: 'Clonal/total\r\nTCR read depth\r\n(%)**' };
    ws.CA2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.CB2 = { t: 's', v: 'Clonal/total\r\nnucleated cells\r\n(%)**' };
    ws.CB2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.CC2 = { t: 's', v: 'cell\r\nequivalent' };
    ws.CC2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    ws.CD2 = { t: 's', v: 'IGHV\r\nmutation' };
    ws.CD2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };

    ws.CE1 = { t: 's', v: '비고' };
    ws.CE1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.CF1 = { t: 's', v: 'Comment' };
    ws.CF1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.CG1 = { t: 's', v: '농도' };
    ws.CG1.s = { alignment: { horizontal: 'center', vertical: 'center' } };



    // 액셀 헤더 row줄 조정
    const a0 = [
      { s: { c: 0, r: 0 }, e: { c: 0, r: 2 } }, { s: {c: 1, r: 0}, e: {c:1, r: 2}} ,{ s: {c: 2, r: 0}, e: {c:2, r: 2}}, // A, B,C
      { s: { c: 3, r:0}, e:{c:3, r: 2}},  { s: { c: 4, r:0}, e:{c:4, r: 2}}, { s: { c: 5, r:0}, e:{c:5, r: 2}}, // D, E, F
      { s: { c: 6, r:0}, e:{c:6, r: 2}}, { s: { c: 7, r:0}, e:{c:7, r: 2}},  //G, H

      { s: { c: 8, r:0}, e:{c:14, r: 0}}, // I1
      { s: { c: 8, r:1}, e:{c:8, r: 2}},  { s: { c: 9, r:1}, e:{c:9, r: 2}},  { s: { c: 10, r:1}, e:{c:10, r: 2}},//I2, J2, K2,
      { s: { c: 11, r:1}, e:{c:11, r: 2}}, { s: { c: 12, r:1}, e:{c:12, r: 2}}, { s: { c: 13, r:1}, e:{c:13, r: 2}}, { s: { c: 14, r:1}, e:{c:14, r: 2}},// L2,M2,N2,02
   
      { s: { c: 15, r:0}, e:{c:21, r: 0}}, // P1
      { s: { c: 15, r:1}, e:{c:15, r: 2}},  { s: { c: 16, r:1}, e:{c:16, r: 2}},  { s: { c: 17, r:1}, e:{c:17, r: 2}},//P2, Q2, R2,
      { s: { c: 18, r:1}, e:{c:18, r: 2}}, { s: { c: 19, r:1}, e:{c:19, r: 2}}, { s: { c: 20, r:1}, e:{c:20, r: 2}}, { s: { c: 21, r:1}, e:{c:21, r: 2}},// S2,T2,U2,V2

      { s: { c: 22, r:0}, e:{c:28, r: 0}}, // W1
      { s: { c: 22, r:1}, e:{c:22, r: 2}},  { s: { c: 23, r:1}, e:{c:23, r: 2}},  { s: { c: 24, r:1}, e:{c:24, r: 2}},//W2, X2, Y2,
      { s: { c: 25, r:1}, e:{c:25, r: 2}}, { s: { c: 26, r:1}, e:{c:26, r: 2}}, { s: { c: 27, r:1}, e:{c:27, r: 2}}, { s: { c: 28, r:1}, e:{c:28, r: 2}},// Z2,AA2,AB2,AC2

      { s: { c: 29, r:0}, e:{c:35, r: 0}}, // AD1
      { s: { c: 29, r:1}, e:{c:29, r: 2}},  { s: { c: 30, r:1}, e:{c:30, r: 2}},  { s: { c: 31, r:1}, e:{c:31, r: 2}},//AD2, AE2, AF2,
      { s: { c: 32, r:1}, e:{c:32, r: 2}}, { s: { c: 33, r:1}, e:{c:33, r: 2}}, { s: { c: 34, r:1}, e:{c:34, r: 2}}, { s: { c: 35, r:1}, e:{c:35, r: 2}},// AG2,AH2,AI2,AJ2 

      { s: { c: 36, r:0}, e:{c:42, r: 0}}, // AK1
      { s: { c: 36, r:1}, e:{c:36, r: 2}},  { s: { c: 37, r:1}, e:{c:37, r: 2}},  { s: { c: 38, r:1}, e:{c:38, r: 2}},//AK2, AL2, AM2,
      { s: { c: 39, r:1}, e:{c:39, r: 2}}, { s: { c: 40, r:1}, e:{c:40, r: 2}}, { s: { c: 41, r:1}, e:{c:41, r: 2}}, { s: { c: 42, r:1}, e:{c:42, r: 2}},// AN2,AO2,AP2,AQ2 

      { s: { c: 43, r:0}, e:{c:49, r: 0}}, // AR1
      { s: { c: 43, r:1}, e:{c:43, r: 2}},  { s: { c: 44, r:1}, e:{c:44, r: 2}},  { s: { c: 45, r:1}, e:{c:45, r: 2}},//AR2, AS2, AT2,
      { s: { c: 46, r:1}, e:{c:46, r: 2}}, { s: { c: 47, r:1}, e:{c:47, r: 2}}, { s: { c: 48, r:1}, e:{c:48, r: 2}}, { s: { c: 49, r:1}, e:{c:49, r: 2}},// AU2,AV2,AW2,AX2       

      { s: { c: 50, r:0}, e:{c:56, r: 0}}, // AY1
      { s: { c: 50, r:1}, e:{c:50, r: 2}},  { s: { c: 51, r:1}, e:{c:51, r: 2}},  { s: { c: 52, r:1}, e:{c:52, r: 2}},//AY2, AZ2, BA2,
      { s: { c: 53, r:1}, e:{c:53, r: 2}}, { s: { c: 54, r:1}, e:{c:54, r: 2}}, { s: { c: 55, r:1}, e:{c:55, r: 2}}, { s: { c: 56, r:1}, e:{c:56, r: 2}},// BB2,BC2,BD2,BE2

      { s: { c: 57, r:0}, e:{c:63, r: 0}}, // BF1
      { s: { c: 57, r:1}, e:{c:57, r: 2}},  { s: { c: 58, r:1}, e:{c:58, r: 2}},  { s: { c: 59, r:1}, e:{c:59, r: 2}},//BF2, BG2, BH2,
      { s: { c: 60, r:1}, e:{c:60, r: 2}}, { s: { c: 61, r:1}, e:{c:61, r: 2}}, { s: { c: 62, r:1}, e:{c:62, r: 2}}, { s: { c: 63, r:1}, e:{c:63, r: 2}},// BI2,BJ2,BK2,BL2

      { s: { c: 64, r:0}, e:{c:70, r: 0}}, // BM1
      { s: { c: 64, r:1}, e:{c:64, r: 2}},  { s: { c: 65, r:1}, e:{c:65, r: 2}},  { s: { c: 66, r:1}, e:{c:66, r: 2}},//BM2, BN2, BO2,
      { s: { c: 67, r:1}, e:{c:67, r: 2}}, { s: { c: 68, r:1}, e:{c:68, r: 2}}, { s: { c: 69, r:1}, e:{c:69, r: 2}}, { s: { c: 70, r:1}, e:{c:70, r: 2}},// BP2,BQ2,BR2,BS2

      { s: { c: 71, r:0}, e:{c:77, r: 0}}, // BT1
      { s: { c: 71, r:1}, e:{c:71, r: 2}},  { s: { c: 72, r:1}, e:{c:72, r: 2}},  { s: { c: 73, r:1}, e:{c:73, r: 2}},//BT2, BU2, BV2,
      { s: { c: 74, r:1}, e:{c:74, r: 2}}, { s: { c: 75, r:1}, e:{c:75, r: 2}}, { s: { c: 76, r:1}, e:{c:76, r: 2}}, { s: { c: 77, r:1}, e:{c:77, r: 2}},// BW2,BX2,BY2,BZ2

      { s: { c: 78, r:0}, e:{c:81, r: 0}}, // CA1
      { s: { c: 78, r:1}, e:{c:78, r: 2}}, { s: { c: 79, r:1}, e:{c:79, r: 2}}, { s: { c: 80, r:1}, e:{c:80, r: 2}}, { s: { c: 81, r:1}, e:{c:81, r: 2}}, // CA2, CB2,CC2, CD2

      { s: { c: 82, r: 0 }, e: { c: 82, r: 2 } }, { s: { c: 83, r: 0 }, e: { c: 83, r: 2 } }, { s: { c: 84, r: 0 }, e: { c: 84, r: 2 } } // CE, CF, CG

    ];

      ws['!merges'] = a0;
      ws["!cols"][78] = { width: 14 };
      ws["!cols"][79] = { width: 14 };

    const workbook: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
    

  }

  public exortAsNGSTest(jsonData: any[], excelFileName: string, width: any[]): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData, { skipHeader: true });
    console.log('[35][exortAsNGSTest]', width);
    ws['!cols'] = width ;
    ws['!rows'] = [{ hpx: 57 }];
    

    ws.A1 = { t: 's', v: '순번' };
    ws.A1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.B1 = { t: 's', v: '조건부선별급여 접수번호' };
    ws.B1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.C1 = { t: 's', v: 'A_환자정보' };
    ws.C1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.C2 = { t: 's', v: 'A3' };
    ws.C3 = { t: 's', v: '증례등록번호' };
    ws.D2 = { t: 's', v: 'A1' };
    ws.D2.s = { alignment: { horizontal: 'center' } };
    ws.D3 = { t: 's', v: '요양기호' };
    ws.E2 = { t: 's', v: 'A5' };
    ws.E2.s = { alignment: { horizontal: 'center' } };
    ws.E3 = { t: 's', v: '환자명' };
    ws.F2 = { t: 's', v: 'A6' };
    ws.F2.s = { alignment: { horizontal: 'center' } };
    ws.F3 = { t: 's', v: '생년월일' };
    ws.G2 = { t: 's', v: 'A7' };
    ws.G2.s = { alignment: { horizontal: 'center' } };
    ws.G3 = { t: 's', v: '성별' };
    ws.H2 = { t: 's', v: 'A8' };
    ws.H2.s = { alignment: { horizontal: 'center' } };
    ws.H3 = { t: 's', v: '청구 여부' };
    ws.I2 = { t: 's', v: 'A8-1' };
    ws.I2.s = { alignment: { horizontal: 'center' } };
    ws.I3 = { t: 's', v: '접수번호' };
    ws.J2 = { t: 's', v: 'A8-2' };
    ws.J2.s = { alignment: { horizontal: 'center' } };
    ws.J3 = { t: 's', v: '명일련' };
    ws.K2 = { t: 's', v: 'A9' };
    ws.K2.s = { alignment: { horizontal: 'center' } };
    ws.K3 = { t: 's', v: '본인부담률' };
    ws.L2 = { t: 's', v: 'A9-1' };
    ws.L2.s = { alignment: { horizontal: 'center' } };
    ws.L3 = { t: 's', v: '본임부담률 90% 분류 ' };
    ws.M2 = { t: 's', v: 'A9-2' };
    ws.M2.s = { alignment: { horizontal: 'center' } };
    ws.M3 = { t: 's', v: '90% 본인부담률 소견서 작성 여부' };
    ws.N2 = { t: 's', v: '' };
    ws.N3 = { t: 's', v: '패널명' };
    ws.O1 = { t: 's', v: 'B_패널' };
    ws.O1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.O2 = { t: 's', v: 'B1' };
    ws.O2.s = { alignment: { horizontal: 'center' } };
    ws.O3 = { t: 's', v: '패널구분' };
    
    // 25.04.28
    ws.P2 = { t: 's', v: 'B2-1' };
    ws.P2.s = { alignment: { horizontal: 'center' } };
    ws.P3 = { t: 's', v: '검사위탁' };
    ws.Q2 = { t: 's', v: 'B2-2' };
    ws.Q2.s = { alignment: { horizontal: 'center' } };    
    ws.Q3 = { t: 's', v: '패널관리번호' };

    ws.Q1 = { t: 's', v: 'C_상병' };
    ws.Q1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.Q2 = { t: 's', v: 'C1' };
    ws.Q2.s = { alignment: { horizontal: 'center' } };
    ws.Q3 = { t: 's', v: '검사 전\n상병분류기호' };
    ws.R2 = { t: 's', v: '' };
    ws.R3 = { t: 's', v: '검사전상병명' };
    ws.S2 = { t: 's', v: 'C2' };
    ws.S2.s = { alignment: { horizontal: 'center' } };
    ws.S3 = { t: 's', v: '검사 후\n상병분류기호' };
    ws.T2 = { t: 's', v: '' };
    ws.T3 = { t: 's', v: '검사후상병명' };
    ws.T2 = { t: 's', v: 'C3' };
    ws.U2.s = { alignment: { horizontal: 'center' } };
    ws.U3 = { t: 's', v: '해당질환\n가족력' };
    ws.V2 = { t: 's', v: 'C4-1' };
    ws.V2.s = { alignment: { horizontal: 'center' } };
    ws.V3 = { t: 's', v: '고형암 여부' };
    ws.W2 = { t: 's', v: 'C4-2' };
    ws.W2.s = { alignment: { horizontal: 'center' } };
    ws.W3 = { t: 's', v: '진행성, 전이성, 재발성 고형암' };
    ws.X2 = { t: 's', v: 'C4-3' };
    ws.X2.s = { alignment: { horizontal: 'center' } };
    ws.X3 = { t: 's', v: '병기구분' };
    ws.Y2 = { t: 's', v: 'C4-3-1' };
    ws.Y2.s = { alignment: { horizontal: 'center' } };
    ws.Y3 = { t: 's', v: 'Stage' };
    ws.Z2 = { t: 's', v: 'C4-3-2' };
    ws.Z2.s = { alignment: { horizontal: 'center' } };
    ws.Z3 = { t: 's', v: '행동양식 분류부호' };

    ws.AA1 = { t: 's', v: 'D_검체' }; 
    ws.AA1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AA2 = { t: 's', v: 'D1' };
    ws.AA2.s = { alignment: { horizontal: 'center' } };
    ws.AA3 = { t: 's', v: '검체종류' };
    ws.AB2 = { t: 's', v: 'D1-1' };
    ws.AB2.s = { alignment: { horizontal: 'center' } };
    ws.AB3 = { t: 's', v: '검체기타' };
    ws.AC2 = { t: 's', v: 'D2' };
    ws.AC2.s = { alignment: { horizontal: 'center' } };
    ws.AC3 = { t: 's', v: '검체접수일' };
    ws.AD2 = { t: 's', v: 'D3' };
    ws.AD2.s = { alignment: { horizontal: 'center' } };
    ws.AD3 = { t: 's', v: '검사보고일' };    
    ws.AE2 = { t: 's', v: 'D4-1' };
    ws.AE2.s = { alignment: {horizontal: 'center'} };
    ws.AE3 = { t: 's', v: 'organ'};

    ws.AF2 = { t: 's', v: 'D4-2'};
    ws.AF2.s = { alignment: { horizontal: 'center'} };
    ws.AF3 = { t: 's', v: '조직유형(histologic type)'};

    ws.AG2 = { t: 's', v: ''};
    ws.AG3 = { t: 's', v: ''};

    ws.AH2 = { t: 's', v: 'D4-3'};
    ws.AH2.s = { alignment: { horizontal: 'center'} };
    ws.AH3 = { t: 's', v: '검사시행사유'};

    ws.AI2 = { t: 's', v: 'D5-1'};
    ws.AI2.s = { alignment: { horizontal: 'center'}};
    ws.AI3 = { t: 's', v: '단일유전자검사 시행여부'};

    ws.AJ2 = { t: 's', v: 'D5-2'};
    ws.AJ2.s = { alignment: { horizontal: 'center'}};
    ws.AJ3 = { t: 's', v: '단일유전자검사 시행일' };

    ws.AK2 = { t: 's', v: 'D5-3'};
    ws.AK2.s = { alignment: { horizontal: 'center'}};
    ws.AK3 = { t: 's', v: '단일유전자검사 검사 종목' };

    ws.AL1 = { t: 's', v: 'E_검사결과' };
    ws.AL1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AL2 = { t: 's', v: 'E1' };
    ws.AL2.s = { alignment: { horizontal: 'center' } }; 
    ws.AL3 = { t: 's', v: 'PV/LPV 검출 여부' };

    ws.AM2 = { t: 's', v: 'E1-1' };
    ws.AM2.s = { alignment: { horizontal: 'center' } }; 
    ws.AM3 = { t: 's', v: 'PV/LPV 검출 유전자' };
    
    ws.AN2 = { t: 's', v: 'E2' };
    ws.AN2.s = { alignment: { horizontal: 'center' } };
    ws.AN3 = { t: 's', v: 'VUS 검출여부' };

    ws.AO1 = { t: 's', v: '' };
    ws.AO2 = { t: 's', v: 'E2-1' };
    ws.AO2.s = { alignment: { horizontal: 'center' } };
    ws.AO3 = { t: 's', v: 'VUS 검출 유전자' };

    ws.AP1 = { t: 's', v: 'F_기타' }; 
    ws.AP1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AP2 = { t: 's', v: 'F1' };
    ws.AP2.s = { alignment: { horizontal: 'center' } };
    ws.AP3 = { t: 's', v: '검사위탁' };

    ws.AQ1 = { t: 's', v: 'F_과정' }; 
    ws.AQ1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AQ2 = { t: 's', v: 'F1' };
    ws.AQ2.s = { alignment: { horizontal: 'center' } };
    ws.AQ3 = { t: 's', v: '분자종양위원회 존재 여부' };

    ws.AR1 = { t: 's', v: 'G_치료' }; 
    ws.AR1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AR2 = { t: 's', v: 'G1' };
    ws.AR2.s = { alignment: { horizontal: 'center' } };
    ws.AR3 = { t: 's', v: '치료연계여부\n(비급여, 임상시험 약제 포함)' };
    
    ws.AS1 = { t: 's', v: 'H_기타' }; 
    ws.AS1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AS2 = { t: 's', v: 'H1' };
    ws.AS2.s = { alignment: { horizontal: 'center' } };
    ws.AS3 = { t: 's', v: '인체유래물 등의\n기증 동의여부' };

    ws.AT2 = { t: 's', v: 'H2' };
    ws.AT2.s = { alignment: { horizontal: 'center' } };
    ws.AT3 = { t: 's', v: '기타 특이사항' };

    ws.AU2 = { t: 's', v: '' };
    ws.AU2.s = { alignment: { horizontal: 'center' } };
    ws.AU3 = { t: 's', v: 'Tier' };

    ws.AV2 = { t: 's', v: '' };
    ws.AV2.s = { alignment: { horizontal: 'center' } };
    ws.AV3 = { t: 's', v: '분자병리 접수번호' };

    ws.AW2 = { t: 's', v: '' };
    ws.AW2.s = { alignment: { horizontal: 'center' } };
    ws.AW3 = { t: 's', v: '등록번호' };

    ws.AX2 = { t: 's', v: '' };
    ws.AX2.s = { alignment: { horizontal: 'center' } };
    ws.AX3 = { t: 's', v: 'tier I, II' };


    const a0 = [{ s: { c: 0, r: 0 }, e: { c: 0, r: 2 } },
    { s: { c: 1, r: 0 }, e: { c: 1, r: 2 } },
    { s: { c: 2, r: 0 }, e: { c: 12, r: 0 } },

    // 25.05.28
    //{ s: { c: 13, r: 0 }, e: { c: 15, r: 0 } },
    { s: { c: 13, r: 0 }, e: { c: 16, r: 0 } },
    
    // 25.05.28
    //{ s: { c: 16, r: 0 }, e: { c: 25, r: 0 } },
    { s: { c: 17, r: 0 }, e: { c: 25, r: 0 } },

    { s: { c: 26, r: 0 }, e: { c: 36, r: 0 } },
    { s: { c: 37, r: 0 }, e: { c: 40, r: 0 } },
    
    { s: { c: 41, r: 0 }, e: { c: 41, r: 0 } },
    { s: { c: 42, r: 0 }, e: { c: 42, r: 0 } },
    { s: { c: 43, r: 0 }, e: { c: 43, r: 0 } },
    { s: { c: 44, r: 0 }, e: { c: 45, r: 0 } },
    { s: { c: 46, r: 0 }, e: { c: 46, r: 0 } },
    { s: { c: 47, r: 0 }, e: { c: 47, r: 0 } },
    { s: { c: 48, r: 0 }, e: { c: 48, r: 0 } },
    { s: { c: 49, r: 0 }, e: { c: 49, r: 0 } }
 
    ];
    ws['!merges'] = a0;


    const workbook: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

}


