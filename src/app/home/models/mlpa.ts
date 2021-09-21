import { IPatient } from './patients';

export interface IData {
  seq: string;
  site: string;
  result?: string;
}
export interface IMlpa {
  type: string;
  title: string;
  data: IData[];
  result: string;
  conclusion: string;
  technique: string;
  comment?: string;
}


export function mlpaForm(
  resultStatus: string, // detected, not detected
  examin: string, // 검사자
  recheck: string, // 확인자
  title: string,
  acceptdate: string,
  firstReportDay: string,
  lastReportDay: string,
  patientInfo: IPatient,
  mlpaData: IMlpa,
): string {

  const patient = `<root>
	<Dataset id="ds_1">
	    <ColumnInfo>
			<Column id="patient" type="STRING" size="256"/>
			<Column id="result" type="STRING" size="256"/>
			<Column id="testinfo1" type="STRING" size="256"/>
			<Column id="testinfo2" type="STRING" size="256"/>
			<Column id="testinfo3" type="STRING" size="256"/>
			<Column id="testinfo4" type="STRING" size="256"/>
      <Column id="testinfo5" type="STRING" size="256"/>
			<Column id="title" type="STRING" size="256"/>
			<Column id="examdt" type="STRING" size="256"/>
			<Column id="examid" type="STRING" size="256"/>
			<Column id="signid" type="STRING" size="256"/>
		</ColumnInfo>
		<Rows>
			<Row>
				<Col id="patient">${patientInfo.name}, ${patientInfo.patientID} (${patientInfo.gender}/${patientInfo.age})</Col>
				<Col id="result">${mlpaData.result} ${resultStatus}</Col>
				<Col id="testinfo1">TARGET DISEASE: Acute lymphoblastic leukemia</Col>
				<Col id="testinfo2">METHOD: *Massively parallel sequencing</Col>
				<Col id="testinfo3">SPECIMEN: Genomic DNA isolated from Bone marrow</Col>
				<Col id="testinfo4">REQUEST: ${patientInfo.request}</Col>
        <Col id="testinfo5"> Analyzed gene : DMD on Xp21</Col>
				<Col id="title">${title}</Col>
				<Col id="examdt">${acceptdate}/${firstReportDay}/${lastReportDay} </Col>
				<Col id="examid">${examin}</Col>
				<Col id="signid">${recheck}</Col>
			</Row>
		</Rows>
	</Dataset>
	`;


  const variantHeader = `
	<Dataset id="ds_2">
	<ColumnInfo>
		<Column id="probe" type="STRING" size="256"/>
		<Column id="site" type="STRING" size="256"/>
		<Column id="result" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
	`;

  let data = '';
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < mlpaData.data.length; i++) {
    data = data + `
			<Row>
			 <Col id="probe">${mlpaData.data[i].seq}</Col>
			 <Col id="sitet">${mlpaData.data[i].site}</Col>
			 <Col id="result">${mlpaData.data[i].result}</Col>
		 </Row>
			`;
  }

  const variantBottom = `
     </Rows>
  </Dataset>
`;

  const comments = `<Dataset id="ds_3">
    <ColumnInfo>
        <Column id="comments" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
      <Row>
         <Col id="comments">${mlpaData.technique}</Col>
      </Row>
    </Rows>
</Dataset>
`;

  const comment1 = `<Dataset id="ds_4">
     <ColumnInfo>
        <Column id="comment1" type="STRING" size="256"/>
     </ColumnInfo>
     <Rows>
       <Row>
        <Col id="comment1">${mlpaData.conclusion}</Col>
       </Row>
     </Rows>
</Dataset>
`;

  const comment2 = `<Dataset id="ds_5">
      <ColumnInfo>
         <Column id="comment2" type="STRING" size="256"/>
      </ColumnInfo>
      <Rows>
         <Row>
            <Col id="comment2">${mlpaData.comment}</Col>
         </Row>
      </Rows>
</Dataset>
`;


  const rootbottom = `</root>`;

  return patient + variantHeader + data + variantBottom + comments + comment1 + comment2 + rootbottom;

}
