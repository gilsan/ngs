export interface IRESARCHLIST {
  name: string;
  age: string;
  gender: string;
  patientID: string;
  test_code?: string;
  testname?: string;
  reportTitle: string;
  specimenNo: string;
}

export interface ITYPE {
  id?: string;
  code: string;
  report: string;
  type?: string;
}
