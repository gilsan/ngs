import { Component, ElementRef, HostBinding } from '@angular/core';

@Component({
  selector: 'th[resizable]',
  templateUrl: './resizable.template.html',
  styleUrls: ['./resizable.style.scss'],
})
export class ResizableComponent {
  @HostBinding('style.width.px')
  width: number | null = null;

  onResize(width: number): void {
    this.width = width;
  }
}
