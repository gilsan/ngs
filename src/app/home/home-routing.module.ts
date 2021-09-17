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


const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: '', component: MainscreenComponent },
      { path: 'amlall2', component: AmlallComponent },
      { path: 'amlall', component: AmlallComponent },
      { path: 'lymphoma', component: LymphomaComponent },
      { path: 'mdsmpn', component: MdsmpnComponent },
      { path: 'hereditary', component: HereditaryComponent },
      { path: 'sequencing', component: SequencingComponent },
      { path: 'mlpa', component: MlpaComponent },
      { path: 'fileupload', component: FileuploadComponent },
      { path: 'fileupload/:id', component: FileuploadComponent },
      { path: 'inhouse_to_db', component: InhouseToDbComponent },
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
      { path: 'disease_test', component: DiseaseformComponent },
      { path: 'maindiag', component: MaindiagComponent },
      { path: 'typestatics', component: TypestaticsComponent },
      { path: '**', component: AmlallComponent },

    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class HomeRoutingModule { }
