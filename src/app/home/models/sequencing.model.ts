import { IPatient } from './patients';


export function sequencingForm(
  resultStatus: string, // detected, not detected
  examin: string, // 검사자
  recheck: string, // 확인자
  title: string,
  acceptdate: string,
  firstReportDay: string,
  lastReportDay: string,
  patientInfo: IPatient,
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
				<Col id="result">${resultStatus}</Col>
				<Col id="testinfo1">TARGET DISEASE: Primary Immunodeficiency (363 genes)</Col>
				<Col id="testinfo2">METHOD: *Massively parallel sequencing</Col>
				<Col id="testinfo3">SPECIMEN: Genomic DNA isolated from peripheral blood leukocytes-adequate specimen</Col>
				<Col id="testinfo4">REQUEST: ${patientInfo.request}</Col>
        <Col id="testinfo5">REQUEST: ANALYZED GENE : DUMT3A on 2p23</Col>
				<Col id="title">${title}</Col>
				<Col id="examdt">${acceptdate}/${firstReportDay}/${lastReportDay} </Col>
				<Col id="examid">${examin}</Col>
				<Col id="signid">${recheck}</Col>
			</Row>
		</Rows>
	</Dataset>
	`;


  const rootbottom = `</Rows>
	</Dataset>
</root>`;

  return patient + rootbottom;







}
