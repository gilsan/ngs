import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InhouseRoutingModule } from './inhouse-routing.module';
import { InhouseComponent } from './inhouse.component';
import { MutationComponent } from './mutation/mutation.component';

import { ArtifactsComponent } from './artifacts/artifacts.component';
import { CommentsComponent } from './comments/comments.component';
import { BenignComponent } from './benign/benign.component';
import { GenemgnComponent } from './genemgn/genemgn.component';
import { AddgeneComponent } from './genemgn/addgene/addgene.component';
import { UpdategeneComponent } from './genemgn/updategene/updategene.component';
import { DeletegeneComponent } from './genemgn/deletegene/deletegene.component';
// import { MatDialogModule } from '@angular/material/dialog';
import { MgngeneComponent } from './mgngene/mgngene.component';
import { MaterialModule } from '../material.module';
import { TypestaticsComponent } from './statistics/typestatics/typestatics.component';
// import { MaterialModule } from '../material.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgsexcelComponent } from './ngsexcel/ngsexcel.component';
// import { ResizetableDirective } from './directive/resizetable.directive';
// import { ResizableModule } from './resizable/resizable.module';


@NgModule({
  declarations: [
    InhouseComponent,
    MutationComponent,
    ArtifactsComponent,
    CommentsComponent,
    BenignComponent,
    GenemgnComponent,
    AddgeneComponent,
    UpdategeneComponent,
    DeletegeneComponent,
    MgngeneComponent,
    TypestaticsComponent,
    NgsexcelComponent,

  ],
  imports: [

    CommonModule,
    InhouseRoutingModule,
    MaterialModule,
    NgxEchartsModule,

  ]
})
export class InhouseModule { }
