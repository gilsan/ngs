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
    const width = [{ width: 12 }];

    ws['!cols'] = width ;
    ws['!rows'] = [{ hpx: 57 }]; 

    // 헤더
    ws.A1 = { t: 's', v: '접수일' };
    ws.A1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.B1 = { t: 's', v: '이름' };
    ws.B1.s = { alignment: { horizontal: 'center', vertical: 'center' } };   
    ws.C1 = { t: 's', v: 'ID' };
    ws.C1.s = { alignment: { horizontal: 'center', vertical: 'center' } }; 
    

    // 액셀 헤더 row줄 조정
    const a0 = [
      { s: { c: 0, r: 0 }, e: { c: 0, r: 1 } }, { s: {c: 1, r: 0}, e: {c:1, r: 1}} ,{ s: {c: 2, r: 0}, e: {c:2, r: 2}} // A, B,C
    
    ];

      ws['!merges'] = a0;


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

    
    ws.AF2 = { t: 's', v: 'D4-1' };
    ws.AF2.s = { alignment: {horizontal: 'center'} };
    ws.AF3 = { t: 's', v: 'organ'};

    ws.AG2 = { t: 's', v: 'D4-2'};
    ws.AG2.s = { alignment: { horizontal: 'center'} };
    ws.AG3 = { t: 's', v: '조직유형(histologic type)'};

    ws.AH2 = { t: 's', v: ''};
    ws.AH3 = { t: 's', v: ''};


    ws.AI2 = { t: 's', v: 'D4-3'};
    ws.AI2.s = { alignment: { horizontal: 'center'} };
    ws.AI3 = { t: 's', v: '검사시행사유'};

    ws.AJ2 = { t: 's', v: 'D5-1'};
    ws.AJ2.s = { alignment: { horizontal: 'center'}};
    ws.AJ3 = { t: 's', v: '단일유전자검사 시행여부'};

    ws.AK2 = { t: 's', v: 'D5-2'};
    ws.AK2.s = { alignment: { horizontal: 'center'}};
    ws.AK3 = { t: 's', v: '단일유전자검사 시행일' };

    ws.AL2 = { t: 's', v: 'D5-3'};
    ws.AL2.s = { alignment: { horizontal: 'center'}};
    ws.AL3 = { t: 's', v: '단일유전자검사 검사 종목' };

    ws.AM1 = { t: 's', v: 'E_검사결과' };
    ws.AM2 = { t: 's', v: 'E1' };
    ws.AM2.s = { alignment: { horizontal: 'center' } }; 
    ws.AM3 = { t: 's', v: 'PV/LPV 검출 여부' };


    ws.AN2 = { t: 's', v: 'E1-1' };
    ws.AN2.s = { alignment: { horizontal: 'center' } }; 
    ws.AN3 = { t: 's', v: 'PV/LPV 검출 유전자' };

    
    ws.AO2 = { t: 's', v: 'E2' };
    ws.AO2.s = { alignment: { horizontal: 'center' } };
    ws.AO3 = { t: 's', v: 'VUS 검출여부' };

    ws.AP1 = { t: 's', v: '' };
    ws.AP2 = { t: 's', v: 'E2-1' };
    ws.AP2.s = { alignment: { horizontal: 'center' } };
    ws.AP3 = { t: 's', v: 'VUS 검출 유전자' };

    ws.AQ1 = { t: 's', v: 'F_기타' }; 
    ws.AQ1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AQ2 = { t: 's', v: 'F1' };
    ws.AQ2.s = { alignment: { horizontal: 'center' } };
    ws.AQ3 = { t: 's', v: '검사위탁' };

    // // 23.11.30
    ws.AR1 = { t: 's', v: 'F_과정' }; 
    ws.AR1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AR2 = { t: 's', v: 'F1' };
    ws.AR2.s = { alignment: { horizontal: 'center' } };
    ws.AR3 = { t: 's', v: '분자종양위원회 존재 여부' };

    ws.AS1 = { t: 's', v: 'G_치료' }; 
    ws.AS1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AS2 = { t: 's', v: 'G1' };
    ws.AS2.s = { alignment: { horizontal: 'center' } };
    ws.AS3 = { t: 's', v: '치료연계여부\n(비급여, 임상시험 약제 포함)' };
    
    ws.AT1 = { t: 's', v: 'H_기타' }; 
    ws.AT1.s = { alignment: { horizontal: 'center', vertical: 'center' } };
    ws.AT2 = { t: 's', v: 'H1' };
    ws.AT2.s = { alignment: { horizontal: 'center' } };
    ws.AT3 = { t: 's', v: '인체유래물 등의\n기증 동의여부' };

    ws.AU2 = { t: 's', v: 'H2' };
    ws.AU2.s = { alignment: { horizontal: 'center' } };
    ws.AU3 = { t: 's', v: '기타 특이사항' };

    ws.AV2 = { t: 's', v: '' };
    ws.AV2.s = { alignment: { horizontal: 'center' } };
    ws.AV3 = { t: 's', v: 'Tier' };

/* 23.11.30
    ws.AR2 = { t: 's', v: 'F2' };
    ws.AR2.s = { alignment: { horizontal: 'center' } };
    ws.AR3 = { t: 's', v: '인체유래물 등의\n기증 동의여부' };

    ws.AS2 = { t: 's', v: 'F3' };
    ws.AS2.s = { alignment: { horizontal: 'center' } };
    ws.AS3 = { t: 's', v: '기타 특이사항' };
*/

/* 23.11.16
    ws.AL1 = { t: 's', v: 'E_검사결과' };
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

    ws.AQ2 = { t: 's', v: 'F2' };
    ws.AQ2.s = { alignment: { horizontal: 'center' } };
    ws.AQ3 = { t: 's', v: '인체유래물 등의\n기증 동의여부' };

    ws.AR2 = { t: 's', v: 'F3' };
    ws.AR2.s = { alignment: { horizontal: 'center' } };
    ws.AR3 = { t: 's', v: '기타 특이사항' };
  */

    

   /*
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
   */




    const a0 = [{ s: { c: 0, r: 0 }, e: { c: 0, r: 2 } },
    { s: { c: 1, r: 0 }, e: { c: 1, r: 2 } },
    { s: { c: 2, r: 0 }, e: { c: 13, r: 0 } },
    { s: { c: 14, r: 0 }, e: { c: 14, r: 0 } },
    { s: { c: 15, r: 0 }, e: { c: 16, r: 0 } },
    // 23.11.16
    { s: { c: 17, r: 0 }, e: { c: 26, r: 0 } },
    { s: { c: 27, r: 0 }, e: { c: 37, r: 0 } },
    { s: { c: 38, r: 0 }, e: { c: 41, r: 0 } },
    
    // 23.11.30
    //{ s: { c: 42, r: 0 }, e: { c: 44, r: 0 } },
    { s: { c: 42, r: 0 }, e: { c: 42, r: 0 } },
    { s: { c: 43, r: 0 }, e: { c: 43, r: 0 } },
    { s: { c: 44, r: 0 }, e: { c: 44, r: 0 } },
    { s: { c: 45, r: 0 }, e: { c: 46, r: 0 } },
    { s: { c: 47, r: 0 }, e: { c: 47, r: 0 } },
   // { s: { c: 17, r: 0 }, e: { c: 26, r: 0 } },
   // { s: { c: 27, r: 0 }, e: { c: 36, r: 0 } },
   // { s: { c: 37, r: 0 }, e: { c: 40, r: 0 } },
   // { s: { c: 41, r: 0 }, e: { c: 43, r: 0 } },

    // { s: { c: 34, r: 0 }, e: { c: 34, r: 0 } },
    // { s: { c: 35, r: 0 }, e: { c: 37, r: 0 } },
    ];
    ws['!merges'] = a0;


    const workbook: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

}


