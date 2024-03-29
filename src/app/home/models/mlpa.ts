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
  target: string,
  testmethod: string,
  analyzedgene: string,
  acceptdate: string,
  firstReportDay: string,
  lastReportDay: string,
  patientInfo: IPatient,
  mlpaData: IMlpa,
  spcimen: string
): string {

  const patient = `<root>
	<Dataset id="ds_1">
	    <ColumnInfo>
			<Column id="patient" type="STRING" size="256"/>
			<Column id="result" type="STRING" size="256"/>
      <Column id="rsltright1" type="STRING" size="256"/>
			<Column id="rsltright2" type="STRING" size="256"/>
			<Column id="rsltleft1" type="STRING" size="256"/>
			<Column id="rsltleft2" type="STRING" size="256"/>
      <Column id="rsltcenter1" type="STRING" size="256"/>
      <Column id="rsltcenter2" type="STRING" size="256"/>
			<Column id="testinfo1" type="STRING" size="256"/>
			<Column id="testinfo2" type="STRING" size="256"/>
			<Column id="testinfo3" type="STRING" size="256"/>
			<Column id="testinfo4" type="STRING" size="256"/>
      <Column id="testinfo5" type="STRING" size="256"/>
      <Column id="opnion" type="STRING" size="256"/>
			<Column id="title" type="STRING" size="256"/>
			<Column id="examdt" type="STRING" size="256"/>
			<Column id="examid" type="STRING" size="256"/>
			<Column id="signid" type="STRING" size="256"/>
		</ColumnInfo>
		<Rows>
			<Row>
				<Col id="patient">${patientInfo.name}, ${patientInfo.patientID} (${patientInfo.gender}/${patientInfo.age})</Col>
				<Col id="result">${mlpaData.result} ${resultStatus}</Col>
        <Col id="rsltright1"></Col>
				<Col id="rsltright2"></Col>
				<Col id="rsltleft1"></Col>
				<Col id="rsltleft2"></Col>
        <Col id="rsltcenter1"></Col>
        <Col id="rsltcenter2"></Col>
				<Col id="testinfo1">TARGET DISEASE: ${target}</Col>
				<Col id="testinfo2"><![CDATA[METHOD:  ${testmethod}]]></Col>
				<Col id="testinfo3"><![CDATA[SPECIMEN: ${spcimen}]]></Col>
				<Col id="testinfo4">REQUEST: ${patientInfo.request}</Col>
        <Col id="testinfo5">ANALYZED GENE: ${analyzedgene}</Col>
        <Col id="opnion"></Col>
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
			 <Col id="site">${mlpaData.data[i].site}</Col>
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
         <Col id="comments"><![CDATA[${mlpaData.technique}]]></Col>
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
        <Col id="comment1"><![CDATA[${mlpaData.conclusion}]]></Col>
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
            <Col id="comment2"><![CDATA[${mlpaData.comment}]]></Col>
         </Row>
      </Rows>
</Dataset>
`;


  const rootbottom = `</root>`;

  return patient + variantHeader + data + variantBottom + comments + comment1 + comment2 + rootbottom;

}
