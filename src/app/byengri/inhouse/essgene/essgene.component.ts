import { Component, OnInit } from '@angular/core';
import { combineLatest, from } from 'rxjs';
import { IBASE, IItem, IList } from '../../models/patients';
import { SequencingService } from '../../services/sequencing.service';

export const Lists = [
  {
    title: 'Bladder cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'FGFR3', 'NTRK1', 'NTRK3', 'TSC1'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['FGFR2', 'FGFR3', 'NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Triple Negative Breast cancer',
    content: [
      { type: 'Mutation', data: ['BRCA1', 'BRCA2', 'ERBB2', 'ESR1', 'NTRK1', 'NTRK3', 'PIK3CA'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Breast cancer',
    content: [
      { type: 'Mutation', data: ['BRCA1', 'BRCA2', 'ERBB2', 'ESR1', 'NTRK1', 'NTRK3', 'PIK3CA'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Cervical cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Cholangiocarcinoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'IDH1', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['FGFR2', 'NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Colorectal cancer',
    content: [
      { type: 'Mutation', data: ['BRAF', 'ERBB2', 'KRAS', 'NRAS', 'NTRK1', 'NTRK3', 'POLE'] },
      { type: 'Amplification', data: ['ERBB2', 'KRAS'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Colon cancer',
    content: [
      { type: 'Mutation', data: ['BRAF', 'ERBB2', 'KRAS', 'NRAS', 'NTRK1', 'NTRK3', 'POLE'] },
      { type: 'Amplification', data: ['ERBB2', 'KRAS'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Rectal cancer',
    content: [
      { type: 'Mutation', data: ['BRAF', 'ERBB2', 'KRAS', 'NRAS', 'NTRK1', 'NTRK3', 'POLE'] },
      { type: 'Amplification', data: ['ERBB2', 'KRAS'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Endometrial cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3', 'POLE'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Esophageal cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Gastric cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Gastroesophageal Junction Adenocarcinoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Gastrointestinal Stromal Tumor',
    content: [
      { type: 'Mutation', data: ['BRAF', 'ERBB2', 'KIT', 'NTRK1', 'NTRK3', 'PDGFRA'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Glioblastoma',
    content: [
      { type: 'Mutation', data: ['CTNNB1', 'ERBB2', 'IDH1', 'IDH2', 'NTRK1', 'NTRK3', 'SMARCA4', 'SMARCB1', 'SMO', 'TERT promoter', 'TSC1', 'TSC2'] },
      { type: 'Amplification', data: ['EGFR', 'MYCN'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3', 'RELA'] }
    ]
  },
  {
    title: 'Head and neck cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['AR', 'NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Kidney cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Liver cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Melanoma',
    content: [
      { type: 'Mutation', data: ['BRAF', 'ERBB2', 'KIT', 'NRAS', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['KIT'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Mesothelioma',
    content: [
      { type: 'Mutation', data: ['BAP1', 'ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Non-Small Cell Lung cancer',
    content: [
      { type: 'Mutation', data: ['ALK', 'BRAF', 'EGFR', 'ERBB2', 'KRAS', 'MET', 'NTRK1', 'NTRK3', 'ROS1'] },
      { type: 'Amplification', data: ['CD274', 'MET'] },
      { type: 'Fusion', data: ['ALK', 'MET', 'NTRK1', 'NTRK2', 'NTRK3', 'RET', 'ROS1'] }
    ]
  },
  {
    title: 'Osteosarcoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Ovarian cancer',
    content: [
      { type: 'Mutation', data: ['BRCA1', 'BRCA2', 'ERBB2', 'FOXL2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Pancreatic cancer',
    content: [
      { type: 'Mutation', data: ['BRCA1', 'BRCA2', 'ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Prostate cancer',
    content: [
      { type: 'Mutation', data: ['ATM', 'BARD1', 'BRCA1', 'BRCA2', 'BRIP1', 'CDK12', 'CHEK1', 'CHEK2', 'ERBB2', 'FANCL', 'NTRK1', 'NTRK3', 'PALB2', 'RAD51B', 'RAD51C', 'RAD51D', 'RAD54L'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Skin Basal Cell Carcinoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3', 'SMO'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Small Cell Lung cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Soft Tissue Sarcoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['ALK', 'NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Dedifferentiated liposarcoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['CDK4'] },
      { type: 'Fusion', data: ['ALK', 'NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Well-dedifferentiated liposarcoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['CDK4'] },
      { type: 'Fusion', data: ['ALK', 'NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  }, {
    title: 'Testicular cancer',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Thyroid cancer',
    content: [
      { type: 'Mutation', data: ['BRAF', 'ERBB2', 'NTRK1', 'NTRK3', 'RET'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3', 'RET'] }
    ]
  },
  {
    title: 'Unknown primary origin',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Other solid tumor',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Erdheim-chester disease',
    content: [
      { type: 'Mutation', data: ['BRAF', 'ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Neuroblastoma',
    content: [
      { type: 'Mutation', data: ['ALK', 'ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['MYCN'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Thymic tumor',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'KIT', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Uterine papillary serous carcinoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  }

];


export const Sample = [
  {
    title: 'Thymic tumor',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'KIT', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: [] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  },
  {
    title: 'Uterine papillary serous carcinoma',
    content: [
      { type: 'Mutation', data: ['ERBB2', 'NTRK1', 'NTRK3'] },
      { type: 'Amplification', data: ['ERBB2'] },
      { type: 'Fusion', data: ['NTRK1', 'NTRK2', 'NTRK3'] }
    ]
  }
];

@Component({
  selector: 'app-essgene',
  templateUrl: './essgene.component.html',
  styleUrls: ['./essgene.component.scss']
})
export class EssgeneComponent implements OnInit {
  panelOpenState = false;
  titles: string[] = [];


  constructor(
    private sequencingService: SequencingService
  ) { }

  lists: IItem[] = [];
  items: IBASE[] = [];

  ngOnInit(): void {
    this.getData();
    this.items = Sample;
  }

  getData(): void {
    const lists$ = this.sequencingService.getEssTitle();
    const titles$ = this.sequencingService.getEssTitleOnly();
    const titles = [];

    combineLatest([lists$, titles$])
      .subscribe(([data1, data2]) => {

        // data2.forEach(list => {
        //   const titleCol = data1.filter(item => item.title === list.title);
        //   const mutation = titleCol.filter(item => item.type === 'Mutation');
        //   const amplification = titleCol.filter(item => item.type === 'Amplification');
        //   const fusion = titleCol.filter(item => item.type === 'Fusion');

        //   this.lists.push({ title: list.title, data: { mutation, amplification, fusion } });
        // });
      });

  }

  addNew(name: string): void {
    // this.lists.push({
    //   title: name,
    //   content: [
    //     { type: 'Mutation', data: [] },
    //     { type: 'Amplification', data: [] },
    //     { type: 'Fusion', data: [] }
    //   ]
    // });
    // this.sequencingService.makeEvent(name);
  }

  // start(): void {
  //   let title = '';
  //   let type = '';

  //   this.lists.forEach(list => {
  //     title = list.title;
  //     list.content.forEach(item => {
  //       type = item.type;
  //       item.data.forEach(gene => {
  //         this.sequencingService.getEssInsert({ title, type, gene })
  //           .subscribe(data => {
  //             console.log('[355]', title, type, gene, data);

  //           });
  //       });
  //     });

  //   })
  // }

}
