export interface IComments {
  id: string;
  type: string;
  gene: string;
  comment: string;
  reference: string;
  variant_id: string;
  display?: string;
}

export interface ICodement {
  id: string;
  code: string;
  report: string;
  type: string;
}

export interface ICodecomment {
  id: string;
  type: string;
  code: string;
  comment: string;
  seq?: string;
}
