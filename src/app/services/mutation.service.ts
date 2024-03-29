import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IAML, IGenetic, IMutation, ISEQ } from 'src/app/inhouse/models/mutation';
import { emrUrl } from 'src/app/config';
import { Ilymphoma } from '../home/models/patients';

@Injectable({
  providedIn: 'root',
})
export class MutationService {

  mutationInfo: IMutation[];

  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public getMutationList(genes: string, coding: string, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/list`, { genes, coding, type });
  }

  /* 2021.03.02
  public insertMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string,
    exac: string, exac_east_asia: string, krgdb: string, etc1: string, etc2: string, etc3: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/insert`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId, exac, exac_east_asia, krgdb, etc1, etc2, etc3
    });
  }
  */

  public insertMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutationMapper/insert`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId, type
    });
  }

  /*
  public updateMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string,
    exac: string, exac_east_asia: string, krgdb: string, etc1: string, etc2: string, etc3: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/update`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId, exac, exac_east_asia, krgdb, etc1, etc2, etc3
    });
    */
  public updateMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutationMapper/update`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId, type
    });
  }

  public deleteMutationList(id: string, genes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutationMapper/delete`, { id });
  }

  // 환자 번호로 검색하기
  public getLymphoma(registernum: string): Observable<Ilymphoma> {
    return this.http.post<Ilymphoma>(`${this.apiUrl}/mutationMapper/getinfo`, { registernum });
  }

  // 환자번호로 정보 갱신하기
  public updateLymphoma(registernum: string, data: Ilymphoma): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutationMapper/updateinfo`, { registernum, data });
  }


  // 유전성유전 조회
  public listGenetic(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/geneticlists`, { specimenNo });
  }

  // 유전성유전 입력
  public insertGenetic(genetic: IGenetic): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/geneticinsert`, { genetic });
  }

  // 유전성유전 갱신
  public updateGenetic(genetic: IGenetic): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/geneticupdate`, { genetic });
  }


  // 유전성유전 삭제
  public deleteGenetic(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/geneticdelete`, { id });
  }


  // Sequencing 입력
  public insertSequencing(seq: ISEQ): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/seqinsert`, { seq });
  }

  // Sequencing 갱신
  public updateSequencing(seq: ISEQ): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/sequpdate`, { seq });
  }

  // Sequencing 삭제
  public deleteSequencing(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/seqdelete`, { id });
  }

  // AML 입력
  public insertAML(aml: IAML, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/amlInsert`, { aml, type });
  }

  //  AML 갱신
  public updateAML(aml: IAML, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/amlUpdate`, { aml, type });
  }

  //  AML 삭제
  public deleteAML(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/amlDelete`, { id });
  }

  //  AML 목록
  public listsAML(type: string): Observable<IAML[]> {
    return this.http.post<IAML[]>(`${this.apiUrl}/mutation/amlLists`, { type });
  }





}

