import { Component , OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-lists',
  templateUrl: './mainLists.component.html',
  styleUrls: ['./mainLists.component.scss']
})
export class MainListsComponent implements OnInit {

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {

  }

  sheet(): void {
    this.router.navigate(['/diag', 'igtcrMainLists', 'igtcrsheet']);
  }

}
