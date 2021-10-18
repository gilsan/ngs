import { Directive, HostListener, Input } from '@angular/core';
import { StoreService } from 'src/app/forms/store.current';
import { StoreGENService } from 'src/app/forms/store.current.her';
import { StoreLYMService } from 'src/app/forms/store.current.lym';
import { StoreMDSService } from 'src/app/forms/store.current.mds';
import { StoreMLPAService } from 'src/app/forms/store.current.mlpa';
import { StoreSEQService } from 'src/app/forms/store.current.seq';


@Directive({
  selector: '[appDiagScrollMonitor]'
})
export class DiagScrollMonitorDirective {

  @Input('appDiagScrollMonitor') type: string;

  constructor(
    private store: StoreService,
    private storeLYM: StoreLYMService,
    private storeMDS: StoreMDSService,
    private storeGEN: StoreGENService,
    private storeSEQ: StoreSEQService,
    private storeMLPA: StoreMLPAService
  ) { }

  @HostListener('scroll', ['$event'])
  scrolly($event): void {
    if ($event.target.scrollTop !== 0) {
      // const scrolltop = this.store.getScrollyPosition();
      if (this.type === 'AML') {
        this.store.setScrollyPosition($event.target.scrollTop);
      } else if (this.type === 'LYM') {
        this.storeLYM.setScrollyPosition($event.target.scrollTop);
      } else if (this.type === 'MDS') {
        this.storeMDS.setScrollyPosition($event.target.scrollTop);
      } else if (this.type === 'GEN') {
        this.storeGEN.setScrollyPosition($event.target.scrollTop);
      } else if (this.type === 'SEQ') {
        this.storeSEQ.setScrollyPosition($event.target.scrollTop);
      } else if (this.type === 'MLPA') {
        this.storeMLPA.setScrollyPosition($event.target.scrollTop);
      }

    }
  }

}
