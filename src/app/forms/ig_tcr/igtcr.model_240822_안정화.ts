export interface IPatient {
    id?: number;
    name: string;
    patientID: string;
    age: string;
    gender: string;
    testedNum: string;
    leukemiaAssociatedFusion?: string;
    leukemiaassociatedfusion?: string;
    IKZK1Deletion?: string;
    FLT3ITD?: string;
    bonemarrow?: string;
    diagnosis?: string;
    genetictest?: string;
    chromosomalAnalysis: string;
    chromosomalanalysis?: string;
    targetDisease: string;
    method: string;
    reportTitle?: string;
    accept_date: string;
    accept_date2?: string;
    specimen: string;
    detected?: string;
    request: string;
    tsvFilteredFilename?: string;
    path?: string;
    createDate?: Date;
    tsvFilteredStatus?: string;
    tsvFilteredDate?: Date;
    bamFilename?: string;
    sendEMR?: string;
    sendEMRDate?: string;
    report_date?: string;
    specimenNo: string;
    test_code?: string;
    codetest?: string;
    screenstatus: string;
    recheck?: string; // 확인자
    examin?: string; // 검사자
    vusmsg?: string;
    verfile?: string; // tsv version
    worker?: string;
    functional_impact?: string;
    genetic1?: string;
    genetic2?: string;
    genetic3?: string;
    genetic4?: string;
    gbn?: string;
    saveyn?: string;
  }

  export interface IClonal {
    InputActive: boolean;
    IGHV_mutation : string;
    bigo : string;
    checked: boolean;
    cell_equipment1: string;
    cell_equipment2: string;
    cell_equipment3: string;
    cell_equipment4: string;
    cell_equipment5: string;
    cell_equipment6: string;
    cell_equipment7: string;
    cell_equipment8: string;
    cell_equipment9: string;
    cell_equipment10: string;
    comment: string;
    gene: string;
    j_gene1: string;
    j_gene2: string;
    j_gene3: string;
    j_gene4: string;
    j_gene5: string;
    j_gene6: string;
    j_gene7: string;
    j_gene8: string;
    j_gene9: string;
    j_gene10: string;
    percent_of_LQIC: string;
    percent_total_reads1: string;
    percent_total_reads2: string;
    percent_total_reads3: string;
    percent_total_reads4: string;
    percent_total_reads5: string;
    percent_total_reads6: string;
    percent_total_reads7: string;
    percent_total_reads8: string;
    percent_total_reads9: string;
    percent_total_reads10: string;
    raw_count1: string;
    raw_count2: string;
    raw_count3: string;
    raw_count4: string;
    raw_count5: string;
    raw_count6: string;
    raw_count7: string;
    raw_count8: string;
    raw_count9: string;
    raw_count10: string;
    read_of_LQIC?: string;
    report_date: string;
    sequence1: string;
    sequence2: string;
    sequence3: string;
    sequence4: string;
    sequence5: string;
    sequence6: string;
    sequence7: string;
    sequence8: string;
    sequence9: string;
    sequence10: string;
    sequence_length1: string;
    sequence_length2: string;
    sequence_length3: string;
    sequence_length4: string;
    sequence_length5: string;
    sequence_length6: string;
    sequence_length7: string;
    sequence_length8: string;
    sequence_length9: string;
    sequence_length10: string;
    specimenNo: string;
    total_Bcell_Tcell_count: string;
    total_IGH_read_depth: string;
    total_cell_equipment: string;
    total_nucelated_cells: string;
    total_read_count: string;
    use_yn1: boolean;
    v_gene1: string;
    v_gene2: string;
    v_gene3: string;
    v_gene4: string;
    v_gene5: string;
    v_gene6: string;
    v_gene7: string;
    v_gene8: string;
    v_gene9: string;
    v_gene10: string;
    density: string;
    deleted: string;
    }
    
    export interface ITcrData {
      specimenNo: string;
      method: string;
      recheck: string;
      examin: string;
      sendEMRDate: string;
      report_date: string;
      comment: string;
      init_result1: string;
      init_result2: string;
      init_comment: string;
      fu_result: string;
      fu_comment: string;
      detected: string;
      patientid: string;
      trbtrg: string;
      data: IClonal[];
      //24.07.26
      saveyn?: string;
    }

    export interface IMRDData {
      dateSequence: string;
      reportDate: string;
      totalReadCount: string;
      readOfLQIC: string;
      totalBcellTcellCount : string;
      totalIGHReadDepth : string;
      totalNucelatedCells : string;
      totalCellEquipment : string;

    }


    export interface INoGraph {
        index: string;
        vregion: string;
        jregion: string;
        length: string;
        totalIGHreadDepth: string;
        clonalIGHDepth: number;
        clonalTotalIGHReadDepth: string;
        clonalCellEquivalent: string;
        ClonalCellSequence: string;
        PercentTotalReads: string;
      }
      
      export interface IWGraph {
        totalIGHreadDepth: string;
        LQICReadDepth: string;
        clonalIGHDepth: string;
        clonalTotalIGHReadDepth: string;
        clonalTotalNucelatedCells: string;
        clonalCellEquivalent: string;
      }

    /// 연구용
    export interface IRESARCHLIST {
      name: string;
      age: string;
      gender: string;
      patientID: string;
      test_code?: string;
      testname?: string;
      reportTitle?: string;
      specimenNo: string;
    }

    export interface ITYPE {
      id?: string;
      code: string;
      report: string;
      type?: string;
    }

    export interface ISearch {
      start: string;
      end: string;
      specimenNo : string;
      patientid: string;
      patientname: string;
      status : string;
      sheet: string;
      research1: string;
    }