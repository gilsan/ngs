import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ClarityModule } from '@clr/angular';
import { FileuploadComponent } from './components/fileupload/fileupload.component';
import { DiseaseformComponent } from '../forms/diseaseform/diseaseform.component';
import { ExcelDownloadComponent } from './components/excel-download/excel-download.component';
import { InhouseToDbComponent } from './components/inhouse-to-db/inhouse-to-db.component';
import { WorkflowComponent } from './components/workflow/workflow.component';
import { DiseaseToDbComponent } from './components/disease-to-db/disease-to-db.component';

import { MainscreenComponent } from './components/mainscreen/mainscreen.component';
import { TsvuploadComponent } from './components/tsvupload/tsvupload.component';
import { ManageStatisticsComponent } from './components/manage-statistics/manage-statistics.component';
import { ManageFunctionsComponent } from './components/manage-functions/manage-functions.component';
import { DetailFunctionsComponent } from './components/detail-functions/detail-functions.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { MaterialModule } from '../material.module';
import { DiagScrollMonitorDirective } from './components/directive/diag-scroll-monitor.directive';
import { MaindiagComponent } from './components/maindiag/maindiag.component';
import { DiagpasswdchangeComponent } from './diagpasswdchange/diagpasswdchange.component';
import { AmlallComponent } from './components/amlall/amlall.component';
import { LymphomaComponent } from './components/lymphoma/lymphoma.component';
import { MdsmpnComponent } from './components/mdsmpn/mdsmpn.component';
import { HereditaryComponent } from './components/hereditary/hereditary.component';
import { SequencingComponent } from './components/sequencing/sequencing.component';
import { MlpaComponent } from './components/mlpa/mlpa.component';
import { XlxsuploadComponent } from './components/xlxsupload/xlxsupload.component';
import { TxtuploadComponent } from './components/txtupload/txtupload.component';
import { ReportmgnComponent } from './components/reportmgn/reportmgn.component';
import { SaintFormsModule } from '../forms/forms.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ResearchUploadComponent } from './components/research-upload/research-upload.component';


import { AmlallDialogComponent } from './components/amlall/amlall-dialog/amlall-dialog.component';
import { LymDialogComponent } from './components/lymphoma/lym-dialog/lym-dialog.component';
import { MdsDialogComponent } from './components/mdsmpn/mds-dialog/mds-dialog.component';
import { HereDialogComponent } from './components/hereditary/here-dialog/here-dialog.component';
import { MlpaDialogComponent } from './components/mlpa/mlpa-dialog/mlpa-dialog.component';
import { SeqDialogComponent } from './components/sequencing/seq-dialog/seq-dialog.component';
import { MainListsComponent } from '../forms/ig_tcr/mainList/mainLists.component';
import { IgTcrSheetComponent } from '../forms/ig_tcr/igtcrSheet/igtcrSheet.component';
import { JsPDFComponent } from '../forms/ig_tcr/jspdf/jspdf.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { ResearchDialogComponent } from '../forms/ig_tcr/mainList/research-dialog/researchTcr.component';



@NgModule({
  declarations: [
    HomeComponent, FileuploadComponent, DiseaseformComponent, ExcelDownloadComponent,
    InhouseToDbComponent, WorkflowComponent, DiseaseToDbComponent,
    MainscreenComponent,
    TsvuploadComponent,
    ManageStatisticsComponent,
    ManageFunctionsComponent,
    DetailFunctionsComponent,
    ManageUsersComponent,
    DiagScrollMonitorDirective,
    MaindiagComponent,
    DiagpasswdchangeComponent,
    AmlallComponent,
    LymphomaComponent,
    MdsmpnComponent,
    HereditaryComponent,
    SequencingComponent,
    MlpaComponent,
    XlxsuploadComponent,
    TxtuploadComponent,
    ReportmgnComponent,
    DashboardComponent,
    AmlallDialogComponent,
    ResearchUploadComponent,
    MainListsComponent,
    IgTcrSheetComponent,
    ResearchDialogComponent,
    JsPDFComponent,

    LymDialogComponent,
    MdsDialogComponent,
    HereDialogComponent,
    MlpaDialogComponent,
    SeqDialogComponent,


  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    //  ClarityModule,
    SaintFormsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
  ],
  entryComponents: [
    DiagpasswdchangeComponent
  ]
})
export class HomeModule { }
