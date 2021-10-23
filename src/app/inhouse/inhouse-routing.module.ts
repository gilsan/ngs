import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArtifactsComponent } from './artifacts/artifacts.component';
import { BenignComponent } from './benign/benign.component';
import { CommentsComponent } from './comments/comments.component';
import { GenemgnComponent } from './genemgn/genemgn.component';
import { InhouseComponent } from './inhouse.component';
import { ManagecodeComponent } from './managecode/managecode.component';
import { MentmanageComponent } from './mentmanage/mentmanage.component';
import { MgngeneComponent } from './mgngene/mgngene.component';
import { MutationComponent } from './mutation/mutation.component';
import { NgsexcelComponent } from './ngsexcel/ngsexcel.component';

const routes: Routes = [
  {
    path: '', component: InhouseComponent, children: [
      { path: 'mutation', component: MutationComponent },
      { path: 'artifacts', component: ArtifactsComponent },
      { path: 'benign', component: BenignComponent },
      { path: 'comments', component: CommentsComponent },
      { path: 'genemgn', component: MgngeneComponent },
      { path: 'ngsexcel', component: NgsexcelComponent },
      { path: 'ment', component: MentmanageComponent },
      { path: 'codemgn', component: ManagecodeComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class InhouseRoutingModule { }
