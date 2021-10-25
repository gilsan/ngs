import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { IAFormVariant, IComment, IDList, IFilteredTSV, IFitering, IGeneCoding, IGeneList, IMutation, IPatient } from '../models/patients';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreService } from 'src/app/forms/store.current';
import { ClrVerticalNavGroup } from '@clr/angular';


@Injectable({
  providedIn: 'root'
})
export class PatientsListService {

  private apiUrl = emrUrl;

  private listSubject$ = new Subject<string>();
  public listObservable$ = this.listSubject$.asObservable();
  private jimTestedID: string;
  public patientInfo: IPatient[] = [];
  testCode: string;

  geneCoding: IGeneCoding[];
  constructor(
    private http: HttpClient,
    private store: StoreService,
  ) { }

  // 검진자정보 리스트 가져오기
  public getPatientList(): Observable<IPatient[]> {

    return this.http.get<IPatient[]>(`${this.apiUrl}/patients_diag/list`).pipe(
      map((items: any) => {
        return items.map(item => {
          let genetictest = '';
          if (item.genetic1.length > 0) {
            genetictest = 'JAK2 V617F:' + item.genetic1 + '\n';
          }
          if (item.genetic2.length > 0) {
            genetictest += 'MPL:' + item.genetic2 + '\n';
          }
          if (item.genetic3.length > 0) {
            genetictest += 'CALR:' + item.genetic3 + '\n';
          }
          if (item.genetic4.length > 0) {
            genetictest += 'JAK2 exon 12:' + item.genetic4;
          }
          return { ...item, genetictest };
        });
      }),
      tap(data => {
        // console.log('[29][getPatientList]', data);
        this.patientInfo = data;
      }),
      tap(data => console.log('[56][patientslist][getPatientList]', this.patientInfo))

    );
  }

  // 검진자 정보 가져오기 this.form2TestedId
  public getPatientInfo(specimenNo: string): Observable<IPatient> {
    return this.http.post<IPatient>(`${this.apiUrl}/patients_diag/patientinfo`, { specimenNo });
  }
  // 검사자 필터링된 검사 결과 가져오기
  public getFilteredTSVtList(testedID: string): Observable<IFilteredTSV[]> {
    const params = new HttpParams()
      .set('testedID', testedID);

    return this.http.get<IFilteredTSV[]>(`${this.apiUrl}/filteredTSV/list`, { params }).pipe(
      shareReplay()
    );
  }

  // 유전체 와 coding 로 mutation 레코드에서 정보 가져오기
  public getMutationInfoLists(gene: string, coding: string, type: string): Observable<IAFormVariant[]> {
    // console.log('[77][patientslist SERVICE][getMutationInfoLists]', gene, coding, type);
    return this.http.post<IAFormVariant[]>(`${this.apiUrl}/mutationInfo/list`, { gene, coding, type }).pipe(
      shareReplay()
    );
  }

  // 유전체 와 coding 로 Artifacts 레코드에서 정보 가져오기
  public getArtifactInfoLists(gene: string, coding: string) {
    return this.http.post(`${this.apiUrl}/ngsartifacts/list`, { gene, coding }).pipe(
      shareReplay()
    );
  }

  // artifacts 삽입
  public insertArtifacts(type: string, genes: string, loc2: string = '', exon: string = '', transcript: string, coding: string, aminoAcidChange: string) {
    return this.http.post(`${this.apiUrl}/artifacts/insert`, {
      type, genes, loc2, exon, transcript, coding, aminoAcidChange
    }).pipe(
      shareReplay()
    );
  }

  // 유전체 와 coding 로 Artifacts 레코드에서 존재 유무 정보 가져오기
  public getArtifactsInfoCount(gene: string, coding: string, type: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/artifactsCount/count`, { gene, coding, type }).pipe(
      shareReplay()
    );
  }

  // 유전체 와 coding 로 benign 레코드에서 정보 가져오기
  public benignInfolists(gene: string, coding: string) {
    return this.http.post(`${this.apiUrl}/ngsbenign/list`, { gene, coding }).pipe(
      shareReplay()
    );
  }
  // benign 저장
  public insertBenign(gene: string, loc2: string, exon: string, transcript: string, coding: string, aminoAcidChange: string) {
    return this.http.post(`${this.apiUrl}/benignInsert/insert`, { gene, loc2, exon, transcript, coding, aminoAcidChange }).pipe(
      shareReplay()
    );
  }

  public benignInfoCount(gene: string, coding: string) {
    return this.http.post(`${this.apiUrl}/benignCount/count`, { gene, coding }).pipe(
      shareReplay()
    );
  }

  // 유전체 와 coding 로 Comments 레코드에서 정보 가져오기
  public getCommentInfoLists(gene: string, type: string): Observable<Partial<IComment>> {
    return this.http.post(`${this.apiUrl}/ngscomments/list`, { gene, type }).pipe(
      // tap(data => console.log('[110][getCommentInfoLists]', data)),
      shareReplay()
    );
  }

  public getCommentInfoCount(gene: string, type: string): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/commentsCount/count`, { gene, type }).pipe(
      shareReplay()
    );
  }

  // 유전체 와 coding 로 mutation 에 있는지 조사하기
  public findGeneExist(id: string, gene1: string, gene2: string, aminoAcidChange: string) {
    return this.http.post(`${this.apiUrl}/findGeneExist/list`, { id, gene1, gene2, aminoAcidChange })
      .pipe(
        shareReplay()
      );
  }

  // 유전체 와 coding 로 mutation 레코드 저장하기
  public addGeneInfo(
    name: string,
    patientID: string,
    gene: string,
    transcript: string,
    aminoAcidChange: string,
    cosmicID: string) {
    return this.http.post(`${this.apiUrl}/addGeneInfo/addGene`, { name, patientID, gene, transcript, aminoAcidChange, cosmicID });

  }

  // Mutation 저장
  public saveMutation(
    type: string,
    igv: string,
    sanger: string,
    name: string,
    patientID: string,
    gene: string,
    functionalImpact: string,
    transcript: string,
    exonIntro: string,
    nucleotideChange: string,
    aminoAcidChange: string,
    zygosity: string,
    vafPercent: string,
    references: string,
    cosmicID: string
  ) {
    return this.http.post(`${this.apiUrl}/mutation/insert`, {
      type,
      igv,
      sanger,
      name,
      patientID,
      gene,
      functionalImpact,
      transcript,
      exonIntro,
      nucleotideChange,
      aminoAcidChange,
      zygosity,
      vafPercent,
      references,
      cosmicID
    }).pipe(
      shareReplay()
    );
  }

  // 결과지를 위한 검체정보 저장
  setTestedID(testID: string): void {
    // console.log('setTestedID: ', testID);
    this.jimTestedID = testID;

  }
  //  결과지를 위한 검체정보 찻기
  getTestedID(): string {
    return this.jimTestedID;
  }

  // AML ALL 구분 저장
  setTestcode(code: string): void {
    this.testCode = code;
  }

  getTestcode(): string {
    return this.testCode;
  }

  redoTestedID(testID: string, filename: string): void {

  }

  // 결과물 전송 시험
  // http://emr012edu.cmcnu.or.kr/cmcnu/.live?submit_id=TXLII00124&business_id=li&
  // instcd=012&spcno=병리번호(병리)/바코드번호(진검)&
  // formcd=-&rsltflag=O&pid=등록번호&
  // examcd=검사코드&examflag=검사구분(진검:L,병리:P)&infflag=I&
  // userid=사용자ID&rsltdesc=검사결과
  //
  // patientInfo_diag 테이블 참조
  // submit_id: TXLII00124
  // business_id: li
  // instcd: 012
  // spcno:  병리번호(병리)/바코드번호(진검): specimenNo
  // formcd: -
  // rsltflag: O
  // pid: 등록번호 patientID 환자번호
  // examcd: 검사코드 test_code
  // examflag: 검사구분(진검:L,병리:P)
  // infflag: I
  // userid: 사용자 name
  // rsltdesc: 검사결과 데이타셋
  public sendEMR(
    spcnum: string,
    patientid: string,
    examcdata: string,
    userID: string,
    examcode: string,
    xmlData: string) {

    const url = 'http://emr012edu.cmcnu.or.kr/cmcnu/.live';
    const submitID = 'TXLII00124';
    const businessID = 'li';
    const instcd = '012';
    // const spcno = spcnum;
    const spcno = spcnum;
    const formcd = '-';
    const rsltflag = 'O';
    const pid = patientid;
    const examcd = examcode;
    // const examcd = 'PMO12072';
    const examflag = 'L';
    // const examflag = 'P';
    const infflag = 'I';
    const userid = '21502549';
    // const userid = userID;
    const rsltdesc = xmlData;
    // const rsltdesc = 'TEST';
    /**
      *

      * http://emr012edu.cmcnu.or.kr/cmcnu/.live?submit_id=TXLII00124&business_id=li&instcd=012&*spcno=M20-008192&formcd=-&rsltflag=O&pid=34213582&examcd=PMO12072&examflag=${examflag}&infflag=I&userid=20800531&rsltdesc=test
      */

    const emrdata = `http://emr012edu.cmcnu.or.kr/cmcnu/.live?submit_id=${submitID}&business_id=li&instcd=012&spcno=${spcno}&formcd=-&rsltflag=O&pid=${pid}&examcd=${examcd}&examflag=${examflag}&infflag=I&userid=${userid}&rsltdesc=${rsltdesc}`;

    const params = new HttpParams()
      .set('data', emrdata);

    // const emrUrl = 'http://emr012edu.cmcnu.or.kr/cmcnu/.live';
    const headers = new HttpHeaders()
      .set('Access-Control-Allow-Origin', '*')
      .set('Access-Control-Allow-Methods', 'GET,POST')
      .set('Access-Control-Allow-Headers', 'X-Requested-With');

    //  console.log('[service][235] ', xmlData);
    const emr = `${this.apiUrl}/diagEMR/redirectEMR`;
    //  return this.http.get(`${emr}`, { params });
    return this.http.post(`${emr}`, {
      submit_id: submitID,
      business_id: businessID,
      instcd,
      spcno,
      formcd,
      rsltflag,
      pid,
      examcd,
      examflag,
      infflag,
      userid,
      rsltdesc
    });
    // return this.http.post(`${emrUrl}`, {
    //   submit_id: 'TXLII00124', business_id: 'li',
    //   instcd: '012', spcno: 'E27060R50', formcd: '-', rsltflag: 'O',
    //   pid: 'PID30472381', examcd: 'LPE471', examflg: 'L', infflag: 'I', userid: '21502549', rsltdesc
    // });

  }

  // 날자별 환자ID, 검사ID 검사인 찿기
  public search(start: string, end: string, patientID: string = '',
    // tslint:disable-next-line:align
    specimenNo: string = '', status: string = '', sheet: string = ''): Observable<IPatient[]> {
    // console.log('[265][searchService][진검검색]:', start, end, patientID, specimenNo);
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/list`, { start, end, patientID, specimenNo, status, sheet }).pipe(
      map((items: any) => {
        return items.map(item => {
          let genetictest = '';
          if (item.genetic1.length > 0) {
            genetictest = 'JAK2 V617F:' + item.genetic1 + '\n';
          }
          if (item.genetic2.length > 0) {
            genetictest += 'MPL:' + item.genetic2 + '\n';
          }
          if (item.genetic3.length > 0) {
            genetictest += 'CALR:' + item.genetic3 + '\n';
          }
          if (item.genetic4.length > 0) {
            genetictest += 'JAK2 exon 12:' + item.genetic4;
          }
          return { ...item, genetictest };
        });
      }),
      tap(data => this.patientInfo = data),
      shareReplay()
    );
  }

  // muation, gene , amino-acid-change 숫자
  getMutaionGeneAminoacid(gene: string, coding: string, specimenNo, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/diaggene/count`, { gene, coding, specimenNo, type })
      .pipe(
        shareReplay()
      );
  }


  // 검색순서 mutation artifacts benign
  // tslint:disable-next-line:typedef
  filtering(testedID: string, testType: string): Observable<any> {

    return this.getFilteredTSVtList(testedID).pipe(
      tap(data => {
        // gene 와 coding 값 분리
        this.geneCoding = data.map(item => {
          // console.log('****[356][patientslist][item] ****', item);
          let coding: string;
          let multigenes: string;
          let gene1: string;
          let gene2: string;
          let clinVar: string;
          let tsv: IFilteredTSV;

          tsv = item;
          item.genes = item.genes.replace(/;/g, ',');
          multigenes = item.genes;
          item.coding = item.coding.replace(/;/g, ',');
          if (item.genes || item.coding) {
            // console.log('[315][유전체]', item.genes, item.coding);
            // const genes = item.genes;  // genes: "CSDE1;NRAS" => "CSDE1,NRAS"
            const genesemi = item.genes.indexOf(',');
            if (genesemi !== -1) {  // ,있는경우
              gene1 = item.genes.split(',')[0];
              gene2 = item.genes.split(',')[1];
            } else {
              gene1 = item.genes;
              gene2 = 'none';
            }
            // 유전자가 2개인 경우도 2개의 유전자로 검색

            clinVar = item.clinvar;
            const semi = item.coding.indexOf(',');
            // console.log('[384] ', item.coding, semi);
            if (semi !== -1) {
              // coding = item.coding.split(',')[0];
              coding = item.coding;
            } else {
              coding = item.coding;
            }
            // coding = item.coding.replace(/;/g, ',');
            const id = item.id;
            // console.log('===== [391][gene1/gene2/coding]====\n', gene1, gene2, coding);
            return { id, gene1, gene2, coding, tsv, clinVar, multigenes };
          }
        });
      }), // End of tap
      switchMap(() => from(this.geneCoding)),
      concatMap(item => {
        // console.log('===== [407][coding]====\n', item.coding);
        let tempTestType;
        if (item.gene2 === 'none') {
          if (testType === 'AML' || testType === 'ALL') {
            tempTestType = 'AMLALL';
          } else {
            tempTestType = testType;
          }

          return this.getArtifactsInfoCount(item.gene1, item.coding, tempTestType).pipe(
            map(gene1Count => {
              // console.log('[410][getArtifactsInfoCount]', gene1Count[0].count, item.multigenes);
              if (gene1Count[0] !== null) {
                return { ...item, artifacts1Count: gene1Count[0].count, artifacts2Count: 0 };
              }
              return { ...item, artifacts1Count: 0, artifacts2Count: 0 };
            })
          );
        } else {
          if (testType === 'AML' || testType === 'ALL') {
            tempTestType = 'AMLALL';
          } else {
            tempTestType = testType;
          }
          return this.getArtifactsInfoCount(item.multigenes, item.coding, tempTestType)
            .pipe(
              map(geneCount => {
                if (geneCount[0] !== null) {
                  return { ...item, artifacts1Count: geneCount[0].count, artifacts2Count: 0 };
                }
                return { ...item, artifacts1Count: 0, artifacts2Count: 0 };
              })
            );

          // const gene1$ = this.getArtifactsInfoCount(item.gene1, item.coding, tempTestType);
          // const gene2$ = this.getArtifactsInfoCount(item.gene2, item.coding, tempTestType);

          // return combineLatest([gene1$, gene2$]).pipe(
          //   map(data => {
          //     if (data[0] !== null || data[1] !== null) {
          //       return { ...item, artifacts1Count: data[0][0].count, artifacts2Count: data[1][0].count };
          //     }
          //     return { ...item, artifacts1Count: 0, artifacts2Count: 0 };
          //   })
          // );
        }
      }),
      /*
      concatMap(item => {
        if (item.gene2 === 'none') {
          return this.benignInfoCount(item.gene1, item.coding).pipe(
            map(benign1Count => {
              if (benign1Count[0] !== null) {
                return { ...item, benign1Count: benign1Count[0].count, benign2Count: 0 };
              }
              return { ...item, benign1Count: 0, benign2Count: 0 };
            })
          );
        } else {
          const gene1$ = this.benignInfoCount(item.gene1, item.coding);
          const gene2$ = this.benignInfoCount(item.gene2, item.coding);
          return combineLatest([gene1$, gene2$]).pipe(
            map(data => {
              return { ...item, benign1Count: data[0][0].count, benign2Count: data[1][0].count };
            })
          );
        }
      }),
      */
      concatMap(item => {
        // console.log('===[468][patientslists][뮤테이션] getMutationInfoLists', item);
        let tempTestType;
        if (item.gene2 === 'none') {
          const cnt = item.gene1.split(',').length;
          // console.log('====[395][patientslists][뮤테이션길이] getMutationInfoLists', item, cnt);
          if (cnt === 1) {
            if (testType === 'AML' || testType === 'ALL') {
              tempTestType = 'AMLALL';
            } else {
              tempTestType = testType;
            }

            return this.getMutationInfoLists(item.gene1, item.coding, tempTestType).pipe(
              map(lists => {
                // console.log('========[469][patientslist][뮤테이션]', lists, item.gene1, item.coding);
                if (Array.isArray(lists) && lists.length) {
                  return { ...item, mutationList1: lists[0], mutationList2: 'none', mtype: 'M' };
                } else {
                  return {
                    ...item, mutationList1: {
                      gene: 'none',
                      functionalImpact: '',
                      transcript: '',
                      exonIntro: 'none',
                      nucleotideChange: '',
                      aminoAcidChange: '',
                      zygosity: '',
                      vafPercent: '',
                      references: '',
                      cosmicID: '',
                    }, mutationList2: 'none', mtype: 'none'
                  };
                }
              })
            );
          } else {
            // CSDE1,NRAS 인경우 NRAS로 찿는다.
            let tempGene;
            const tempCoding = item.coding.split(',')[0];
            // console.log('[420][뮤테이션]', item);
            if (item.gene1.split(',')[0] === 'NRAS') {
              tempGene = item.gene1.split(',')[0];
            } else if (item.gene1.split(',')[1] === 'NRAS') {
              tempGene = item.gene1.split(',')[1];
            } else {
              tempGene = item.multigenes;
            }

            if (testType === 'AML' || testType === 'ALL') {
              tempTestType = 'AMLALL';
            } else {
              tempTestType = testType;
            }
            // console.log('[519][뮤테이션]', item, tempGene, tempCoding);
            return this.getMutationInfoLists(tempGene, tempCoding, tempTestType).pipe(
              // tap(data => console.log('[patientslist][429][뮤테이션]', data)),
              map(lists => {
                if (Array.isArray(lists) && lists.length) {
                  return { ...item, mutationList1: lists[0], mutationList2: 'none', mtype: 'M' };
                } else {
                  return {
                    ...item, mutationList1: {
                      gene: 'none',
                      functionalImpact: '',
                      transcript: '',
                      exonIntro: 'none',
                      nucleotideChange: '',
                      aminoAcidChange: '',
                      zygosity: '',
                      vafPercent: '',
                      references: '',
                      cosmicID: '',
                    }, mutationList2: 'none', mtype: 'none'
                  };
                }
              })
            );
          }
          // return this.getMutationInfoLists(item.gene1, item.coding).pipe(
          //   map(lists => {
          //     // console.log('========[396][patientslist][뮤테이션]', lists);
          //     if (Array.isArray(lists) && lists.length) {
          //       return { ...item, mutationList1: lists[0], mutationList2: 'none', mtype: 'M' };
          //     } else {
          //       return {
          //         ...item, mutationList1: {
          //           gene: 'none',
          //           functionalImpact: '',
          //           transcript: '',
          //           exonIntro: 'none',
          //           nucleotideChange: '',
          //           aminoAcidChange: '',
          //           zygosity: '',
          //           vafPercent: '',
          //           references: '',
          //           cosmicID: '',
          //         }, mutationList2: 'none', mtype: 'none'
          //       };
          //     }
          //   })
          // );
        } else {
          // CSDE1,NRAS 인경우 NRAS로 찿는다.
          let tempTestType;
          let tempGene;
          const tempCoding = item.coding.split(',')[0];
          // console.log('[574][뮤테이션]', item);
          if (item.gene1.split(',')[0] === 'NRAS') {
            tempGene = item.gene1.split(',')[0];
          } else if (item.gene1.split(',')[1] === 'NRAS') {
            tempGene = item.gene1.split(',')[1];
          } else {
            tempGene = item.multigenes;
          }

          if (testType === 'AML' || testType === 'ALL') {
            tempTestType = 'AMLALL';
          } else {
            tempTestType = testType;
          }
          return this.getMutationInfoLists(tempGene, tempCoding, tempTestType).pipe(
            map(lists => {
              if (Array.isArray(lists) && lists.length) {
                return { ...item, mutationList1: lists[0], mutationList2: 'none', mtype: 'M' };
              } else {
                return {
                  ...item, mutationList1: {
                    gene: 'none',
                    functionalImpact: '',
                    transcript: '',
                    exonIntro: 'none',
                    nucleotideChange: '',
                    aminoAcidChange: '',
                    zygosity: '',
                    vafPercent: '',
                    references: '',
                    cosmicID: '',
                  }, mutationList2: 'none', mtype: 'none'
                };
              }
            })
          );

        }
      }),
      concatMap(item => {
        if (item.mtype === 'M') {
          const tempGene = item.tsv.genes;
          const tempSpecimenNo = item.tsv.testedID;
          const tempCoding = item.tsv.coding;
          return this.getMutaionGeneAminoacid(tempGene, tempCoding, tempSpecimenNo, testType)
            .pipe(
              map(result => {
                return { ...item, cnt: result.count };
              })
            )
        } else {
          return of({ ...item, cnt: 0 });
        }
      }),
      concatMap(item => {
        if (item.gene2 === 'none') {
          // console.log('[코멘트][614][', item.gene1, item.mutationList1.functional_impact, testType);
          // console.log('[코멘트][615][', item.gene1, item.gene2, item.tsv.clinvar, item.tsv);
          // const clinvar = item.tsv.clinvar.toString().toLowerCase();
          let clinvar = '';
          if (item.mutationList1.functional_impact !== null &&
            item.mutationList1.functional_impact !== undefined) {
            clinvar = item.mutationList1.functional_impact.toString().toLowerCase();
          }
          // console.log('[코멘트][618][', clinvar);
          if (clinvar === 'likely pathogenic'
            || clinvar === 'pathogenic'
            || clinvar === 'pathogenic/likely pathogenic'
            || clinvar === 'likely pathogenic/pathogenic') {
            let gene1;
            const checkNum = item.gene1.split(',');
            gene1 = item.gene1;
            if (checkNum.length === 2) {
              if (checkNum.includes('NRAS')) {
                gene1 = 'NRAS';
              }
            }

            return this.getCommentInfoCount(gene1, testType).pipe(
              map(comments1Count => {
                // console.log('[코멘트][634][', comments1Count);
                return { ...item, comments1Count: comments1Count[0].count, comments2Count: 0 };
              })
            );
          } else {
            return of({ ...item, comments1Count: 0, comments2Count: 0 });
          }

        } else {
          // console.log('[코멘트][617][' + item.tsv.clinvar + ']', item);
          // const clinvar = item.tsv.clinvar.toString().toLowerCase();
          let clinvar = '';
          if (item.mutationList1.functional_impact !== null &&
            item.mutationList1.functional_impact !== undefined) {
            clinvar = item.mutationList1.functional_impact.toString().toLowerCase();
          }
          if (clinvar === 'likely pathogenic'
            || clinvar === 'pathogenic'
            || clinvar === 'pathogenic/likely pathogenic'
            || clinvar === 'likely pathogenic/pathogenic') {
            // console.log('==== [654][코멘트 갯수]');
            // CSDE1,NRAS 인경우 NRAS로 찿는다.
            let tempMentcountGene;
            if (item.gene1 === 'NRAS') {
              tempMentcountGene = item.gene1;
            } else {
              // tempMentcountGene = item.gene2;
              tempMentcountGene = item.multigenes;
            }
            return this.getCommentInfoCount(tempMentcountGene, testType).pipe(
              map(comments1Count => {
                // console.log('==== [664][코멘트 갯수]', comments1Count, item.gene1, testType, item.tsv.clinvar);
                return { ...item, comments1Count: comments1Count[0].count, comments2Count: 0 };
              })
            );
          } else {
            return of({ ...item, comments1Count: 0, comments2Count: 0 });
          }
        }
      }),
      concatMap(item => {  // Comments
        // console.log('[코멘트][677]  ====>', item);
        if (item.gene2 === 'none') {
          // const clinvar = item.tsv.clinvar.toString().toLowerCase();
          // console.log('[코멘트][575][', item.gene1, item.mutationList1.functional_impact);
          let clinvar = '';
          if (item.mutationList1.functional_impact !== null &&
            item.mutationList1.functional_impact !== undefined) {
            clinvar = item.mutationList1.functional_impact.toString().toLowerCase();
          }
          if (clinvar === 'likely pathogenic'
            || clinvar === 'pathogenic'
            || clinvar === 'pathogenic/likely pathogenic'
            || clinvar === 'likely pathogenic/pathogenic') {
            let gene1;
            const checkNum = item.gene1.split(',');
            gene1 = item.gene1;
            if (checkNum.length === 2) {
              if (checkNum.includes('NRAS')) {
                gene1 = 'NRAS';
              }
            }

            return this.getCommentInfoLists(gene1, testType).pipe(
              map(comment => {
                // console.log('==== [698][코멘트정보 내용]  Comment List :', comment);
                if (Array.isArray(comment) && comment.length) {
                  return { ...item, commentList1: comment[0], commentList2: 'none' };
                } else {
                  return { ...item, commentList1: 'none', commentList2: 'none' };
                }
              })
            );
          } else {
            return of({ ...item, commentList1: 'none', commentList2: 'none' });
          }
        } else {
          // const clinvar = item.tsv.clinvar.toString().toLowerCase();
          let clinvar = '';
          if (item.mutationList1.functional_impact !== null &&
            item.mutationList1.functional_impact !== undefined) {
            clinvar = item.mutationList1.functional_impact.toString().toLowerCase();
          }
          if (clinvar === 'likely pathogenic'
            || clinvar === 'pathogenic'
            || clinvar === 'pathogenic/likely pathogenic'
            || clinvar === 'likely pathogenic/pathogenic') {
            // CSDE1,NRAS 인경우 NRAS로 찿는다.
            let tempMentGene;
            if (item.gene1 === 'NRAS') {
              tempMentGene = item.gene1;
            } else {
              // tempMentGene = item.gene2;
              tempMentGene = item.multigenes;
            }
            return this.getCommentInfoLists(tempMentGene, testType).pipe(
              map(comment => {
                // console.log('[405][멘트정보]  Comment List :', comment);
                if (Array.isArray(comment) && comment.length) {
                  return { ...item, commentList1: comment[0], commentList2: 'none' };
                } else {
                  return { ...item, commentList1: 'none', commentList2: 'none' };
                }
              })
            );
          } else {
            return of({ ...item, commentList1: 'none', commentList2: 'none' });
          }
        }
      })
    ); // End of pipe



  }

  updateExaminer(part: string, name: string, specimenNo: string): any {
    if (part === 'exam') {
      this.store.setExamin(name);
    } else if (part === 'recheck') {
      this.store.setRechecker(name);
    }

    return this.http.post(`${this.apiUrl}/patients_diag/updateExaminer`, { part, name, specimenNo });
  }

  // 검진 사용자 목록 가져오기
  getDiagList(): Observable<IDList[]> {
    return this.http.post<IDList[]>(`${this.apiUrl}/loginDiag/listDiag`, { dept: 'D' })
      .pipe(
        shareReplay()
      );
  }

  // 검진 수정버튼 누를때 screenstatus 1번으로 리셋
  resetscreenstatus(specimenNo: string, num, userid: string, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients_diag/reset`, { specimenNo, num, userid, type });
  }

  // changestatus
  // patient screenstatus 만 변경
  changescreenstatus(specimenNo: string, num, userid: string, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients_diag/changestatus`, { specimenNo, num, userid, type });
  }

  // 현재 설정된 screenstatus 가져오기
  getScreenStatus(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients_diag/screenstatus`, { specimenNo });
  }

  // EMR 전송회수 보내기
  setEMRSendCount(specimenNo: string, sendEMR: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients_diag/setEMRSendCount`, { specimenNo, sendEMR });
  }

  // 코멘트 저장 하기
  insertComments(comments: IComment[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/ngscomments/insert`, { comments });
  }

  // gene 로 mutation 에 있는지 확인 숫자로 옴
  findMutationBygene(gene: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/searchbygene`, { gene });
  }

  // artifacts 저장
  /*  artifacts/insert
    const gene              = req.body.gene;
    const locat             = req.body.loc2;
    const exon              = req.body.exon;
    const transcript        = req.body.transcript;
    const coding            = req.body.coding;
  const amion_acid_change = req.body.aminoAcidChange;
  */
  saveArfitacts(
    gene: string,
    transcript: string,
    coding: string,
    aminoAcidChange: string,
    loc2 = '',
    exon = '',
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/ngsartifacts/insert`, { gene, transcript, coding, aminoAcidChange, loc2, exon });
  }

  // 진검 유전체 관리
  getGeneList(type: string): Observable<any> {
    const genelists: IGeneList[] = [];
    return this.http.post(`${this.apiUrl}/diaggene/list`, { type });
  }


  // benign 저장
  /*
    benign/insert
     const gene              = req.body.gene;
     const locat             = req.body.loc2;
     const exon              = req.body.exon;
     const transcript        = req.body.transcript;
     const coding            = req.body.coding;
     const amion_acid_change = req.body.aminoAcidChange;
  */
  saveBenign(
    gene: string,
    transcript: string,
    coding: string,
    aminoAcidChange: string,
    loc2 = '',
    exon = '',
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/ngsartifacts/insert`, { gene, transcript, coding, aminoAcidChange, loc2, exon });
  }

  // AML/ALL
  // 날자별 환자ID, 검사ID 검사인 찿기
  public amlallSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listAml`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  // lymphoma: http
  public lymphomaSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listLymphoma`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  // MDS/MPN
  public mdsmpnSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listMdsMpn`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }



  // genetic 유전성 유전성
  public hereditarySearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listGenetic`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  // sequencing
  public sequencingSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    this.patientInfo = [];
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listSequencing`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  public sequencingSearch2(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = '') {
    return fetch(`${this.apiUrl}/searchpatient_diag/listSequencing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start, end, patientID, specimenNo, status, sheet,
      }),
    });


  }


  // mlpa
  public mlpaSearch(start: string, end: string, patientID: string = '',
    specimenNo: string = '',
    status: string = '', sheet: string = ''): Observable<IPatient[]> {
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_diag/listMlpa`,
      { start, end, patientID, specimenNo, status, sheet }).pipe(
        tap(data => this.patientInfo = data),
        shareReplay()
      );
  }

  public screenSelect(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/screen/query`, { specimenNo });
  }

  // comment list 가져오기
  public getCommentsList(genes: string, sheet: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/list`, { genes, sheet });
  }


  mlpafiltering(testedID: string, type: string, specimenNo: string): Observable<any> {
    return this.screenSelect(testedID).pipe(
      switchMap((data) => from(data)),
      concatMap((item: any) => {
        const artifacts$ = this.getArtifactsInfoCount(item.gene, item.coding, type);
        return artifacts$.pipe(
          map(data => {
            if (parseInt(data[0].count, 10) > 0) {
              item.type = 'A';
              return item;
            }
            return item;
          })
        );
      }),
      concatMap((item: any) => {
        const mutation$ = this.getMutationInfoLists(item.gene, item.coding, type);
        return mutation$.pipe(
          map(lists => {
            if (Array.isArray(lists) && lists.length) {
              item.type = 'M';
              return item;
            }
            item.type = '';
            return item;
          })
        );
      }),
      concatMap((items: any) => {
        const comments$ = this.getCommentInfoLists(items.gene, type);
        return comments$.pipe(
          map(comments => {
            // console.log(comments);
            if (Array.isArray(comments) && comments.length) {
              return items = { ...items, comments: comments[0] };
            }
            return items = { ...items, comments: 'none' };
          })
        );
      }),
      concatMap(items => {
        const tempGene = items.gene;
        const tempCoding = items.nucleotide_change;
        return this.getMutaionGeneAminoacid(tempGene, tempCoding, specimenNo, 'M')
          .pipe(
            map(result => {
              if (parseInt(result.count, 10) > 1) {
                items.cnt = result.count;
                return [items];
              }
              items.cnt = 0;
              return [items];
            })
          );

      }),
    ); // End of return
  }



}
