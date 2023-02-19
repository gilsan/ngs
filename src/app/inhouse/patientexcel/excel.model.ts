export interface IAMLALL {
  prescription: string;
  title: string;
  name: string;
  gender: string;
  age: string;
  patientID: string;
  barcode: string;
  acceptdate: string;
  reportdate: string;
  researchPrescriptionCode: string;
  result: string;
  gene: string;
  functionalImpact: string;
  transcript: string;
  exonIntro: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  vafPercent: string;
  reference: string;
  cosmic_id: string;
  tsvname: string;
  LeukemiaAssociatedFusion: string;
  IKZF1deletion: string;
  ChromosomalAnalysis: string;
  FLT3ITD:string,
};

export interface ILYM {
  prescription: string;
  title: string;
  name: string;
  gender: string;
  age: string;
  patientID: string;
  barcode: string;
  acceptdate: string;
  reportdate: string;
  researchPrescriptionCode: string;
  diagnosis: string;
  chromosomalAnalysis: string;
  tsvname: string;
  result: string;
  gene: string;
  functionalImpact: string;
  transcript: string;
  exonIntro: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  vafPercent: string;
  reference: string;
  cosmic_id: string;
}

export interface IMDS {
  prescription: string;
  title: string;
  name: string;
  gender: string;
  age: string;
  patientID: string;
  barcode: string;
  acceptdate: string;
  reportdate: string;
  researchPrescriptionCode: string;
  diagnosis: string;
  geneticTest: string;
  chromosomalAnalysis: string;
  excelname: string;
  result: string;
  gene: string;
  functionalImpact: string;
  transcript: string;
  exonIntro: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  vafPercent: string;
  reference: string;
  cosmic_id: string;
}

export interface IGenetic {
  prescription: string;
  title: string;
  name: string;
  gender: string;
  age: string;
  patientID: string;
  barcode: string;
  acceptdate: string;
  reportdate: string;
  researchPrescriptionCode: string;
  dbSNPHGMD: string;
  gnomADEAS: string;
  OMIM: string;
  diagnosis: string;
  excelname: string;
  result: string;
  gene: string;
  functionalImpact: string;
  transcript: string;
  exonIntro: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  comment?: string;
}

export interface ISEQ {
  prescription: string;
  title: string;
  name: string;
  gender: string;
  age: string;
  patientID: string;
  barcode: string;
  acceptdate: string;
  reportdate: string;
  researchPrescriptionCode: string;
  result: string;
  gene: string;
  type: string;
  exonIntro: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  rsid: string;
  genbank: string;
  comment?: string;

}

export interface IIGTCR {
  IGHV_mutation : string;
bigo : string;
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
}




