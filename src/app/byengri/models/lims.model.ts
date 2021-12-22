
export interface ILIMS {
  id: string;                   // lims id
  pathology_num: string;        // 병리번호
  rel_pathology_num: string;    // 관련병리번호
  prescription_date: string;    // 접수일자
  patientID: string;            // 등록번호',
  name: string;                 // 환자명
  gender: string;               // 성별(F/M)
  age?: string;
  path_type: string;            // 구분(bx,op)
  block_cnt: string;            // 블록수
  key_block: string;            // key block
  prescription_code: string;    // 검체
  test_code: string;            // 암종
  tumorburden: string;          // tumor %
  nano_ng: string;              // NanoDrop ng/ul
  nano_280: string;             // 260/280
  nano_230: string;             // 260/230
  nano_dil: string;             // dil비율
  ng_ui: string;                // Qubit ng/ul
  dan_rna?: number;             // DNA  함수: 20/ng_ui * 5
  dna_rna?: number;
  dw: number;                   // dw  함수: 20 - dna_rna
  tot_ct: string;               // toal Vol
  ct: string;                   // Ct값
  quantity: string;             // quantity
  quantity_2: number;           // quantity/2(농도) 함수: quantity/2
  quan_dna: number;             // quantity dna 함수: 20/quantity_2
  te: number;                   // TE  함수: 5.5 - quan_dna
  quan_tot_vol: string;         // toal Vol
  lib_hifi: string;             // Lib HIFI PCR Cycle
  pm: string;                   // pM
  x100: number;                 // x100  함수: pm * 100
  lib: string;                  // library
  lib_dw: number;               // DW (50pm)  함수: (x100/50) - 1
  lib2: string;                 // library
  lib2_dw: number;              // DW (50pm)  함수: lib_dw * 3

}

export interface IUSER {
  approved: string;
  dept: string;
  dept_nm: string;
  id: string;
  login_date: string;
  part_nm: string;
  password: string;
  pickselect: string;
  reg_date: string;
  user_gb: string;
  user_gb_nm: string;
  user_id: string;
  user_nm: string;
  uuid: string;
}

export interface IDNATYPE {
  pathology_num: string;
  nano_280: string;
  nano_230: string;
  ng_ui: string;
}

export interface IRNATYPE {
  pathology_num: string;
  nano_280: string;
  nano_230: string;
  ng_ui: string;
}


/*
        "pathology_num": "M20-008029",      // 병리번호
        "rel_pathology_num": "C20-013467",  // 관련병리번호
        "patientID": "28658052",            // 등록번호",
        "prescription_date": "20211221",    // 접수일자
        "gender": "F",                      // 성별(F/M)
        "age": "30",
        "name": "이영분",                        // 환자명
        "id": 453,                          // lims id
        "prescription_code": "Non-Small Cell Lung Cancer",    // 검체
        "test_code": "2",                     // 암종
        "path_type": "OP",                    // 구분(bx,op)
        "block_cnt":"0",                      // 블록수
        "key_block": "3",                     // key block
        "tumorburden": "4",                   // tumor %
        "report_date": "1900-01-01T00:00:00.000Z", //
        "nano_ng": "5",                       // NanoDrop ng/ul
        "nano_280": "6",                      // 260/280
        "nano_230": "7",                      // 260/230
        "nano_dil": "8",                      // dil비율
        "ng_ui":"9"                           // Qubit ng/ul
        "dw": "10",                           // dw
        "tot_ct": "11",                       // toal Vol
        "ct": "12",                           // Ct값
        "quantity": "13",                     // quantity
        "quantity_2": "14",                   // quantity/2(농도)
        "quan_dna":"121",                     // quantity dna
        "dan_rna": "9",                       // DNA
        "te": "15",                           // TE
        "quan_tot_vol": "16",                 // toal Vol
        "lib_hifi": "17",                     // Lib HIFI PCR Cycle
        "pm": "18",                           // pM
        "x100": "19",                         // x100
        "lib": "20",                          // library
        "lib_dw": "21",                       // DW (50pm)
        "lib2": "22",                         // library
        "lib2_dw": "23"                       // DW (50pm)
        "dna_rna_gbn": "0"                    // Dna/rna 구분 (0:DNA, 1:RNA)

*/
