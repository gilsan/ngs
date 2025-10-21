import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { UploadResponse } from '../models/uploadfile';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {
  // private apiUrl = 'http://112.169.53.30:3000';
  // private apiUrl = 'http://160.1.17.79:3000'; // EMR 서버
  private apiUrl = emrUrl;
  //private handleError: HandlerError;

  httpOptions = {
    header: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  redirectUrl: string;

  constructor(
    private http: HttpClient,
    //private httpErrorHandler: HttpErrorHandler
  ) {
    // this.handleError = this.httpErrorHandler.createHandleError('FileUploadService');
  }

  /** 공통: 에러 처리 */
  private handleError(error: HttpErrorResponse) {
    const message =
      error?.error?.message ||
      (typeof error?.error === 'string' ? error.error : null) ||
      '알 수 없는 오류';
    return throwError(() => ({ ...error, message }));
  }

  fileUpload(formData: any): any {
    return this.http.post(`${this.apiUrl}/fileUpload/upload`, formData, {
      reportProgress: true,
      //observe: 'response',
      //responseType: 'text'   // ✅ 중요
    }).pipe(
      //catchError((error) => this.handleError(error)),
      //map(event => this.getEventMessage(event)), // 이벤트 처리
      // 이벤트 필터링
      map(event => {
        console.log('업로드 :', event);
        //if (event.type === HttpEventType.UploadProgress) {
        //  return { progress: Math.round(100 * event.loaded / (event.total ?? 1)), files: [] };
        //} 
        //else if (event.type === HttpEventType.Response) {
        /* 
        if (event.type === HttpEventType.Response) {
          return event.body;
        } 
        else if ((event as any).partialText) {
          try {
            // partialText 안 JSON 파싱
            const parsed = JSON.parse((event as any).partialText);
            return { progress: 100, files: [], message: parsed.err || parsed.message };
          } catch {
            return { progress: 100, files: [], message: (event as any).partialText };
          }
        }
        return null; */
        return event; 
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('업로드 오류:', error);
        
        // 서버 에러 메시지 안전하게 추출
        let message = '알 수 없는 오류';

        // partialText가 있으면 JSON 파싱
        if ((error as any).partialText) {
          try {
            const parsed = JSON.parse((error as any).partialText);
            message = parsed.err || parsed.message || message;
          } catch {
            message = (error as any).partialText;
          }
        } else if (error.error?.message) {
          message = error.error.message;
        } else if (typeof error.error === 'string') {
          message = error.error;
        }

        return throwError(() => ({ ...error, message }));
      })
      //  catchError(this.handleError('fileUpload', null))
    );
  }

  inhouseDataUpload(formData: any): any {
    return this.http.post(`${this.apiUrl}/inhouseUplad/inhousetodb`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event))
    );
  }

  pathDataUpload(formData: any): Observable<UploadResponse> {
    console.log('[49][file-upload][pathfileUpload/upload]', formData);
    return this.http.post(`${this.apiUrl}/pathfileUpload/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event))
    );
  }

  pathImageUpload(formData: any): Observable<UploadResponse> {
    console.log('[49][file-upload][pathfileUpload/upload]', formData);
    return this.http.post(`${this.apiUrl}/pathimageUpload/imagefileupload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event))
    );
  }

  pathResearchDataUpload(formData: any): Observable<UploadResponse> {
    console.log('[63][file-upload][pathResearchDataUpload][연구용]', formData);
    return this.http.post(`${this.apiUrl}/pathResearchfileUpload/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event))
    );
  }


  private getEventMessage(event: HttpEvent<any>): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return this.fileUploadProgress(event);
      case HttpEventType.Response:
        // 응답이 string일 수도 있으니 JSON.parse 시도
        try {
          return JSON.parse(event.body);
        } catch {
          return event.body;
        }
      default:
        return `Upload event: ${event.type}.`;
    }
  }

  private fileUploadProgress(event: any): any {
    const percentDone = Math.round(100 * event.loaded / event.total);
    return { progress: percentDone, files: [] };
  }




}
