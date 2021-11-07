import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ByengriComponent } from './byengri/byengri.component';
import { ManageStatisticsComponent } from './byengri/manage-statistics/manage-statistics.component';
import { ManageUsersComponent } from './byengri/manage-users/manage-users.component';
import { ReportComponent } from './byengri/report/report.componen';
import { ReportResolver } from './byengri/report/report.resolver';
import { ResearchComponent } from './byengri/research/research.component';
import { SequencingreportComponent } from './byengri/sequencingreport/sequencingreport.component';
// import { SequencingResolver } from './byengri/sequencingreport/sequencingResolver';

import { FileuploadComponent } from './fileupload/fileupload.component';
import { BlacklistComponent } from './inhouse/blacklist/blacklist.component';
import { EssgeneComponent } from './inhouse/essgene/essgene.component';
import { NgsexcelComponent } from './inhouse/ngsexcel/ngsexcel.component';
import { PatientexcelComponent } from './inhouse/patientexcel/patientexcel.component';
import { TierComponent } from './inhouse/tier/tier.component';
import { MainComponent } from './main/main.component';
import { MainpaComponent } from './mainpa/mainpa.component';
// import { PathReportComponent } from './path-report/path-report.component';
import { SequencingComponent } from './sequencing/sequencing.component';

const routes: Routes = [
  {
    path: '', component: ByengriComponent, children: [
      { path: '', component: MainComponent },
      { path: 'orir', component: MainComponent },
      { path: 'sequencing', component: SequencingComponent },
      { path: 'sequencingReport', component: SequencingreportComponent },
      {
        path: 'sequencingReport/:id', component: SequencingreportComponent,
        resolve: { patientinfo: ReportResolver }
      },
      { path: 'fileupload', component: FileuploadComponent },
      {
        path: 'fileupload/:id', component: FileuploadComponent
      },
      { path: 'report', component: ReportComponent },
      {
        path: 'report/:id', component: ReportComponent,
        resolve: { patientinfo: ReportResolver }
      },
      { path: 'managestatistics', component: ManageStatisticsComponent },
      { path: 'manageusers', component: ManageUsersComponent },
      { path: 'report/:pathologyNum', component: ReportComponent },
      { path: 'blacklist', component: BlacklistComponent },
      { path: 'mainpa', component: MainpaComponent },
      { path: 'research', component: ResearchComponent },
      { path: 'research/:id', component: ResearchComponent, resolve: { patientinfo: ReportResolver } },
      { path: 'ngsexcel', component: NgsexcelComponent },
      { path: 'patientexcel', component: PatientexcelComponent },
      { path: 'EssGene', component: TierComponent }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],


  exports: [RouterModule]
})
export class ByengriRouting {

}
