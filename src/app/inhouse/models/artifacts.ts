export interface IArtifacts {
  id: string;
  genes: string;
  location: string;
  exon: string;
  transcript: string;
  coding: string;
  amino_acid_change: string;
  display?: string;
  type?: string;
  userid?: string;
  savetime: string;
  user_nm?: string;
}

export interface IMent {
  id?: string;
  code: string;
  report: string;
  target: string;
  specimen: string;
  analyzedgene?: string;
  method: string;
  comment: string;
  comment1: string;
  comment2: string;
  mode?: string;
  type: string;
}




