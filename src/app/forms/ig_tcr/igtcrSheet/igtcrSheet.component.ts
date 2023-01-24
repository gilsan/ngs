import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-igtcr-sheet',
  templateUrl: './igtcrSheet.component.html',
  styleUrls: ['./igtcrSheet.component.scss']
})
export class IgTcrSheetComponent implements OnInit {

  constructor(
    private router: Router,
  ){}

  ngOnInit(): void {

  }

  igtcr(): void {
    this.router.navigate(['/diag', 'igtcrMainLists']);
  }

}
