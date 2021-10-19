
import { Injectable } from '@angular/core';
import { testCodeLists, listSequencing } from './geneList';

@Injectable({
  providedIn: 'root'
})
export class FindNgsTitleService {

  findSequencingTitle(testcode: string): string {
    const idx = listSequencing.findIndex(element => element.code === testcode);
    if (idx !== -1) {
      return listSequencing[idx].title;
    }
    return 'none';
  }

}
