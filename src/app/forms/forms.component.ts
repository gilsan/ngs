import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';

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
        // console.log('============= [forms component][24] ', type);
        if (type === 'ALL') {
          this.selectedNum = 1;
          this.navigateTo('1');
        } else if (type === 'AML') {
          this.selectedNum = 2;
          this.navigateTo('2');
        } else if (type === 'Lymphoma') {
          this.selectedNum = 3;
          this.navigateTo('3');
        } else if (type === 'MDS/MPN') {
          this.selectedNum = 4;
          this.navigateTo('4');
        } else if (type === 'FORM5') {
          this.selectedNum = 5;
          this.navigateTo('5');
        } else if (type === 'FORM6') {
          this.selectedNum = 6;
          this.navigateTo('6');
        } else if (type === 'FORM7') {
          this.selectedNum = 7;
          this.navigateTo('7');
        }
      }


    });
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
      this.router.navigate(['/diag', 'jingum', 'form5', 'FORM5']);
    } else if (this.selectedNum === 6) {
      this.router.navigate(['/diag', 'jingum', 'form6', 'FORM6']);
    } else if (this.selectedNum === 7) {
      this.router.navigate(['/diag', 'jingum', 'form7', 'FORM7']);
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
