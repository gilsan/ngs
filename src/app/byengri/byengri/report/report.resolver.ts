import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IPatient } from '../../models/patients';
import { PathologyService } from '../../services/pathology.service';

@Injectable({
  providedIn: 'root'
})
export class ReportResolver implements Resolve<IPatient> {

  constructor(
    private pathologyService: PathologyService,
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): IPatient | Observable<IPatient> | Promise<IPatient> {
    const pathologyNum = route.paramMap.get('id');
    return this.pathologyService.findPatientinfo(pathologyNum);
  }

}
