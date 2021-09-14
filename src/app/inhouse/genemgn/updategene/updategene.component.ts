import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IGTYPE } from '../models';
import { GeneService } from 'src/app/services/genemgn.service';

@Component({
  selector: 'app-updategene',
  templateUrl: './updategene.component.html',
  styleUrls: ['./updategene.component.scss']
})
export class UpdategeneComponent implements OnInit {

  form: FormGroup;
  genename: string;
  type: string;
  constructor(
    private geneService: GeneService,
    public dialogRef: MatDialogRef<UpdategeneComponent>,
    @Inject(MAT_DIALOG_DATA) public info: IGTYPE,
    private fb: FormBuilder
  ) { }



  ngOnInit(): void {
    this.type = this.info.type;
    this.genename = this.info.gene;
    this.init();
  }

  init(): void {
    this.form = this.fb.group({
      gene: []
    });
  }

  save(gene: string): void {
    let tempType = '';
    let tempLPE = '';
    if (this.type !== 'ALL' || 'AML' || 'LYM' || 'MDS') {
      tempType = 'genetic';
      tempLPE = this.type;
    } else {
      tempType = this.type;
      tempLPE = '';
    }
    this.geneService.geneDuplicate(tempType, gene, tempLPE)
      .subscribe((data: { count: number }[]) => {
        console.log(data);
        if (data[0].count === 1) {
          alert('유전자가 중복 되었습니다.');
        } else {
          this.dialogRef.close({ oldgene: this.genename, newgene: gene });
        }
      });
  }

  cancel(): void {
    this.dialogRef.close({ oldgene: '', newgene: '' });
  }

}
