import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { emrUrl } from 'src/app/config';
import { ILIMS } from '../models/lims.model';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LimsService {

  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient
  ) { }

  search(start: string): Observable<ILIMS[]> {
    return this.http.post<ILIMS[]>(`${this.apiUrl}/lims/lists`, { start })
      .pipe(
        shareReplay()
      );
  }

  save(lims: ILIMS): Observable<any> {
    return this.http.post(`${this.apiUrl}/lims/save`, { lims });
  }





}
