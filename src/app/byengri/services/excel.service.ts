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


