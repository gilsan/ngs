import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { geneLists, mlpaLists, sequencingLists, lymphomaLists } from './commons/geneList';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {

  testedID: string;
  selectedNum: number;
  formA: boolean;
  formB: boolean;
  formC: boolean;
  formD: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // console.log('[forms component selectedNum][20] ', this.selectedNum);
    this.route.paramMap.pipe(
      filter(data => data !== null || data !== undefined),
      map(route => route.get('testcode'))
    ).subscribe(data => {
      if (data !== null) {
        const type = data;
        // console.log('============= [forms component][32] ', type);
        if (type === 'ALL') {
          this.selectedNum = 1;
          this.navigateTo('1');
        } else if (type === 'AML') {
          this.selectedNum = 2;
          this.navigateTo('2');
        } else if (this.lymphomaList(type)) {
          this.selectedNum = 3;
          this.navigateTo('3');
        } else if (type === 'MDS/MPN') {
          this.selectedNum = 4;
          this.navigateTo('4');
        } else if (this.mlpaList(type)) {
          this.selectedNum = 5;
          this.navigateTo('5');
        } else if (this.geneList(type)) {  // 유전성 유전자
          this.selectedNum = 6;
          this.navigateTo('6');
        } else if (this.sequencingList(type)) {
          this.selectedNum = 7;
          this.navigateTo('7');
        }
      }

    });
  }

  // Lymphoma [NGS] : LPE474-악성림프종, LPE475-형질세포종
  lymphomaList(gene: string): boolean {
    // console.log(lymphomaLists);
    return lymphomaLists.includes(gene);
  }


  // 유전성 유전자
  geneList(gene: string): boolean {
    return geneLists.includes(gene);
  }

  mlpaList(gene: string): boolean {
    return mlpaLists.includes(gene);
  }

  sequencingList(gene: string): boolean {
    return sequencingLists.includes(gene);
  }


  // tslint:disable-next-line: typedef
  navigateTo(select: string) {
    this.selectedNum = parseInt(select, 10);
    // console.log('[forms component select....]', this.selectedNum);
    if (this.selectedNum === 1) {
      this.router.navigate(['/diag', 'jingum', 'form2', 'ALL']);
    } else if (this.selectedNum === 2) {
      this.router.navigate(['/diag', 'jingum', 'form2', 'AML']);
    } else if (this.selectedNum === 3) {
      this.router.navigate(['/diag', 'jingum', 'form3', 'LYM']);
    } else if (this.selectedNum === 4) {
      this.router.navigate(['/diag', 'jingum', 'form4', 'MDS']);
    } else if (this.selectedNum === 5) {
      this.router.navigate(['/diag', 'jingum', 'form5', 'MLPA']);
    } else if (this.selectedNum === 6) {
      this.router.navigate(['/diag', 'jingum', 'form6', 'HRDT']);
    } else if (this.selectedNum === 7) {
      this.router.navigate(['/diag', 'jingum', 'form7', 'Sequencing']);
    }
  }

  // tslint:disable-next-line: typedef
  selected(select: number) {
    if (this.selectedNum === select) {
      return true;
    }
    return false;
  }

}
