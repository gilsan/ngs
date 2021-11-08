export interface IMutation {
  id: string;
  buccal: string;
  patient_name: string;
  register_number: string;
  fusion: string;
  gene: string;
  functional_impact: string;
  transcript: string;
  exon_intro: string;
  nucleotide_change: string;
  amino_acid_change: string;
  zygosity: string;
  vaf: string;
  reference: string;
  cosmic_id: string;
  sift_polyphen_mutation_taster: string;
  buccal2: string;
  igv: string;
  sanger: string;
  exac?: string;
  exac_east_asia?: string;
  krgdb?: string;
  etc1?: string;
  etc2?: string;
  etc3?: string;
  display?: string;
  type?: string;
  rsid?: string;
  genbank_accesion?: string;
  dbsnp_hgmd?: string;
  gnomad_eas?: string;
  omim?: string;

}

export interface IGenetic {
  id?: string;
  gene: string;
  functional_impact: string;
  transcript?: string;
  name: string;
  patientID: string;
  exon: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  dbSNPHGMD: string;
  gnomADEAS: string;
  OMIM: string;
  igv: string;
  sanger: string;
}

export interface ISEQ {
  id?: string;
  name: string;
  functional_impact: string;
  gene: string;
  patientID?: string;
  exonintron: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  rsid: string;
  genbankaccesion: string;
}

export interface IAML {
  id?: string;
  name: string;
  gene: string;
  functional_impact: string;
  transcript: string;
  exon: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  vaf: string;
  reference: string;
  cosmicid: string;
  igv: string;
  sanger: string;
}
