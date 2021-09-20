import { Injectable } from '@angular/core';

import { testCodeLists } from 'src/app/forms/commons/geneList';

export interface ITestcode {
  ngstype: string;
  title: string;
  code: string;
  testname: string;
}


@Injectable({
  providedIn: 'root',
})
export class TestCodeTitleService {

  lists: ITestcode[] = [];

  constructor() {
    testCodeLists.forEach((item) => {
      this.lists.push(item as ITestcode);
    });
  }

  // 검체번호로 MLPA 제목 찿기
  getMltaTitle(testcode: string): string {
    const index = this.lists.findIndex(item => item.code === testcode);
    if (index !== -1) {
      const title = this.lists[index].title;
      return title;
    }
    return 'None';
  }


}
