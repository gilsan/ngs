import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-igtcr-sheet',
  templateUrl: './igtcrSheet.component.html',
  styleUrls: [ './igtcrSheet.component.scss']
})
export class IgTcrSheetComponent implements OnInit {

  comment2 ='시험용';
  constructor(
    private router: Router,
  ){}

  ngOnInit(): void {

  }

  igtcr(): void {
    this.router.navigate(['/diag', 'igtcrMainLists']);
  }

  closeModal(): void {
    console.log('시험용');
  }

}
