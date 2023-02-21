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


  public exportAsExcelFile(jsonData: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData, { skipHeader: true });
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public exportAsExcelFileWidth(jsonData: any[], excelFileName: string, width: any): void {

    console.log('[InHouse excel service]', jsonData);
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


  public exportIGTCR(jsonData: any[], excelFileName: string, width: any) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData, { skipHeader: true  });
    worksheet['!cols'] = width;
    worksheet['!rows'] = [{ hpx: 50 }];

    // worksheet.A0 = {   hpx: 50, width: 12   };
    worksheet.A1 = { t: 's', v: '이름' };
    worksheet.A1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };
    worksheet.B1 = { t: 's', v: '접수 Date' };
    worksheet.B1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.C1 = { t: 's', v: 'gene' };
    worksheet.C1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };      
    worksheet.D1 = { t: 's', v: 'Total read\r\n Count' };
    worksheet.D1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.E1 = { t: 's', v: 'Read\r\n of LQIC' };
    worksheet.E1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.F1 = { t: 's', v: '% \r\n of LQIC' };
    worksheet.F1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   }; 
    worksheet.G1 = { t: 's', v: 'Total B-Cell \r\n T-Cell count' };
    worksheet.G1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   }; 

    worksheet.H1 = { t: 's', v: 'Clonal sequence 1' };
    worksheet.H1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.H2 = { t: 's', v: 'sequence' };
    worksheet.H2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.I2 = { t: 's', v: 'Length' };
    worksheet.I2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.J2 = { t: 's', v: 'Raw count' };
    worksheet.J2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.K2 = { t: 's', v: 'V-gene' };
    worksheet.K2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.L2 = { t: 's', v: 'J-gene' };
    worksheet.L2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.M2 = { t: 's', v: '% total \r\n reads' };
    worksheet.M2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.N2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.N2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   


    worksheet.O1 = { t: 's', v: 'Clonal sequence 2' };
    worksheet.O1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.O2 = { t: 's', v: 'sequence' };
    worksheet.O2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.P2 = { t: 's', v: 'Length' };
    worksheet.P2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.Q2 = { t: 's', v: 'Raw count' };
    worksheet.Q2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.R2 = { t: 's', v: 'V-gene' };
    worksheet.R2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.S2 = { t: 's', v: 'J-gene' };
    worksheet.S2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.T2 = { t: 's', v: '% total \r\n reads' };
    worksheet.T2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.U2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.U2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   

    worksheet.V1 = { t: 's', v: 'Clonal sequence 3' };
    worksheet.V1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.V2 = { t: 's', v: 'sequence' };
    worksheet.V2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.W2 = { t: 's', v: 'Length' };
    worksheet.W2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.X2 = { t: 's', v: 'Raw count' };
    worksheet.X2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.Y2 = { t: 's', v: 'V-gene' };
    worksheet.Y2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.Z2 = { t: 's', v: 'J-gene' };
    worksheet.Z2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AA2 = { t: 's', v: '% total \r\n reads' };
    worksheet.AA2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.AB2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.AB2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   

    worksheet.AC1 = { t: 's', v: 'Clonal sequence 4' };
    worksheet.AC1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.AC2 = { t: 's', v: 'sequence' };
    worksheet.AC2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AD2 = { t: 's', v: 'Length' };
    worksheet.AD2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AE2 = { t: 's', v: 'Raw count' };
    worksheet.AE2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AF2 = { t: 's', v: 'V-gene' };
    worksheet.AF2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AG2 = { t: 's', v: 'J-gene' };
    worksheet.AG2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AH2 = { t: 's', v: '% total \r\n reads' };
    worksheet.AH2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.AI2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.AI2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   

    worksheet.AJ1 = { t: 's', v: 'Clonal sequence 5' };
    worksheet.AJ1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.AJ2 = { t: 's', v: 'sequence' };
    worksheet.AJ2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AK2 = { t: 's', v: 'Length' };
    worksheet.AK2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AL2 = { t: 's', v: 'Raw count' };
    worksheet.AL2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AM2 = { t: 's', v: 'V-gene' };
    worksheet.AM2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AN2 = { t: 's', v: 'J-gene' };
    worksheet.AN2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AO2 = { t: 's', v: '% total \r\n reads' };
    worksheet.AO2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.AP2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.AP2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   

    worksheet.AQ1 = { t: 's', v: 'Clonal sequence 6' };
    worksheet.AQ1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.AQ2 = { t: 's', v: 'sequence' };
    worksheet.AQ2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AR2 = { t: 's', v: 'Length' };
    worksheet.AR2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AS2 = { t: 's', v: 'Raw count' };
    worksheet.AS2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AT2 = { t: 's', v: 'V-gene' };
    worksheet.AT2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AU2 = { t: 's', v: 'J-gene' };
    worksheet.AU2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AV2 = { t: 's', v: '% total \r\n reads' };
    worksheet.AV2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.AW2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.AW2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };  

    worksheet.AX1 = { t: 's', v: 'Clonal sequence 7' };
    worksheet.AX1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.AX2 = { t: 's', v: 'sequence' };
    worksheet.AX2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AY2 = { t: 's', v: 'Length' };
    worksheet.AY2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.AZ2 = { t: 's', v: 'Raw count' };
    worksheet.AZ2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BA2 = { t: 's', v: 'V-gene' };
    worksheet.BA2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BB2 = { t: 's', v: 'J-gene' };
    worksheet.BB2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BC2 = { t: 's', v: '% total \r\n reads' };
    worksheet.BC2.s = { alignment: { horizontal: 'center', vertical: 'center',  wrapText: true }   };   
    worksheet.BD2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.BD2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };  

    worksheet.BE1 = { t: 's', v: 'Clonal sequence 8' };
    worksheet.BE1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.BE2 = { t: 's', v: 'sequence' };
    worksheet.BE2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BF2 = { t: 's', v: 'Length' };
    worksheet.BF2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BG2 = { t: 's', v: 'Raw count' };
    worksheet.BG2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BH2 = { t: 's', v: 'V-gene' };
    worksheet.BH2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BI2 = { t: 's', v: 'J-gene' };
    worksheet.BI2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BJ2 = { t: 's', v: '% total \r\n reads' };
    worksheet.BJ2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.BK2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.BK2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };  

    worksheet.BL1 = { t: 's', v: 'Clonal sequence 9' };
    worksheet.BL1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.BL2 = { t: 's', v: 'sequence' };
    worksheet.BL2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BM2 = { t: 's', v: 'Length' };
    worksheet.BM2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BN2 = { t: 's', v: 'Raw count' };
    worksheet.BN2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BO2 = { t: 's', v: 'V-gene' };
    worksheet.BO2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BP2 = { t: 's', v: 'J-gene' };
    worksheet.BP2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BQ2 = { t: 's', v: '% total \r\n reads' };
    worksheet.BQ2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.BR2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.BR2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   }; 

    worksheet.BS1 = { t: 's', v: 'Clonal sequence 10' };
    worksheet.BS1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.BS2 = { t: 's', v: 'sequence' };
    worksheet.BS2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BT2 = { t: 's', v: 'Length' };
    worksheet.BT2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BU2 = { t: 's', v: 'Raw count' };
    worksheet.BU2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BV2 = { t: 's', v: 'V-gene' };
    worksheet.BV2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BW2 = { t: 's', v: 'J-gene' };
    worksheet.BW2.s = { alignment: { horizontal: 'center', vertical: 'center' }   };   
    worksheet.BX2 = { t: 's', v: '% total \r\n reads' };
    worksheet.BX2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.BY2 = { t: 's', v: 'cell \r\n equivalent' };
    worksheet.BY2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   }; 

    worksheet.BZ1 = { t: 's', v: 'total' };
    worksheet.BZ1.s = { alignment: { horizontal: 'center', vertical: 'center' }   };  
    worksheet.BZ2 = { t: 's', v: 'Clonal\r\n total IGH \r\n read depth \r\n (%)*' };
    worksheet.BZ2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.CA2 = { t: 's', v: 'Clonal total\r\n nucelated cells \r\n (%)**' };
    worksheet.CA2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   };   
    worksheet.CB2 = { t: 's', v: 'Cell \r\n equivalent' };
    worksheet.CB2.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   }; 

    worksheet.CC1 = { t: 's', v: 'IGHV \r\n mutation' };
    worksheet.CC1.s = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true }   }; 
    worksheet.CD1 = { t: 's', v: '비고' };
    worksheet.CD1.s = { alignment: { horizontal: 'center', vertical: 'center' }   }; 
    worksheet.CE1 = { t: 's', v: 'Comment' };
    worksheet.CE1.s = { alignment: { horizontal: 'center', vertical: 'center' }   }; 


    const a0 = [{ s: { c: 0, r: 0 }, e: { c: 0, r: 1 } },
      { s: { c: 1, r: 0 }, e: { c: 1, r: 1 } },
      { s: { c: 2, r: 0 }, e: { c: 2, r: 1 } },
      { s: { c: 3, r: 0 }, e: { c: 3, r: 1 } },
      { s: { c: 4, r: 0 }, e: { c: 4, r: 1 } },
      { s: { c: 5, r: 0 }, e: { c: 5, r: 1 } },
      { s: { c: 6, r: 0 }, e: { c: 6, r: 1 } },
      { s: { c: 7, r: 0 }, e: { c: 13, r: 0 } },
      { s: { c: 14, r: 0 }, e: { c: 20, r: 0 } },
      { s: { c: 21, r: 0 }, e: { c: 27, r: 0 } },
      { s: { c: 28, r: 0 }, e: { c: 34, r: 0 } },
      { s: { c: 35, r: 0 }, e: { c: 41, r: 0 } },
      { s: { c: 42, r: 0 }, e: { c: 48, r: 0 } },
      { s: { c: 49, r: 0 }, e: { c: 55, r: 0 } },
      { s: { c: 56, r: 0 }, e: { c: 62, r: 0 } },
      { s: { c: 63, r: 0 }, e: { c: 69, r: 0 } },
      { s: { c: 70, r: 0 }, e: { c: 76, r: 0 } },
      { s: { c: 77, r: 0 }, e: { c: 79, r: 0 } },
      { s: { c: 80, r: 0 }, e: { c: 80, r: 1 } }, 
      { s: { c: 81, r: 0 }, e: { c: 81, r: 1 } }, 
      { s: { c: 82, r: 0 }, e: { c: 82, r: 1 } }, 
      ];
     
      worksheet['!merges'] = a0;
      
      const workbook: XLSX.WorkBook = { Sheets: { data: worksheet  }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
      this.saveAsExcelFile(excelBuffer, excelFileName);
  }



  public exortAsNGSTest(jsonData: any[], excelFileName: string, width: any[]): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData, { skipHeader: true });
    ws['!cols'] = width;
    ws['!rows'] = [{ hpx: 57 }];
    /*
     ws.A.s = { alignment: { horizontal: 'center' } };
     ws.B.s = { alignment: { horizontal: 'center' } };
     ws.C.s = { alignment: { horizontal: 'center' } };
     ws.D.s = { alignment: { horizontal: 'center' } };
     ws.E.s = { alignment: { horizontal: 'center' } };
     ws.F.s = { alignment: { horizontal: 'center' } };
     ws.G.s = { alignment: { horizontal: 'center' } };
     ws.H.s = { alignment: { horizontal: 'center' } };
     ws.I.s = { alignment: { horizontal: 'center' } };
     ws.J.s = { alignment: { horizontal: 'center' } };
     ws.K.s = { alignment: { horizontal: 'center' } };
     ws.L.s = { alignment: { horizontal: 'center' } };
     ws.M.s = { alignment: { horizontal: 'center' } };
     ws.N.s = { alignment: { horizontal: 'center' } };
     ws.O.s = { alignment: { horizontal: 'center' } };
     ws.P.s = { alignment: { horizontal: 'center' } };
     ws.Q.s = { alignment: { horizontal: 'center' } };
     ws.R.s = { alignment: { horizontal: 'center' } };
     ws.S.s = { alignment: { horizontal: 'center' } };
     ws.T.s = { alignment: { horizontal: 'center' } };
     ws.U.s = { alignment: { horizontal: 'center' } };
     ws.V.s = { alignment: { horizontal: 'center' } };
     ws.W.s = { alignment: { horizontal: 'center' } };
     ws.X.s = { alignment: { horizontal: 'center' } };
     ws.Y.s = { alignment: { horizontal: 'center' } };
     ws.Z.s = { alignment: { horizontal: 'center' } };
     ws.AA.s = { alignment: { horizontal: 'center' } };
     ws.AB.s = { alignment: { horizontal: 'center' } };
     ws.AC.s = { alignment: { horizontal: 'center' } };
     ws.AD.s = { alignment: { horizontal: 'center' } };
     ws.AE.s = { alignment: { horizontal: 'center' } };
     ws.AF.s = { alignment: { horizontal: 'center' } };
     ws.AG.s = { alignment: { horizontal: 'center' } };
     ws.AH.s = { alignment: { horizontal: 'center' } };
     ws.AI.s = { alignment: { horizontal: 'center' } };
     ws.AJ.s = { alignment: { horizontal: 'center' } };
     ws.AK.s = { alignment: { horizontal: 'center' } };
     ws.AL.s = { alignment: { horizontal: 'center' } };
    */


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
    ws.E3 = { t: 's', v: '등록번호' };
    ws.F2 = { t: 's', v: 'A5' };
    ws.F2.s = { alignment: { horizontal: 'center' } };
    ws.F3 = { t: 's', v: '환자명' };
    ws.G2 = { t: 's', v: 'A6' };
    ws.G2.s = { alignment: { horizontal: 'center' } };
    ws.G3 = { t: 's', v: '생년월일' };
    ws.H2 = { t: 's', v: 'A7' };
    ws.H2.s = { alignment: { horizontal: 'center' } };
    ws.H3 = { t: 's', v: '성별' };
    ws.I2 = { t: 's', v: 'A8' };
    ws.I2.s = { alignment: { horizontal: 'center' } };
    ws.I3 = { t: 's', v: '청구 여부' };
    ws.J2 = { t: 's', v: 'A8-1' };
    ws.J2.s = { alignment: { horizontal: 'center' } };
    ws.J3 = { t: 's', v: '접수번호' };
    ws.K2 = { t: 's', v: 'A8-2' };
    ws.K2.s = { alignment: { horizontal: 'center' } };
    ws.K3 = { t: 's', v: '명일련' };
    ws.L2 = { t: 's', v: 'A9' };
    ws.L2.s = { alignment: { horizontal: 'center' } };
    ws.L3 = { t: 's', v: '본인부담률' };
    ws.M2 = { t: 's', v: 'A9-1' };
    ws.M2.s = { alignment: { horizontal: 'center' } };
    ws.M3 = { t: 's', v: '본임부담률 90% 분류 ' };
    ws.N2 = { t: 's', v: 'A9-2' };
    ws.N2.s = { alignment: { horizontal: 'center' } };
    ws.N3 = { t: 's', v: '90% 본인부담률 소견서 작성 여부' };
    ws.O2 = { t: 's', v: '' };
    ws.O3 = { t: 's', v: '패널명' };
    ws.P1 = { t: 's', v: 'B_패널' };
    ws.P1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.P2 = { t: 's', v: 'B1' };
    ws.P2.s = { alignment: { horizontal: 'center' } };
    ws.P3 = { t: 's', v: '패널구분' };
    ws.Q2 = { t: 's', v: 'B2' };
    ws.Q2.s = { alignment: { horizontal: 'center' } };
    ws.Q3 = { t: 's', v: '패널관리번호' };
    ws.R1 = { t: 's', v: 'C_상병' };
    ws.R1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.R2 = { t: 's', v: 'C1' };
    ws.R2.s = { alignment: { horizontal: 'center' } };
    ws.R3 = { t: 's', v: '검사 전\n상병분류기호' };
    ws.S2 = { t: 's', v: '' };
    ws.S3 = { t: 's', v: '검사전상병명' };
    ws.T2 = { t: 's', v: 'C2' };
    ws.T2.s = { alignment: { horizontal: 'center' } };
    ws.T3 = { t: 's', v: '검사 후\n상병분류기호' };
    ws.U2 = { t: 's', v: '' };
    ws.U3 = { t: 's', v: '검사후상병명' };
    ws.V2 = { t: 's', v: 'C3' };
    ws.V2.s = { alignment: { horizontal: 'center' } };
    ws.V3 = { t: 's', v: '해당질환\n가족력' };
    ws.W2 = { t: 's', v: 'C4-1' };
    ws.W2.s = { alignment: { horizontal: 'center' } };
    ws.W3 = { t: 's', v: '고형암 여부' };
    ws.X2 = { t: 's', v: 'C4-2' };
    ws.X2.s = { alignment: { horizontal: 'center' } };
    ws.X3 = { t: 's', v: '진행성, 전이성, 재발성 고형암' };
    ws.Y2 = { t: 's', v: 'C4-3' };
    ws.Y2.s = { alignment: { horizontal: 'center' } };
    ws.Y3 = { t: 's', v: '병기구분' };
    ws.Z2 = { t: 's', v: 'C4-3-1' };
    ws.Z2.s = { alignment: { horizontal: 'center' } };
    ws.Z3 = { t: 's', v: 'Stage' };
    ws.AA2 = { t: 's', v: 'C4-3-2' };
    ws.AA2.s = { alignment: { horizontal: 'center' } };
    ws.AA3 = { t: 's', v: '행동양식 분류부호' };
    ws.AB1 = { t: 's', v: 'D_검체' }; ws.AB1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AB2 = { t: 's', v: 'D1' };
    ws.AB2.s = { alignment: { horizontal: 'center' } };
    ws.AB3 = { t: 's', v: '검체종류' };
    ws.AC2 = { t: 's', v: 'D1-1' };
    ws.AC2.s = { alignment: { horizontal: 'center' } };
    ws.AC3 = { t: 's', v: '검체기타' };
    ws.AD2 = { t: 's', v: 'D2' };
    ws.AD2.s = { alignment: { horizontal: 'center' } };
    ws.AD3 = { t: 's', v: '검체접수일' };
    ws.AE2 = { t: 's', v: 'D3' };
    ws.AE2.s = { alignment: { horizontal: 'center' } };
    ws.AE3 = { t: 's', v: '검사보고일' };
    ws.AF1 = { t: 's', v: 'E_검사결과' };
    ws.AF2 = { t: 's', v: 'E1' };
    ws.AF2.s = { alignment: { horizontal: 'center' } };
    ws.AF3 = { t: 's', v: 'PV/LPV 검출 여부' };
    ws.AG2 = { t: 's', v: 'E1-1' };
    ws.AG2.s = { alignment: { horizontal: 'center' } };
    ws.AG3 = { t: 's', v: 'PV/LPV 검출 유전자' };
    ws.AH2 = { t: 's', v: 'E2' };
    ws.AH2.s = { alignment: { horizontal: 'center' } };
    ws.AH3 = { t: 's', v: 'VUS 검출여부' };
    ws.AI1 = { t: 's', v: '' };
    ws.AI2 = { t: 's', v: 'E2-1' };
    ws.AI2.s = { alignment: { horizontal: 'center' } };
    ws.AI3 = { t: 's', v: 'VUS 검출 유전자' };
    ws.AJ1 = { t: 's', v: 'F_기타' }; ws.AJ1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AJ2 = { t: 's', v: 'F1' };
    ws.AJ2.s = { alignment: { horizontal: 'center' } };
    ws.AJ3 = { t: 's', v: '검사위탁' };
    ws.AK2 = { t: 's', v: 'F2' };
    ws.AK2.s = { alignment: { horizontal: 'center' } };
    ws.AK3 = { t: 's', v: '인체유래물 등의\n기증 동의여부' };
    ws.AL2 = { t: 's', v: 'F3' };
    ws.AL2.s = { alignment: { horizontal: 'center' } };
    ws.AL3 = { t: 's', v: '기타 특이사항' };



    const a0 = [{ s: { c: 0, r: 0 }, e: { c: 0, r: 2 } },
    { s: { c: 1, r: 0 }, e: { c: 1, r: 2 } },
    { s: { c: 2, r: 0 }, e: { c: 13, r: 0 } },
    { s: { c: 14, r: 0 }, e: { c: 14, r: 0 } },
    { s: { c: 15, r: 0 }, e: { c: 16, r: 0 } },
    { s: { c: 17, r: 0 }, e: { c: 26, r: 0 } },
    { s: { c: 27, r: 0 }, e: { c: 30, r: 0 } },
    { s: { c: 31, r: 0 }, e: { c: 33, r: 0 } },
    { s: { c: 34, r: 0 }, e: { c: 34, r: 0 } },
    { s: { c: 35, r: 0 }, e: { c: 37, r: 0 } },
    ];
    ws['!merges'] = a0;


    const workbook: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

}


