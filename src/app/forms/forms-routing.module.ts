import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllComponent } from './all/all.component';
import { Form1Component } from './form1/form1.component';
import { Form2Component } from './form2/form2.component';
import { Form3Component } from './form3/form3.component';
import { Form4Component } from './form4/form4.component';
import { Form5Component } from './form5/form5.component';
import { Form6Component } from './form6/form6.component';
import { Form7Component } from './form7/form7.component';
import { FormsComponent } from './forms.component';



const routes: Routes = [
  {
    path: '', component: FormsComponent, children: [
      // { path: 'all', component: AllComponent },
      // { path: 'all/:type', component: AllComponent },
      { path: 'form2', component: Form2Component },
      { path: 'form2/:type', component: Form2Component },
      { path: 'form3', component: Form3Component },
      { path: 'form3/:type', component: Form3Component }, // Lymphoma NGS
      { path: 'form4', component: Form4Component },       // MDS/MPN NGS
      { path: 'form4/:type', component: Form4Component },
      { path: 'form6', component: Form6Component },        // 선천성 면역결핍증
      { path: 'form6/:type', component: Form6Component },
      { path: 'form7', component: Form7Component },
      { path: 'form7/:type', component: Form7Component },  // Sequencing
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
