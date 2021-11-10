import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { IFilteredOriginData, IGENO, Ipolymorphism, IStateControl } from '../models/patients';



@Injectable({
  providedIn: 'root'
})
export class FilteredService {

  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  //  filteredOriginData/list,  POST { pathologyNum: "123456" }
  getfilteredOriginDataList(pathologyNum: string): Observable<IFilteredOriginData[]> {
    return this.http.post<IFilteredOriginData[]>(`${this.apiUrl}/filteredOriginData/list`, { pathologyNum });
  }

  //  msiscore/list   POST { pathologyNum: "123456" }
  getMsiScroe(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/msiscore/list`, { pathologyNum });
  }

  // tumorcellpercentage/list POST { pathologyNum: "123456" }
  getTumorcellpercentage(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tumorcellpercentage/list`, { pathologyNum });
  }

  // tumorMutationalBurden/list   POST { pathologyNum: "123456" }
  getTumorMutationalBurden(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tumorMutationalBurden/list`, { pathologyNum })
      .pipe(
        tap(data => console.log('service tap', data))
      );
  }

  // tumortype/list   POST { pathologyNum: "123456" }
  getTumorType(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tumortype/list`, { pathologyNum })
      .pipe(
        shareReplay()
      );
  }

  // clinically/list   POST { pathologyNum: "123456" }
  getClinically(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clinically/list`, { pathologyNum })
      .pipe(
        shareReplay()
      );
  }



  // clinical/list   POST { pathologyNum: "123456" }
  getClinical(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clinical/list`, { pathologyNum });
  }

  //  prevalent/list   POST { pathologyNum: "123456" }
  getPrevalent(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/prevalent/list`, { pathologyNum });
  }

  // polymorphism/list GET
  getPolymorphism(): Observable<Ipolymorphism[]> {
    return this.http.get<Ipolymorphism[]>(`${this.apiUrl}/polymorphism/list`);
  }

  // 검색
  searchPolymorphism(gene: string = '', amino: string = '', nucleotide: string = ''): Observable<Ipolymorphism[]> {
    return this.http.post<Ipolymorphism[]>(`${this.apiUrl}/polymorphism/search`,
      { gene, amino_acid_change: amino, nucleotide_change: nucleotide });
  }

  // polymorphism 신규입력
  insertPolymorphism(data: Ipolymorphism): Observable<any> {
    return this.http.post(`${this.apiUrl}/polymorphism/insert`,
      { gene: data.gene, amino_acid_change: data.amino_acid_change, nucleotide_change: data.nucleotide_change, reason: data.reason });
  }

  // polymorphism 갱신
  updatePolymorphism(data: Ipolymorphism): Observable<any> {
    return this.http.post(`${this.apiUrl}/polymorphism/update`,
      // tslint:disable-next-line:max-line-length
      { id: data.id, gene: data.gene, amino_acid_change: data.amino_acid_change, nucleotide_change: data.nucleotide_change, reason: data.reason });
  }

  // polymorphism 삭제
  deletePolymorphism(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/polymorphism/delete`, { id });
  }


  // 정도관리 리스트 요청
  getStatecontrol(pathologyNum: string): Observable<IStateControl[]> {
    return this.http.post<IStateControl[]>(`${this.apiUrl}/statecontrol/list`, { pathologyNum });
  }

  // Gemonic Alteration of
  getGemonic(pathologyNum: string): Observable<IGENO[]> {
    return this.http.post<IGENO[]>(`${this.apiUrl}/clinically/genomicLists`, { pathologyNum });
  }


}
