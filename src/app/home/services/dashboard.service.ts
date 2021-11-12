
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IINFO {
  type: string;
  subtype: string;

}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private http: HttpClient,
  ) { }

  info: IINFO = { type: '', subtype: '' };

  public dashBoardSetParmas(type: string, subtype: string): void {
    this.info.type = type;
    this.info.subtype = subtype;

  }

  public dashboardGetParams(): IINFO {
    return this.info;
  }




}
