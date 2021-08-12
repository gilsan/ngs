import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAFormVariant, IComment, IImmundefi, IPatient, IProfile, ISequence } from '../models/patients';
import { createHostBinding } from '@angular/compiler/src/core';
import { emrUrl } from 'src/app/config';


@Injectable({
  providedIn: 'root'
})
export class DetectedVariantsService {

  // private apiUrl = 'http://112.169.53.30:3000';
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }


  // tslint:disable-next-line:max-line-length
  public screenInsert(specimenNo: string, detectedVariants: IAFormVariant[],
    comments: IComment[], profile: IProfile, resultStatus: string, patientInfo: IPatient): Observable<any> {
    // console.log('[19][DetectedVariantsService] ', specimenNo, detectedVariants, comments, profile, patientInfo);
    let detectedType: string;
    const { chron, flt3itd, leukemia } = profile;
    if (resultStatus === 'Detected') {
      detectedType = 'detected';
    } else if (resultStatus === 'Not Detected') {
      detectedType = 'notdetected';
    }
    return this.http.post(`${this.apiUrl}/screen/insert`,
      {
        specimenNo,
        detected_variants: detectedVariants,
        comments,
        chron,
        flt3itd,
        leukemia,
        resultStatus: detectedType, // detected, notdetected
        patientInfo
      });
  }


  // 정렬
  public screenTempSave2(specimenNo: string, detectedVariants: IAFormVariant[],
    comments: IComment[], profile: IProfile, resultStatus: string, patientInfo: IPatient): Observable<any> {
    // console.log('[19][DetectedVariantsService] ', specimenNo, detectedVariants, comments, profile, patientInfo);
    let detectedType: string;
    const { chron, flt3itd, leukemia } = profile;
    if (resultStatus === 'Detected') {
      detectedType = 'detected';
    } else if (resultStatus === 'Not Detected') {
      detectedType = 'notdetected';
    }
    return this.http.post(`${this.apiUrl}/screen/tempsave2`,
      {
        specimenNo,
        detected_variants: detectedVariants,
        comments,
        chron,
        flt3itd,
        leukemia,
        resultStatus: detectedType, // detected, notdetected
        patientInfo
      });
  }

  // 임시저장
  public screenTempSave(specimenNo: string, detectedVariants: IAFormVariant[],
    comments: IComment[], profile: IProfile, resultStatus: string, patientInfo: IPatient): Observable<any> {
    // console.log('[19][DetectedVariantsService] ', specimenNo, detectedVariants, comments, profile, patientInfo);
    let detectedType: string;
    const { chron, flt3itd, leukemia } = profile;
    if (resultStatus === 'Detected') {
      detectedType = 'detected';
    } else if (resultStatus === 'Not Detected') {
      detectedType = 'notdetected';
    }
    return this.http.post(`${this.apiUrl}/screen/tempsave`,
      {
        specimenNo,
        detected_variants: detectedVariants,
        comments,
        chron,
        flt3itd,
        leukemia,
        resultStatus: detectedType, // detected, notdetected
        patientInfo
      });
  }

  public allscreenInsert(specimenNo: string, detectedVariants: IAFormVariant[],
    comments: IComment[], profile: IProfile, resultStatus: string, patientInfo: IPatient): Observable<any> {
    // console.log('[19][DetectedVariantsService] ', specimenNo, detectedVariants, comments, profile, patientInfo);
    const { chron, flt3itd, leukemia } = profile;
    return this.http.post(`${this.apiUrl}/allscreen/insert`,
      {
        specimenNo,
        detected_variants: detectedVariants,
        comments,
        chron,
        flt3itd,
        leukemia,
        resultStatus, // detected, notdetected
        patientInfo
      });
  }

  public screenFind(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/screen/find`, { specimenNo });
  }

  public allscreenFind(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/allscreen/find`, { specimenNo });
  }

  public screenSelect(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/screen/query`, { specimenNo });
  }

  public allscreenSelect(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/allscreen/query`, { specimenNo });
  }

  public screenComment(specimenNo: string): Observable<IComment[]> {
    return this.http.post<IComment[]>(`${this.apiUrl}/screen/comments`, { specimenNo });
  }

  public allscreenComment(specimenNo: string): Observable<IComment[]> {
    return this.http.post<IComment[]>(`${this.apiUrl}/allscreen/comments`, { specimenNo });
  }



  public screenUpdate(specimenNo: string, detectedVariants: IAFormVariant[],
    comments: IComment[] = [], profile: IProfile, patientInfo: IPatient): Observable<any> {
    console.log('[45][detectedVariantsService]', specimenNo, detectedVariants, comments, profile);
    return this.http.post(`${this.apiUrl}/screen/finish`, {
      specimenNo,
      detected_variants: detectedVariants,
      comments,
      profile,
      patientInfo
    });
  }


  public allscreenUpdate(specimenNo: string, detectedVariants: IAFormVariant[],
    comments: IComment[] = [], profile: IProfile, patientInfo: IPatient): Observable<any> {
    console.log('[45][detectedVariantsService]', specimenNo, detectedVariants, comments, profile);
    return this.http.post(`${this.apiUrl}/allscreen/finish`, {
      specimenNo,
      detected_variants: detectedVariants,
      comments,
      profile,
      patientInfo
    });
  }

  public screenPathologyEmrUpdate(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathEmrUpdate/pathologyEmrSendUpdate`, { pathologyNo });
  }

  public screenEmrUpdate(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathEmrUpdate/pathEmrSendUpdate`, { specimenNo });
  }

  public getScreenComments(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/screenlist/comments`, { specimenNo });
  }

  public getScreenTested(specimenNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/screen/find`, { specimenNo });
  }

  // 선천성 면역결핍증 임시저장
  public saveScreen6(specimenNo: string, immundefi: IImmundefi[], patientInfo: IPatient): Observable<any> {
    //  screen/tempsave6
    return this.http.post(`${this.apiUrl}/screen/tempsave6`, { specimenNo, immundefi, patientInfo });
  }

  // 선천성 면역결핍증 내용 가져오기
  public contentScreen6(specimenNo: string): Observable<any> {
    // screen/listScreen6
    return this.http.post(`${this.apiUrl}/screen/listScreen6`, { specimenNo });
  }

  // Sequencing 임시저장
  public saveScreen7(specimenNo: string, sequencing: ISequence[], patientInfo: IPatient): Observable<any> {
    //  screen/tempsave7
    return this.http.post(`${this.apiUrl}/screen/tempsave7`, { specimenNo, sequencing, patientInfo });
  }

  // Sequencing 내용 가져오기
  public contentScreen7(specimenNo: string): Observable<any> {
    // screen/listScreen7
    return this.http.post(`${this.apiUrl}/screen/listScreen7`, { specimenNo });
  }


}
