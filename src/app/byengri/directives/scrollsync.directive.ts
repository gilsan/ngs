import { Directive, HostListener } from '@angular/core';


@Directive({
  selector: '[appDNASyncScroll]'
})
export class ScrollDNAMonitorDirective {
  constructor(

  ) { }

  @HostListener('scroll', ['$event'])
  scrolly($event): void {
    const scrolltop = $event.target.scrollTop;
    console.log($event.target);
  }



}
