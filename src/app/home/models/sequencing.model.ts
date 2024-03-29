import { IPatient, ISequence } from './patients';


export function sequencingForm(
  resultStatus: string, // detected, not detected
  resultname: string,
  targetdisease: string,
  analyzedgene: string,
  method: string,
  specimen: string,
  examin: string, // 검사자
  recheck: string, // 확인자
  title: string,
  acceptdate: string,
  firstReportDay: string,
  lastReportDay: string,
  patientInfo: IPatient,
  formData: ISequence[],
  commentMsg: string,
  comment1Msg: string,
  comment2Msg: string,
  seqcomment: string,
  variations: string

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
      <Column id="identified" type="STRING" size="256"/>
      <Column id="opnion" type="STRING" size="256"/>
			<Column id="title" type="STRING" size="256"/>
			<Column id="examdt" type="STRING" size="256"/>
			<Column id="examid" type="STRING" size="256"/>
			<Column id="signid" type="STRING" size="256"/>

		</ColumnInfo>
		<Rows>
			<Row>
				<Col id="patient">${patientInfo.name}, ${patientInfo.patientID} (${patientInfo.gender}/${patientInfo.age})</Col>
				<Col id="result"><![CDATA[${resultname} ${resultStatus}]]></Col>
        <Col id="rsltright1"></Col>
				<Col id="rsltright2"></Col>
				<Col id="rsltleft1"></Col>
				<Col id="rsltleft2"></Col>
        <Col id="rsltcenter1"></Col>
        <Col id="rsltcenter2"></Col>
				<Col id="testinfo1"><![CDATA[TARGET DISEASE: ${targetdisease}]]></Col>
				<Col id="testinfo2"><![CDATA[METHOD:  ${method}]]></Col>
				<Col id="testinfo3"><![CDATA[SPECIMEN:  ${specimen}]]></Col>
				<Col id="testinfo4">REQUEST: ${patientInfo.request}</Col>
        <Col id="testinfo5">ANALYZED GENE: ${analyzedgene}</Col>
        <Col id="identified"><![CDATA[${variations}]]></Col>
        <Col id="opnion"><![CDATA[${seqcomment}]]></Col>
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
		<Column id="type" type="STRING" size="256"/>
		<Column id="exonintron" type="STRING" size="256"/>
		<Column id="nuclchange" type="STRING" size="256"/>
		<Column id="aminochange" type="STRING" size="256"/>
		<Column id="zygosity" type="STRING" size="256"/>
		<Column id="rsid" type="STRING" size="256"/>
    <Column id="genbank" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
	`;

  let data = '';
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < formData.length; i++) {
    data = data + `
			<Row>
			 <Col id="type">${formData[i].type}</Col>
			 <Col id="exonintron">${formData[i].exonintron}</Col>
			 <Col id="nuclchange">${formData[i].nucleotideChange}</Col>
			 <Col id="aminochange">${formData[i].aminoAcidChange}</Col>
			 <Col id="zygosity">${formData[i].zygosity}</Col>
			 <Col id="rsid">${formData[i].rsid}</Col>
       <Col id="genbank">${formData[i].genbankaccesion}</Col>
		 </Row>
			`;
  }

  const variantBottom = `
  </Rows>
</Dataset>
`;

  const comment = `
  <Dataset id="ds_3">
    <ColumnInfo>
      <Column id="comments" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
       <Row>
       <Col id="comments"><![CDATA[${commentMsg}]]></Col>
       </Row>
    </Rows>
    </Dataset>
  `;

  const comment1 = `
  <Dataset id="ds_4">
    <ColumnInfo>
      <Column id="comment1" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
       <Row>
       <Col id="comment1"><![CDATA[${comment1Msg}]]></Col>
       </Row>
    </Rows>
    </Dataset>
  `;

  const comment2 = `
  <Dataset id="ds_5">
    <ColumnInfo>
      <Column id="comment2" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
       <Row>
       <Col id="comment2"><![CDATA[${comment2Msg}]]></Col>
       </Row>
    </Rows>
    </Dataset>
  `;



  const rootbottom = `</root>`;

  return patient + variantHeader + data + variantBottom + comment + comment1 + comment2 + rootbottom;







}
