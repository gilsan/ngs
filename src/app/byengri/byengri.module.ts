import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';


import { ByengriComponent } from './byengri/byengri.component';
import { ByengriRouting } from './byengri.routing';
import { FileuploadComponent } from './fileupload/fileupload.component';
import { MainComponent } from './main/main.component';
import { ReportComponent } from './byengri/report/report.componen';
import { ClarityModule } from '@clr/angular';
import { UploadComponent } from './upload/upload.component';
import { PathReportComponent } from './path-report/path-report.component';
import { MaterialModule } from '../material.module';
import { ManageUsersComponent } from './byengri/manage-users/manage-users.component';
import { ManageStatisticsComponent } from './byengri/manage-statistics/manage-statistics.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { ScrollMonitorDirective } from './directives/scroll-monitor.directive';
import { MainpaComponent } from './mainpa/mainpa.component';
import { PwchangeComponent } from './pwchange/pwchange.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResearchComponent } from './byengri/research/research.component';
import { BlacklistComponent } from './inhouse/blacklist/blacklist.component';
import { SequencingComponent } from './sequencing/sequencing.component';
import { SequencingreportComponent } from './byengri/sequencingreport/sequencingreport.component';
import { ImageuploadComponent } from './imageupload/imageupload.component';
import { NgsexcelComponent } from './inhouse/ngsexcel/ngsexcel.component';
import { PatientexcelComponent } from './inhouse/patientexcel/patientexcel.component';
import { EssgeneComponent } from './inhouse/essgene/essgene.component';
import { GeneComponent } from './inhouse/essgene/gene/gene.component';
import { TierComponent } from './inhouse/tier/tier.component';
import { ReportDialogComponent } from './byengri/report/report-dialog/report-dialog.component';


@NgModule({
  declarations: [
    ByengriComponent,

    FileuploadComponent,
    ReportComponent,
    MainComponent,
    UploadComponent,
    PathReportComponent,
    ManageUsersComponent,
    ManageStatisticsComponent,
    ScrollMonitorDirective,
    MainpaComponent,
    PwchangeComponent,
    ResearchComponent,
    BlacklistComponent,
    SequencingComponent,
    SequencingreportComponent,
    ImageuploadComponent,
    NgsexcelComponent,
    PatientexcelComponent,
    EssgeneComponent,
    GeneComponent,
    TierComponent,
    ReportDialogComponent,
  ],
  imports: [

    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ByengriRouting,
    ClarityModule,
    MaterialModule,
    NgxBarcodeModule
  ],
  entryComponents: [
    PwchangeComponent,

  ]

})
export class ByengriModule { }
