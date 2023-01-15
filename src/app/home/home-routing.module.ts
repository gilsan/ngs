import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiseaseformComponent } from '../forms/diseaseform/diseaseform.component';
import { DiseaseToDbComponent } from './components/disease-to-db/disease-to-db.component';
import { FileuploadComponent } from './components/fileupload/fileupload.component';
import { InhouseToDbComponent } from './components/inhouse-to-db/inhouse-to-db.component';
import { MainComponent } from './components/main/main.component';
import { MainscreenComponent } from './components/mainscreen/mainscreen.component';
import { BenignComponent } from '../inhouse/benign/benign.component';
import { ArtifactsComponent } from '../inhouse/artifacts/artifacts.component';
import { MutationComponent } from '../inhouse/mutation/mutation.component';
import { CommentsComponent } from '../inhouse/comments/comments.component';
import { GenemgnComponent } from '../inhouse/genemgn/genemgn.component';
import { MgngeneComponent } from '../inhouse/mgngene/mgngene.component';
import { ManageFunctionsComponent } from './components/manage-functions/manage-functions.component';
import { DetailFunctionsComponent } from './components/detail-functions/detail-functions.component';
import { ManageStatisticsComponent } from './components/manage-statistics/manage-statistics.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { HomeComponent } from './home.component';
import { MaindiagComponent } from './components/maindiag/maindiag.component';
import { TypestaticsComponent } from '../inhouse/statistics/typestatics/typestatics.component';

import { AmlallComponent } from './components/amlall/amlall.component';
import { LymphomaComponent } from './components/lymphoma/lymphoma.component';
import { MlpaComponent } from './components/mlpa/mlpa.component';
import { SequencingComponent } from './components/sequencing/sequencing.component';
import { HereditaryComponent } from './components/hereditary/hereditary.component';
import { MdsmpnComponent } from './components/mdsmpn/mdsmpn.component';
import { ReportmgnComponent } from './components/reportmgn/reportmgn.component';
import { Form5Component } from '../forms/mlpa/form5.component';
import { Form7Component } from '../forms/sequencing/form7.component';
import { Form6Component } from '../forms/hereditary/form6.component';
import { Form4Component } from '../forms/mdsmpn/form4.component';
import { Form3Component } from '../forms/lymphoma/form3.component';
import { Form2Component } from '../forms/form2/form2.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainListsComponent } from '../forms/ig_tcr/mainList/mainLists.component';
import { IgTcrSheetComponent } from '../forms/ig_tcr/igtcrSheet/igtcrSheet.component';
import { JsPDFComponent } from '../forms/ig_tcr/jspdf/jspdf.component';

// import { AllamlComponent } from './components/amlall/allaml/allaml.component';
// import { LymComponent } from './components/lymphoma/lym/lym.component';



const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: 'main', component: MainscreenComponent },
      // { path: '', component: AmlallComponent },
      { path: '', component: DashboardComponent },
      { path: 'board', component: DashboardComponent },
      { path: 'amlall', component: AmlallComponent },
      { path: 'amlall/:type', component: AmlallComponent },
      { path: 'amlall/form2', component: Form2Component },
      { path: 'amlall/form2/:type/:id', component: Form2Component },

      { path: 'lymphoma', component: LymphomaComponent },
      { path: 'lymphoma/:type', component: LymphomaComponent },
      { path: 'lymphoma/form3', component: Form3Component },
      { path: 'lymphoma/form3/:type/:id', component: Form3Component },

      { path: 'mdsmpn', component: MdsmpnComponent },
      { path: 'mdsmpn/:type', component: MdsmpnComponent },
      { path: 'mdsmpn/form4', component: Form4Component },
      { path: 'mdsmpn/form4/:type/:id', component: Form4Component },

      { path: 'hereditary', component: HereditaryComponent },
      { path: 'hereditary/:type', component: HereditaryComponent },
      { path: 'hereditary/form6', component: Form6Component },
      { path: 'hereditary/form6/:type/:id', component: Form6Component },

      { path: 'sequencing', component: SequencingComponent },
      { path: 'sequencing/:type', component: SequencingComponent },
      { path: 'sequencing/form7', component: Form7Component },
      { path: 'sequencing/form7/:type/:id', component: Form7Component },

      { path: 'mlpa', component: MlpaComponent },
      { path: 'mlpa/:type', component: MlpaComponent },
      { path: 'mlpa/form5', component: Form5Component },
      { path: 'mlpa/form5/:type/:id', component: Form5Component },
      { path: 'fileupload', component: FileuploadComponent },
      { path: 'fileupload/:id', component: FileuploadComponent },
      { path: 'inhouse_to_db', component: InhouseToDbComponent },
      { path: 'igtcrMainLists', component: MainListsComponent},
      { path: 'igtcrMainLists/igtcrsheet', component: IgTcrSheetComponent },
      { path: 'jspdf', component: JsPDFComponent},
      // { path: 'disease_to_db', component: DiseaseToDbComponent },
      // { path: 'main', component: MainscreenComponent },
      {
        path: 'jingum', loadChildren: () => import('../forms/forms.module').then((m) => m.SaintFormsModule)
      },
      { path: 'jingum/:testcode', loadChildren: () => import('../forms/forms.module').then((m) => m.SaintFormsModule) },
      { path: 'inhouse', loadChildren: () => import('../inhouse/inhouse.module').then((m) => m.InhouseModule) },
      { path: 'benignComponent', component: BenignComponent },
      { path: 'artifactsComponent', component: ArtifactsComponent },
      { path: 'mutationComponent', component: MutationComponent },
      { path: 'commentsComponent', component: CommentsComponent },
      { path: 'genemgnComponent', component: GenemgnComponent },
      { path: 'managestatistics', component: ManageStatisticsComponent },
      { path: 'managefunctions', component: ManageFunctionsComponent },
      { path: 'detailfunctions', component: DetailFunctionsComponent },
      { path: 'manageusers', component: ManageUsersComponent },
      { path: 'reportmgn', component: ReportmgnComponent },
      { path: 'disease_test', component: DiseaseformComponent },
      { path: 'maindiag', component: MaindiagComponent },
      { path: 'typestatics', component: TypestaticsComponent },

      // { path: 'researchamlall', component: AllamlComponent },
      // { path: 'researchlym', component: LymComponent },

      // { path: '**', component: AmlallComponent },

    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class HomeRoutingModule { }
