import { IAFormVariant, IPatient, IComment, IProfile, IGeneList } from './patients';

// 25.09.18 인천
import { environment } from '../../../environments/environment';

export const METHODS = 'Total genomic DNA was extracted from the each sample. Template and automated libraries were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences to the reference human genome (GRCh37/hg19) and base calling were performed using the Torrent Suite software version 5.8.0 (Thermo Fisher Scientific). The Torrent Variant Caller v5.8.0.19 (Thermo Fisher Scientific) was used for calling variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.6. ';

// 2025.05.05 METHODS 문구를 여기서 읽음
//export const METHODS516 = 'Total genomic DNA was extracted from the each sample. Template and automated libraries  Were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently Sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences totherefeencehuman genome (GRCh37/hg19) and base calling werePerformed using the Torrent Suite software version 5.18.0 (Thermo Fisher Scientific). The Torrent Variant Caller v.5.18.0.0 (Thermo Fisher Scientific) was used for calling Variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.20 The detected variants are classified as Oncogenic, Likely Oncogenic, Variant of Uncertain Significance (VUS), Likely Benign, and Benign variant according to the  Somatic Oncogenicity classification [Genetics in Medicine (2022) 24, 986-998]. We only report variants classified as Oncogenic, Likely oncogenic and VUS.';
// 2025.05.05 악성림프종 형질세포종 METHODS 문구를 여기서 읽음
export const METHODS516 = 'Total genomic DNA was extracted from the each sample.  The HEMEaccuTest SM-PanHEM was used to make the library. The HEMEaccuTest SM-PanHEM was used for in-solution enrichment of target regions. The enriched fragments were then amplified and sequenced on the NextSeq550Dx system (illumina). After demultiplexing, the reads were aligned to the human reference genome hg19 (GRCh37) using BWA (0.7.10) and duplicate reads were removed with MarkDuplicates (GATK 4.2.6.1). Local realignment, score recalibration and filtering sequence data were performed with GATK (4.2.6.1). Variants were annotated using SnpEff (4.3). The detected variants are classified as Oncogenic, Likely Oncogenic, Variant of Uncertain Significance (VUS), Likely Benign, and Benign variant according to the Somatic Oncogenicity classification [Genetics in Medicine (2022) 24.986-998]. We only report variants classified as Oncogenic, Likely oncogenic, and VUS.';

// 25.09.18 인천
// 2025.07.21 AML/ALL METHODS 문구를 여기서 읽음
//export const METHODS516_AMLL = 'Total genomic DNA was extracted from the each sample. Template and automated libraries  Were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently Sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences totherefeencehuman genome (GRCh37/hg19) and base calling werePerformed using the Torrent Suite software version 5.18.0 (Thermo Fisher Scientific). The Torrent Variant Caller v.5.18.0.0 (Thermo Fisher Scientific) was used for calling Variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.20 The detected variants are classified as Oncogenic, Likely Oncogenic, Variant of Uncertain Significance (VUS), Likely Benign, and Benign variant according to the  Somatic Oncogenicity classification [Genetics in Medicine (2022) 24, 986-998]. We only report variants classified as Oncogenic, Likely oncogenic and VUS.';

// 25.09.18 인천
/**
 * 조건 코드별 안내 문구 테이블
 * - "DEFAULT" 키로 기본 안내 문구 관리
 * - 특정 코드만 분기, 나머지는 DEFAULT 사용
*/

/* 25.10.02 문구 수정
const METHODS_MESSAGES_AMLL: Record<string, string> = {
	"016":
	 `-Panel: HEMEaccuTest SM-PanHem
	 -Target Region: All coding exons (CDS) with ±2 bp intronic flanks
	 -Target Enrichment: Hybridization & Capture
	 -Sequencing Platform: Illumina NextSeqDx
	 -Reagent Kit: Illumina Reagent Kit Mid Output, 300 cycles
	 -Reference Genome: GRCh37 / hg19
	 -Bioinformatics: NGeneAnalysys pipeline v1.9.0`,
	DEFAULT: 'Total genomic DNA was extracted from the each sample. Template and automated libraries  Were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently Sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences totherefeencehuman genome (GRCh37/hg19) and base calling werePerformed using the Torrent Suite software version 5.18.0 (Thermo Fisher Scientific). The Torrent Variant Caller v.5.18.0.0 (Thermo Fisher Scientific) was used for calling Variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.20 The detected variants are classified as Oncogenic, Likely Oncogenic, Variant of Uncertain Significance (VUS), Likely Benign, and Benign variant according to the  Somatic Oncogenicity classification [Genetics in Medicine (2022) 24, 986-998]. We only report variants classified as Oncogenic, Likely oncogenic and VUS.'  // fallback
};
*/

const METHODS_MESSAGES_AMLL: Record<string, string> = {
	"016":
	`-Panel/Targets: HEMEaccuTest SM-PanHem; all coding exons (CDS) with ±5 bp intronic flanks. 
	-Enrichment/Sequencing: Hybridization-capture on Illumina NextSeqDx (Mid Output, 300 cycles).
	-Reference/Bioinformatics: GRCh37 (hg19); NGeneAnalysys pipeline v1.8.0 `,
	// 25.10.20 변경
   //DEFAULT: 'Total genomic DNA was extracted from the each sample.  The HEMEaccuTest SM-PanHEM was used to make the library. The HEMEaccuTest SM-PanHEM was used for in-solution enrichment of target regions. The enriched fragments were then amplified and sequenced on the NextSeq550Dx system (illumina). After demultiplexing, the reads were aligned to the human reference genome hg19 (GRCh37) using BWA (0.7.10) and duplicate reads were removed with MarkDuplicates (GATK 4.2.6.1). Local realignment, score recalibration and filtering sequence data were performed with GATK (4.2.6.1). Variants were annotated using SnpEff (4.3). The detected variants are classified as Oncogenic, Likely Oncogenic, Variant of Uncertain Significance (VUS), Likely Benign, and Benign variant according to the Somatic Oncogenicity classification [Genetics in Medicine (2022) 24.986-998]. We only report variants classified as Oncogenic, Likely oncogenic, and VUS.'  // fallback
	DEFAULT: 'Total genomic DNA was extracted from the each sample. Template and automated libraries Were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently Sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences to the reference human genome (GRCh37/hg19) and base calling were Performed using the Torrent Suite software version 5.18.0 (Thermo Fisher Scientific). The Torrent Variant Caller v.5.18.0.0 (Thermo Fisher Scientific) was used for calling Variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.20 The detected variants are classified as Oncogenic, Likely Oncogenic, Variant of Uncertain Significance (VUS), Likely Benign, and Benign variant according to the Somatic Oncogenicity classification [Genetics in Medicine (2022) 24, 986-998]. We only report variants classified as Oncogenic, Likely oncogenic and VUS.'  // fallback
};

/**
 * GENERAL: instcd 기준으로 메시지 결정
 * - 테이블에 없으면 DEFAULT 반환
*/
let METHODS516_AMLL2 = METHODS_MESSAGES_AMLL[environment.instcd] ?? METHODS_MESSAGES_AMLL.DEFAULT;

export const METHODS516_AMLL = METHODS516_AMLL2
						.split('\n')
						.map(line => line.trimStart()) // 각 줄 왼쪽 공백 제거
						.join('\n');

 // tslint:disable-next-line:max-line-length
// export const METHODS516 = 'Total genomic DNA was extracted from the each sample. Template and automated libraries were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences to the reference human genome (GRCh37/hg19) and base calling were performed using the Torrent Suite software version 5.16.0 (Thermo Fisher Scientific). The Torrent Variant Caller v.5.16.0.0 (Thermo Fisher Scientific) was used for calling variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.16.';


// 25.09.18 인천
/**
 * 조건 코드별 안내 문구 테이블
 * - "DEFAULT" 키로 기본 안내 문구 관리
 * - 특정 코드만 분기, 나머지는 DEFAULT 사용
*/
const GENERAL_MESSAGES: Record<string, string> = {
	"016":
	 `-Method: NGS (Next-Generation Sequencing)
	-Detectable variants: SNVs, Indels, ITD*, PTD*; structural variants (CNVs, gene rearrangements) are not detected
	*Only FLT3-ITD and KMT2A PTD
	-LOD: ~2% VAF (SNVs); ~5% VAF (Indels)
	-Germline vs Somatic: Not distinguishable; VAF near 50% or 100% may indicate a possible germline variant,`,
	DEFAULT: 'The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.'  // fallback
};
  

// 25.09.18 인천
//export const GENERAL = 'The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.';

/**
 * GENERAL: instcd 기준으로 메시지 결정
 * - 테이블에 없으면 DEFAULT 반환
*/
let GENERAL2 = GENERAL_MESSAGES[environment.instcd] ?? GENERAL_MESSAGES.DEFAULT;

export const GENERAL = GENERAL2
						.split('\n')
						.map(line => line.trimStart()) // 각 줄 왼쪽 공백 제거
						.join('\n');


// 25.09.18 인천
let SHOWTABLE2: Record<string, boolean> = { 
	"016": false, 
	DEFAULT: true  // fallback
};

export const SHOWTABLE = SHOWTABLE2[environment.instcd] ?? SHOWTABLE2.DEFAULT;

/**
 * 조건 코드별 안내 문구 테이블
 * - "DEFAULT" 키로 기본 안내 문구 관리
 * - 특정 코드만 분기, 나머지는 DEFAULT 사용
*/
const File_Name2: Record<string, string> = {
	"016":
	 `Excel`,
	DEFAULT: 'TSV'  // fallback
};

/**
 * GENERAL: instcd 기준으로 메시지 결정
 * - 테이블에 없으면 DEFAULT 반환
*/
export const FileName = File_Name2[environment.instcd] ?? File_Name2.DEFAULT;

export function makeBForm(
  resultStatus: string, // detected, not detected
  examin: string, // 검사자
  recheck: string, // 확인자
  profile: IProfile,
  acceptdate: string,
  specimenMessage: string,
  fusion: string,
  ment: string,
  patientInfo: IPatient,
  formData: IAFormVariant[],
  comment: IComment[],
  firstReportDay: string,
  lastReportDay: string,
  genelists: IGeneList[],
  tsvVersionContents: string,

  // 25.09.18 인천
  //specimenMsg: string
  specimenMsg: string,
  general?: string,
): string {

  if (specimenMessage && specimenMessage.length === 0) {
    specimenMessage = 'Genomic DNA isolated from ' + specimenMsg;
  }

  // 금일날자:
  function formatDate(date): any {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }

    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('.');
  }

  const today = formatDate(new Date());
  // examin = examin.slice(0, -2);
  // recheck = recheck.slice(0, -2);
  ///////////////////////////////////////////////
  // 강제로 값넣기


  // 검사의뢰일은 db에 accept_date
  // 검사보고일은 당일
  // 수정보고일 현재는 "-""
  /////////////////////////////////////////////////////
  const patient = `<root>
	<Dataset id="ds_1">
	    <ColumnInfo>
			<Column id="patient" type="STRING" size="256"/>
			<Column id="result" type="STRING" size="256"/>
			<Column id="rsltleft1" type="STRING" size="256"/>
			<Column id="rsltleft2" type="STRING" size="256"/>
			<Column id="rsltcenter1" type="STRING" size="256"/>
			<Column id="rsltcenter2" type="STRING" size="256"/>
			<Column id="rsltright1" type="STRING" size="256"/>
			<Column id="rsltright2" type="STRING" size="256"/>
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
				<Col id="result">${resultStatus}</Col>
				<Col id="rsltleft1">Gene fusion</Col>
				<Col id="rsltleft2"><![CDATA[${profile.leukemia}]]></Col>
				<Col id="rsltcenter1">FLT3-ITD</Col>
				<Col id="rsltcenter2"><![CDATA[${profile.flt3itd}]]></Col>
				<Col id="rsltright1">Chromosomal analysis</Col>
				<Col id="rsltright2"><![CDATA[${profile.chron}]]></Col>
				<Col id="testinfo1">TARGET DISEASE: Acute myeloid leukemia</Col>
				<Col id="testinfo2">METHOD: *Massively parallel sequencing</Col>
				<Col id="testinfo3"><![CDATA[SPECIMEN:  ${specimenMessage}]]></Col>
				<Col id="testinfo4">REQUEST: ${patientInfo.request}</Col>
				<Col id="opnion"><![CDATA[${ment}]]></Col>
				<Col id="title">Acute Myeloid Leukemia NGS</Col>
				<Col id="examdt">${acceptdate}/${firstReportDay}/${lastReportDay}</Col>
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
		<Column id="vaf" type="STRING" size="256"/>
		<Column id="reference" type="STRING" size="256"/>
		<Column id="cosmicid" type="STRING" size="256"/>
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
			 <Col id="vaf">${formData[i].vafPercent}</Col>
			 <Col id="reference">${formData[i].reference}</Col>
			 <Col id="cosmicid">${formData[i].cosmic_id}</Col>
		 </Row>
			`;
  }


  const variantBottom = `
		</Rows>
</Dataset>
	`;


  const commentHeader = `
<Dataset id="ds_3">
	<ColumnInfo>
		<Column id="gene" type="STRING" size="256"/>
		<Column id="variants" type="STRING" size="256"/>
		<Column id="comments" type="STRING" size="256"/>
		<Column id="reference" type="STRING" size="256"/>
	</ColumnInfo>
`;

  let commentContent = '';
  if (comment.length > 0) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < comment.length; i++) {
      commentContent = commentContent + `
		<Row>
		<Col id="gene">${comment[i].gene}</Col>
		<Col id="variants"><![CDATA[${comment[i].variant_id}]]></Col>
		<Col id="comments"><![CDATA[${comment[i].comment}]]></Col>
		<Col id="reference"><![CDATA[${comment[i].reference}]]></Col>
	</Row>`;
    }
  } else {
    commentContent = `
	 <Row>
	 <Col id="gene"></Col>
	 <Col id="variants"></Col>
	 <Col id="comments"></Col>
	 <Col id="reference"></Col>
 </Row>
	 `;
  }

  commentContent = `<Rows>
		${commentContent}
		</Rows>
	`;
  const commentBottom = `
	</Dataset>
	`;
  const comments = commentHeader + commentContent + commentBottom;

  // 25.09.18 인천
  
  /*
  const fixedMent = `
	<Dataset id="ds_4">
	<ColumnInfo>
		<Column id="methods" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
		<Row>
			<Col id="methods">${tsvVersionContents}</Col>
		</Row>
	</Rows>
</Dataset>

<Dataset id="ds_5">
	<ColumnInfo>
		<Column id="technique" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
		<Row>
			<Col id="technique">The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.</Col>
		</Row>
	</Rows>
</Dataset>

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
	*/

const fixedMent = `
	<Dataset id="ds_4">
	<ColumnInfo>
		<Column id="methods" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
		<Row>
			<Col id="methods"><![CDATA[${tsvVersionContents}]]></Col>
		</Row>
	</Rows>
</Dataset>

<Dataset id="ds_5">
	<ColumnInfo>
		<Column id="technique" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
		<Row>
			<Col id="technique"><![CDATA[${general}]]></Col>
		</Row>
	</Rows>
</Dataset>

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
  genelists.forEach(gene => {
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



  return patient + variantHeader + data + variantBottom + comments + fixedMent + list + rootbottom;

}


