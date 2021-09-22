import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormsRoutingModule } from './forms-routing.module';
import { FormsComponent } from './forms.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { PreviewComponent } from './preview/preview.component';
// import { AllComponent } from './all/all.component';
import { FilteredComponent } from './commons/filtered/filtered.component';
import { MaterialModule } from '../material.module';
import { DialogOverviewExampleDialogComponent } from './dialog-overview-example-dialog/dialog-overview-example-dialog.component';
// import { TestformComponent } from './testform/testform.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Form2Component } from './form2/form2.component';
import { Form3Component } from './lymphoma/form3.component';
import { Form4Component } from './mdsmpn/form4.component';
import { Form5Component } from './mlpa/form5.component';
import { Form6Component } from './hereditary/form6.component';
import { Form7Component } from './sequencing/form7.component';

import { LymphomaPreviewComponent } from './previews/lymphomaPreview/lymphomaPreview';
import { ImmundefiComponent } from './previews/immundefi/immundefi.component';
import { SequencingComponent } from './previews/sequencing/sequencing.component';
// import { Form1Component } from './form1/form1.component';
import { MlpapreviewComponent } from './previews/mlpapreview/mlpapreview.component';

@NgModule({
  declarations: [
    FormsComponent,
    Form2Component,
    Form3Component,
    Form4Component,
    PreviewComponent,
    // AllComponent,
    FilteredComponent,
    DialogOverviewExampleDialogComponent,
    Form5Component,
    Form6Component,
    Form7Component,
    LymphomaPreviewComponent,
    ImmundefiComponent,
    SequencingComponent,
    // Form1Component,
    MlpapreviewComponent
    //  TestformComponent
  ],
  imports: [
    CommonModule,
    FormsRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ClarityModule,
    MaterialModule,
    DragDropModule

  ]
})
export class SaintFormsModule { }
