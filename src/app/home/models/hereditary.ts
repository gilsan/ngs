import { IAFormVariant, IComment, IGeneList, IImmundefi, IPatient } from './patients';


export function hereditaryForm(
  resultname: string,
  examin: string, // 검사자
  recheck: string, // 확인자
  target: string,
  specimenMessage: string,
  title: string,
  acceptdate: string,
  firstReportDay: string,
  lastReportDay: string,
  patientInfo: IPatient,
  formData: IAFormVariant[],
  comment: string,
  comment2: string,
  method: string,
  technique: string,
  genelist: IGeneList[],
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
			<Column id="opnion" type="STRING" size="256"/>
			<Column id="title" type="STRING" size="256"/>
			<Column id="examdt" type="STRING" size="256"/>
			<Column id="examid" type="STRING" size="256"/>
			<Column id="signid" type="STRING" size="256"/>
		</ColumnInfo>
		<Rows>
			<Row>
				<Col id="patient">${patientInfo.name}, ${patientInfo.patientID} (${patientInfo.gender}/${patientInfo.age})</Col>
				<Col id="result">${resultname}</Col>
        <Col id="rsltright1"></Col>
				<Col id="rsltright2"></Col>
				<Col id="rsltleft1"></Col>
				<Col id="rsltleft2"></Col>
        <Col id="rsltcenter1"></Col>
        <Col id="rsltcenter2"></Col>
				<Col id="testinfo1">TARGET DISEASE: ${target}</Col>
				<Col id="testinfo2">METHOD: *Massively parallel sequencing</Col>
				<Col id="testinfo3">SPECIMEN: ${specimenMessage}</Col>
				<Col id="testinfo4">REQUEST: ${patientInfo.request}</Col>
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
		<Column id="gene" type="STRING" size="256"/>
		<Column id="fimpact" type="STRING" size="256"/>
		<Column id="transcript" type="STRING" size="256"/>
		<Column id="exonintron" type="STRING" size="256"/>
		<Column id="nuclchange" type="STRING" size="256"/>
		<Column id="aminochange" type="STRING" size="256"/>
		<Column id="zygosity" type="STRING" size="256"/>
		<Column id="dbsnp" type="STRING" size="256"/>
		<Column id="gnomad" type="STRING" size="256"/>
		<Column id="omim" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
	`;

  let data = '';
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < formData.length; i++) {
    data = data + `
			<Row>
			 <Col id="gene">${formData[i].gene}</Col>
			 <Col id="fimpact">${formData[i].functionalImpact}</Col>
			 <Col id="transcript">${formData[i].transcript}</Col>
			 <Col id="exonintron">${formData[i].exonIntro}</Col>
			 <Col id="nuclchange">${formData[i].nucleotideChange}</Col>
			 <Col id="aminochange">${formData[i].aminoAcidChange}</Col>
			 <Col id="zygosity">${formData[i].zygosity}</Col>
			 <Col id="dbsnp">${formData[i].dbSNPHGMD}</Col>
			 <Col id="gnomad">${formData[i].gnomADEAS}</Col>
			 <Col id="omim">${formData[i].OMIM}</Col>
		 </Row>
			`;
  }


  const variantBottom = `
		</Rows>
</Dataset>
	`;


  const comments = `
<Dataset id="ds_3">
	<ColumnInfo>
		<Column id="comments" type="STRING" size="256"/>
	</ColumnInfo>
  <Rows>
     <Row>
      <Col id="comments"><![CDATA[${comment}]]></Col>
     </Row>
  </Rows>
</Dataset>`;


  const methods = `
  <Dataset id="ds_4">
    <ColumnInfo>
      <Column id="methods" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
       <Row>
       <Col id="methods"><![CDATA[${method}]]></Col>
       </Row>
    </Rows>
    </Dataset>
  `;

  const techniqueMsg = `
  <Dataset id="ds_5">
    <ColumnInfo>
      <Column id="technique" type="STRING" size="256"/>
      <Column id="comment2" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
       <Row>
       <Col id="technique"><![CDATA[${technique}]]></Col>
       <Col id="comment2"><![CDATA[${comment2}]]></Col>
       </Row>
    </Rows>
    </Dataset>
  `;


  const geneList = `

<Dataset id="ds_6">
	<ColumnInfo>
		<Column id="tg0" type="STRING" size="256"/>
		<Column id="tg1" type="STRING" size="256"/>
		<Column id="tg2" type="STRING" size="256"/>
		<Column id="tg3" type="STRING" size="256"/>
		<Column id="tg4" type="STRING" size="256"/>
		<Column id="tg5" type="STRING" size="256"/>
		<Column id="tg6" type="STRING" size="256"/>
		<Column id="tg7" type="STRING" size="256"/>
		<Column id="tg8" type="STRING" size="256"/>
		<Column id="tg9" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>`;

  let list = '';

  // tslint:disable-next-line:no-unused-expression
  genelist.forEach(gene => {
    list = list + `
		<Row>
			<Col id="tg0">${gene.g0}</Col>
			<Col id="tg1">${gene.g1}</Col>
			<Col id="tg2">${gene.g2}</Col>
			<Col id="tg3">${gene.g3}</Col>
			<Col id="tg4">${gene.g4}</Col>
			<Col id="tg5">${gene.g5}</Col>
			<Col id="tg6">${gene.g6}</Col>
			<Col id="tg7">${gene.g7}</Col>
			<Col id="tg8">${gene.g8}</Col>
			<Col id="tg9">${gene.g9}</Col>
		</Row>
		`;
  });

  const rootbottom = `</Rows>
	</Dataset>
</root>`;

  return patient + variantHeader + data + variantBottom + comments + methods + techniqueMsg + geneList + list + rootbottom;

}
