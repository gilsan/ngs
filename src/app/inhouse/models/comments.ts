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
  comment: string;
  type: string;
  mode?: string;
}

// export interface ICode {
//   id: string;
//   type: string;
//   report: string;
//   code: string;
// }
