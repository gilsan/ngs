
import { Injectable } from '@angular/core';
import { testCodeLists } from './geneList';

@Injectable({
  providedIn: 'root'
})
export class FindNgsTitleService {

  findSequencingTitle(testcode: string): string {
    const idx = testCodeLists.findIndex(element => element.code === testcode);
    if (idx !== -1) {
      return testCodeLists[idx].title;
    }
    return 'none';
  }

}
