export interface IITEM {
  id?: string;
  date?: string;
  gene: string;
  amino: string;
  direction: string;
  comment?: string;
  pathologyNum?: string;
  isSaved?: boolean;
}

export interface IMU {
  ID: string;
  aminoAcidChange: string;
  direction: string;
  gene: string;
  nucleotideChange: string;
  seq: string;
  tier: string;
  variantAlleleFrequency: string;
}

export interface IFU {
  breakpoint: string;
  direction: string;
  functions: string;
  gene: string;
  readcount: string;
  seq: string;
  tier: string;
}
