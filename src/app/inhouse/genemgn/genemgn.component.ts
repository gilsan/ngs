import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { map, tap } from 'rxjs/operators';
import { GeneService } from 'src/app/services/genemgn.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddgeneComponent } from './addgene/addgene.component';
import { UpdategeneComponent } from './updategene/updategene.component';
import { DeletegeneComponent } from './deletegene/deletegene.component';
import { IGTYPE } from './models';
import { geneTitles } from 'src/app/forms/commons/geneList';

@Component({
  selector: 'app-genemgn',
  templateUrl: './genemgn.component.html',
  styleUrls: ['./genemgn.component.scss']
})
export class GenemgnComponent implements OnInit {

  AML = [][10];
  ALL = [][10];
  LYM = [][10];
  MDS = [][10];
  LPE439 = [][10];
  LPE532 = [][10];
  LPE454 = [][10];
  LPE541 = [][10];
  LPE542 = [][10];
  LPE489 = [][10];
  LPE456 = [][10];
  LPE455 = [][10];
  LPE536 = [][10];
  LPE452 = [][10];
  LPE530 = [][10];
  LPE525 = [][10];
  LPE522 = [][10];
  LPE520 = [][10];
  LPE527 = [][10];
  LPE526 = [][10];
  LPE488 = [][10];
  LPE533 = [][10];
  LPE535 = [][10];
  LPE540 = [][10];
  LPE490 = [][10];
  LPE539 = [][10];
  LPE543 = [][10];
  LPE523 = [][10];
  LPE531 = [][10];
  LPE521 = [][10];
  LPE517 = [][10];
  LPE518 = [][10];
  LPE497 = [][10];
  LPE529 = [][10];
  LPC100 = [][10];
  LPC101 = [][10]
  LPE534 = [][10];
  LPE524 = [][10];
  LPE519 = [][10];
  LPE537 = [][10];
  LPE538 = [][10];
  LPE453 = [][10];
  LPE498 = [][10];
  LPE548 = [][10];

  lists2 = [][10];
  row = 0;
  col = 0;
  genetype = 'AML';
  selectedgene: string;
  active = false;
  addDialogRef: MatDialogRef<any>;
  updateDialogRef: MatDialogRef<any>;
  deleteDialogRef: MatDialogRef<any>;
  constructor(
    private geneService: GeneService,
    public dialog: MatDialog
  ) { }

  geneLists: { gene: string, title: string, lists: string }[] = geneTitles;

  ngOnInit(): void {
    this.init();

  }

  init(): void {
    const allList$ = this.geneService.geneAllList();

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'AML')),
    ).subscribe(data => {
      this.AML = this.makegenelist(data);
      if (this.genetype === 'AML') {
        this.lists2 = this.AML;
      }
      this.selectedgene = this.lists2[0][0];
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'ALL')),
    ).subscribe(data => {
      this.ALL = this.makegenelist(data);
      if (this.genetype === 'ALL') {
        this.lists2 = this.ALL;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'LYM')),
    ).subscribe(data => {
      this.LYM = this.makegenelist(data);
      if (this.genetype === 'LYM') {
        this.lists2 = this.LYM;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'MDS')),
    ).subscribe(data => {
      this.MDS = this.makegenelist(data);
      // console.log('[73][다시 가져옴]', this.MDS);
      if (this.genetype === 'MDS') {
        this.lists2 = this.MDS;
        this.selectedgene = this.lists2[0][0];
      }
    });


    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE439')),
    ).subscribe(data => {
      this.LPE439 = this.makegenelist(data);
      if (this.genetype === 'LPE439') {
        this.lists2 = this.LPE439;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE532')),
    ).subscribe(data => {
      this.LPE532 = this.makegenelist(data);
      if (this.genetype === 'LPE532') {
        this.lists2 = this.LPE532;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE454')),
    ).subscribe(data => {
      this.LPE454 = this.makegenelist(data);
      if (this.genetype === 'LPE454') {
        this.lists2 = this.LPE454;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE541')),
    ).subscribe(data => {
      this.LPE541 = this.makegenelist(data);
      if (this.genetype === 'LPE541') {
        this.lists2 = this.LPE541;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE542')),
    ).subscribe(data => {
      this.LPE542 = this.makegenelist(data);
      if (this.genetype === 'LPE542') {
        this.lists2 = this.LPE542;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE489')),
    ).subscribe(data => {
      this.LPE489 = this.makegenelist(data);
      if (this.genetype === 'LPE489') {
        this.lists2 = this.LPE489;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE456')),
    ).subscribe(data => {
      this.LPE456 = this.makegenelist(data);
      if (this.genetype === 'LPE456') {
        this.lists2 = this.LPE456;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE455')),
    ).subscribe(data => {
      this.LPE455 = this.makegenelist(data);
      if (this.genetype === 'LPE455') {
        this.lists2 = this.LPE455;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE536')),
    ).subscribe(data => {
      this.LPE536 = this.makegenelist(data);
      if (this.genetype === 'LPE536') {
        this.lists2 = this.LPE536;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE452')),
    ).subscribe(data => {
      this.LPE452 = this.makegenelist(data);
      if (this.genetype === 'LPE452') {
        this.lists2 = this.LPE452;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE530')),
    ).subscribe(data => {
      this.LPE530 = this.makegenelist(data);
      if (this.genetype === 'LPE530') {
        this.lists2 = this.LPE530;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE525')),
    ).subscribe(data => {
      this.LPE525 = this.makegenelist(data);
      if (this.genetype === 'LPE525') {
        this.lists2 = this.LPE525;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE522')),
    ).subscribe(data => {
      this.LPE522 = this.makegenelist(data);
      if (this.genetype === 'LPE522') {
        this.lists2 = this.LPE522;
        this.selectedgene = this.lists2[0][0];
      }
    });



    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE520')),
    ).subscribe(data => {
      this.LPE520 = this.makegenelist(data);
      if (this.genetype === 'LPE520') {
        this.lists2 = this.LPE520;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE527')),
    ).subscribe(data => {
      this.LPE527 = this.makegenelist(data);
      if (this.genetype === 'LPE527') {
        this.lists2 = this.LPE527;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE526')),
    ).subscribe(data => {
      this.LPE526 = this.makegenelist(data);
      if (this.genetype === 'LPE526') {
        this.lists2 = this.LPE526;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE488')),
    ).subscribe(data => {
      this.LPE488 = this.makegenelist(data);
      if (this.genetype === 'LPE488') {
        this.lists2 = this.LPE488;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE533')),
    ).subscribe(data => {
      this.LPE533 = this.makegenelist(data);
      if (this.genetype === 'LPE533') {
        this.lists2 = this.LPE533;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE535')),
    ).subscribe(data => {
      this.LPE535 = this.makegenelist(data);
      if (this.genetype === 'LPE535') {
        this.lists2 = this.LPE535;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE540')),
    ).subscribe(data => {
      this.LPE540 = this.makegenelist(data);
      if (this.genetype === 'LPE540') {
        this.lists2 = this.LPE540;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE490')),
    ).subscribe(data => {
      this.LPE490 = this.makegenelist(data);
      if (this.genetype === 'LPE490') {
        this.lists2 = this.LPE490;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE539')),
    ).subscribe(data => {
      this.LPE539 = this.makegenelist(data);
      if (this.genetype === 'LPE539') {
        this.lists2 = this.LPE539;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE543')),
    ).subscribe(data => {
      this.LPE543 = this.makegenelist(data);
      if (this.genetype === 'LPE543') {
        this.lists2 = this.LPE543;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE523')),
    ).subscribe(data => {
      this.LPE523 = this.makegenelist(data);
      if (this.genetype === 'LPE523') {
        this.lists2 = this.LPE523;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE531')),
    ).subscribe(data => {
      this.LPE531 = this.makegenelist(data);
      if (this.genetype === 'LPE531') {
        this.lists2 = this.LPE531;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE521')),
    ).subscribe(data => {
      this.LPE521 = this.makegenelist(data);
      if (this.genetype === 'LPE521') {
        this.lists2 = this.LPE521;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE517')),
    ).subscribe(data => {
      this.LPE517 = this.makegenelist(data);
      if (this.genetype === 'LPE517') {
        this.lists2 = this.LPE517;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE518')),
    ).subscribe(data => {
      this.LPE518 = this.makegenelist(data);
      if (this.genetype === 'LPE518') {
        this.lists2 = this.LPE518;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE497')),
    ).subscribe(data => {
      this.LPE497 = this.makegenelist(data);
      if (this.genetype === 'LPE497') {
        this.lists2 = this.LPE497;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE529')),
    ).subscribe(data => {
      this.LPE529 = this.makegenelist(data);
      if (this.genetype === 'LPE529') {
        this.lists2 = this.LPE529;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPC100')),
    ).subscribe(data => {
      this.LPC100 = this.makegenelist(data);
      if (this.genetype === 'LPC100') {
        this.lists2 = this.LPC100;
        this.selectedgene = this.lists2[0][0];
      }
    });
    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPC101')),
    ).subscribe(data => {
      this.LPC101 = this.makegenelist(data);
      if (this.genetype === 'LPC101') {
        this.lists2 = this.LPC100;
        this.selectedgene = this.lists2[0][0];
      }
    });


    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE534')),
    ).subscribe(data => {
      this.LPE534 = this.makegenelist(data);
      if (this.genetype === 'LPE534') {
        this.lists2 = this.LPE534;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE524')),
    ).subscribe(data => {
      this.LPE524 = this.makegenelist(data);
      if (this.genetype === 'LPE524') {
        this.lists2 = this.LPE524;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE519')),
    ).subscribe(data => {
      this.LPE519 = this.makegenelist(data);
      if (this.genetype === 'LPE519') {
        this.lists2 = this.LPE519;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE537')),
    ).subscribe(data => {
      this.LPE537 = this.makegenelist(data);
      if (this.genetype === 'LPE537') {
        this.lists2 = this.LPE537;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE538')),
    ).subscribe(data => {
      this.LPE538 = this.makegenelist(data);
      if (this.genetype === 'LPE538') {
        this.lists2 = this.LPE538;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE453')),
    ).subscribe(data => {
      this.LPE453 = this.makegenelist(data);
      if (this.genetype === 'LPE453') {
        this.lists2 = this.LPE453;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE498')),
    ).subscribe(data => {
      this.LPE498 = this.makegenelist(data);
      if (this.genetype === 'LPE498') {
        this.lists2 = this.LPE498;
        this.selectedgene = this.lists2[0][0];
      }
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.test_code === 'LPE548')),
    ).subscribe(data => {
      this.LPE548 = this.makegenelist(data);
      if (this.genetype === 'LPE548') {
        this.lists2 = this.LPE498;
        this.selectedgene = this.lists2[0][0];
      }
    });


  }

  genelists(type: string): void {
    if (type === 'ALL') {
      this.genetype = 'ALL';
      this.lists2 = this.ALL;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'AML') {
      this.genetype = 'AML';
      this.lists2 = this.AML;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LYM') {
      this.genetype = 'LYM';
      this.lists2 = this.LYM;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'MDS') {
      this.genetype = 'MDS';
      this.lists2 = this.MDS;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE439') {
      this.genetype = 'LPE439';
      this.lists2 = this.LPE439;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE532') {
      this.genetype = 'LPE532';
      this.lists2 = this.LPE532;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE454') {
      this.genetype = 'LPE454';
      this.lists2 = this.LPE454;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE541') {
      this.genetype = 'LPE541';
      this.lists2 = this.LPE541;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE542') {
      this.genetype = 'LPE542';
      this.lists2 = this.LPE542;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE489') {
      this.genetype = 'LPE489';
      this.lists2 = this.LPE489;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE456') {
      this.genetype = 'LPE456';
      this.lists2 = this.LPE456;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE455') {
      this.genetype = 'LPE455';
      this.lists2 = this.LPE455;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE536') {
      this.genetype = 'LPE536';
      this.lists2 = this.LPE536;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE452') {
      this.genetype = 'LPE452';
      this.lists2 = this.LPE452;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE530') {
      this.genetype = 'LPE530';
      this.lists2 = this.LPE530;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE525') {
      this.genetype = 'LPE525';
      this.lists2 = this.LPE525;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE522') {
      this.genetype = 'LPE522';
      this.lists2 = this.LPE522;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE520') {
      this.genetype = 'LPE520';
      this.lists2 = this.LPE520;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE527') {
      this.genetype = 'LPE527';
      this.lists2 = this.LPE527;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE526') {
      this.genetype = 'LPE526';
      this.lists2 = this.LPE526;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE488') {
      this.genetype = 'LPE488';
      this.lists2 = this.LPE488;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE533') {
      this.genetype = 'LPE533';
      this.lists2 = this.LPE533;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE535') {
      this.genetype = 'LPE535';
      this.lists2 = this.LPE535;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE540') {
      this.genetype = 'LPE540';
      this.lists2 = this.LPE540;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE490') {
      this.genetype = 'LPE490';
      this.lists2 = this.LPE490;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE539') {
      this.genetype = 'LPE539';
      this.lists2 = this.LPE539;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE543') {
      this.genetype = 'LPE543';
      this.lists2 = this.LPE543;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE523') {
      this.genetype = 'LPE523';
      this.lists2 = this.LPE523;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE531') {
      this.genetype = 'LPE531';
      this.lists2 = this.LPE531;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE521') {
      this.genetype = 'LPE521';
      this.lists2 = this.LPE521;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE517') {
      this.genetype = 'LPE517';
      this.lists2 = this.LPE517;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE518') {
      this.genetype = 'LPE518';
      this.lists2 = this.LPE518;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE497') {
      this.genetype = 'LPE497';
      this.lists2 = this.LPE497;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE529') {
      this.genetype = 'LPE529';
      this.lists2 = this.LPE529;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPC100') {
      this.genetype = 'LPC100';
      this.lists2 = this.LPC100;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPC101') {
      this.genetype = 'LPC101';
      this.lists2 = this.LPC101;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE534') {
      this.genetype = 'LPE534';
      this.lists2 = this.LPE534;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE524') {
      this.genetype = 'LPE524';
      this.lists2 = this.LPE524;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE519') {
      this.genetype = 'LPE519';
      this.lists2 = this.LPE519;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE537') {
      this.genetype = 'LPE537';
      this.lists2 = this.LPE537;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE538') {
      this.genetype = 'LPE538';
      this.lists2 = this.LPE538;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE453') {
      this.genetype = 'LPE453';
      this.lists2 = this.LPE453;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE498') {
      this.genetype = 'LPE498';
      this.lists2 = this.LPE498;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LPE548') {
      this.genetype = 'LPE548';
      this.lists2 = this.LPE548;
      this.selectedgene = this.lists2[0][0];
    }


  }

  makegenelist(lists: IGTYPE[]): any {
    let len: number;
    let count = 0;
    const listgenes = [[]];
    let listgene = [];
    len = lists.length - 1;
    for (let index = 0; index < lists.length; index++) {
      const i = index % 10;
      if (i === 0) {
        listgene[i] = lists[index].gene;
      } else if (i === 1) {
        listgene[i] = lists[index].gene;
      } else if (i === 2) {
        listgene[i] = lists[index].gene;
      } else if (i === 3) {
        listgene[i] = lists[index].gene;
      } else if (i === 4) {
        listgene[i] = lists[index].gene;
      } else if (i === 5) {
        listgene[i] = lists[index].gene;
      } else if (i === 6) {
        listgene[i] = lists[index].gene;
      } else if (i === 7) {
        listgene[i] = lists[index].gene;
      } else if (i === 8) {
        listgene[i] = lists[index].gene;
      } else if (i === 9) {
        listgene[i] = lists[index].gene;
      }

      if (i === 9) {
        listgenes[count] = listgene;
        listgene = [];
        count++;
      } else if (len === index) {
        listgenes[count] = listgene;
      }
    } // End of for loop
    return listgenes;
  }



  genename(gene: string, i: number, j: number): void {
    this.selectedgene = gene;
    this.row = i;
    this.col = j;
  }

  mystyle(i: number, j: number): any {
    let len;
    if (this.genetype === 'ALL') {
      len = this.ALL.length;
    } else if (this.genetype === 'AML') {
      len = this.AML.length;
    } else if (this.genetype === 'LYM') {
      len = this.LYM.length;
    } else if (this.genetype === 'MDS') {
      len = this.MDS.length;
    }

  }
  // 생성 다이얼로그
  addOpenDialog(): void {
    const addDialogRef = this.dialog.open(AddgeneComponent, {
      width: '300px',
      height: '260px',
      disableClose: true,
      data: this.genetype
    });

    addDialogRef.afterClosed().subscribe(val => {
      if (this.genetype === 'ALL' && val.gene.length) {
        const alen = this.ALL.length;
        const blen = this.ALL[alen - 1].length;
        this.addNewgene('ALL', alen, blen, val.gene);
        this.geneService.geneInsert(this.genetype, val.gene, '')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'AML' && val.gene.length) {
        const alen = this.AML.length;
        const blen = this.AML[alen - 1].length;
        this.addNewgene('AML', alen, blen, val.gene);
        this.geneService.geneInsert(this.genetype, val.gene, '')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LYM' && val.gene.length) {
        const alen = this.LYM.length;
        const blen = this.LYM[alen - 1].length;
        this.addNewgene('LYM', alen, blen, val.gene);
        this.geneService.geneInsert(this.genetype, val.gene, '')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'MDS' && val.gene.length) {
        const alen = this.MDS.length;
        const blen = this.MDS[alen - 1].length;
        this.addNewgene('MDS', alen, blen, val.gene);
        this.geneService.geneInsert(this.genetype, val.gene, '')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE439' && val.gene.length) {
        const alen = this.LPE439.length;
        const blen = this.LPE439[alen - 1].length;
        this.addNewgene('LPE439', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE439')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE532' && val.gene.length) {
        const alen = this.LPE532.length;
        const blen = this.LPE532[alen - 1].length;
        this.addNewgene('LPE532', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE532')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE454' && val.gene.length) {
        const alen = this.LPE454.length;
        const blen = this.LPE454[alen - 1].length;
        this.addNewgene('LPE454', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE454')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE541' && val.gene.length) {
        const alen = this.LPE541.length;
        const blen = this.LPE541[alen - 1].length;
        this.addNewgene('LPE541', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE541')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE542' && val.gene.length) {
        const alen = this.LPE542.length;
        const blen = this.LPE542[alen - 1].length;
        this.addNewgene('LPE542', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE542')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE489' && val.gene.length) {
        const alen = this.LPE489.length;
        const blen = this.LPE489[alen - 1].length;
        this.addNewgene('LPE489', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE489')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE456' && val.gene.length) {
        const alen = this.LPE456.length;
        const blen = this.LPE456[alen - 1].length;
        this.addNewgene('LPE456', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE456')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE455' && val.gene.length) {
        const alen = this.LPE455.length;
        const blen = this.LPE455[alen - 1].length;
        this.addNewgene('LPE455', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE455')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE536' && val.gene.length) {
        const alen = this.LPE536.length;
        const blen = this.LPE536[alen - 1].length;
        this.addNewgene('LPE536', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE536')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE452' && val.gene.length) {
        const alen = this.LPE452.length;
        const blen = this.LPE452[alen - 1].length;
        this.addNewgene('LPE452', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE452')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE530' && val.gene.length) {
        const alen = this.LPE530.length;
        const blen = this.LPE530[alen - 1].length;
        this.addNewgene('LPE530', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE530')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE525' && val.gene.length) {
        const alen = this.LPE525.length;
        const blen = this.LPE525[alen - 1].length;
        this.addNewgene('LPE525', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE525')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE522' && val.gene.length) {
        const alen = this.LPE522.length;
        const blen = this.LPE522[alen - 1].length;
        this.addNewgene('LPE522', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE522')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE520' && val.gene.length) {
        const alen = this.LPE520.length;
        const blen = this.LPE520[alen - 1].length;
        this.addNewgene('LPE520', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE520')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE527' && val.gene.length) {
        const alen = this.LPE527.length;
        const blen = this.LPE527[alen - 1].length;
        this.addNewgene('LPE527', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE527')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE526' && val.gene.length) {
        const alen = this.LPE526.length;
        const blen = this.LPE526[alen - 1].length;
        this.addNewgene('LPE526', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE526')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE488' && val.gene.length) {
        const alen = this.LPE488.length;
        const blen = this.LPE488[alen - 1].length;
        this.addNewgene('LPE488', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE488')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE533' && val.gene.length) {
        const alen = this.LPE533.length;
        const blen = this.LPE533[alen - 1].length;
        this.addNewgene('LPE533', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE533')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE535' && val.gene.length) {
        const alen = this.LPE535.length;
        const blen = this.LPE535[alen - 1].length;
        this.addNewgene('LPE535', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE535')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE540' && val.gene.length) {
        const alen = this.LPE540.length;
        const blen = this.LPE540[alen - 1].length;
        this.addNewgene('LPE540', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE540')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE490' && val.gene.length) {
        const alen = this.LPE490.length;
        const blen = this.LPE490[alen - 1].length;
        this.addNewgene('LPE490', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE490')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE539' && val.gene.length) {
        const alen = this.LPE539.length;
        const blen = this.LPE539[alen - 1].length;
        this.addNewgene('LPE539', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE539')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE543' && val.gene.length) {
        const alen = this.LPE543.length;
        const blen = this.LPE543[alen - 1].length;
        this.addNewgene('LPE543', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE543')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE523' && val.gene.length) {
        const alen = this.LPE523.length;
        const blen = this.LPE523[alen - 1].length;
        this.addNewgene('LPE523', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE523')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE531' && val.gene.length) {
        const alen = this.LPE531.length;
        const blen = this.LPE531[alen - 1].length;
        this.addNewgene('LPE531', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE531')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE521' && val.gene.length) {
        const alen = this.LPE521.length;
        const blen = this.LPE521[alen - 1].length;
        this.addNewgene('LPE521', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE521')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE517' && val.gene.length) {
        const alen = this.LPE517.length;
        const blen = this.LPE517[alen - 1].length;
        this.addNewgene('LPE517', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE517')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE518' && val.gene.length) {
        const alen = this.LPE518.length;
        const blen = this.LPE518[alen - 1].length;
        this.addNewgene('LPE518', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE518')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE497' && val.gene.length) {
        const alen = this.LPE497.length;
        const blen = this.LPE497[alen - 1].length;
        this.addNewgene('LPE497', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE497')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE529' && val.gene.length) {
        const alen = this.LPE529.length;
        const blen = this.LPE529[alen - 1].length;
        this.addNewgene('LPE529', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE529')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPC100' && val.gene.length) {
        const alen = this.LPC100.length;
        const blen = this.LPC100[alen - 1].length;
        this.addNewgene('LPC100', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPC100')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPC101' && val.gene.length) {
        const alen = this.LPC101.length;
        const blen = this.LPC101[alen - 1].length;
        this.addNewgene('LPC101', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPC101')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE534' && val.gene.length) {
        const alen = this.LPE534.length;
        const blen = this.LPE534[alen - 1].length;
        this.addNewgene('LPE534', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE534')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE524' && val.gene.length) {
        const alen = this.LPE524.length;
        const blen = this.LPE524[alen - 1].length;
        this.addNewgene('LPE524', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE524')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE519' && val.gene.length) {
        const alen = this.LPE519.length;
        const blen = this.LPE519[alen - 1].length;
        this.addNewgene('LPE519', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE519')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE537' && val.gene.length) {
        const alen = this.LPE537.length;
        const blen = this.LPE537[alen - 1].length;
        this.addNewgene('', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE537')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE538' && val.gene.length) {
        const alen = this.LPE538.length;
        const blen = this.LPE538[alen - 1].length;
        this.addNewgene('LPE538', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE538')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE453' && val.gene.length) {
        const alen = this.LPE453.length;
        const blen = this.LPE453[alen - 1].length;
        this.addNewgene('LPE453', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE453')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE498' && val.gene.length) {
        const alen = this.LPE498.length;
        const blen = this.LPE498[alen - 1].length;
        this.addNewgene('LPE498', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE498')
          .subscribe(data => console.log(data));
      } else if (this.genetype === 'LPE548' && val.gene.length) {
        const alen = this.LPE548.length;
        const blen = this.LPE548[alen - 1].length;
        this.addNewgene('LPE548', alen, blen, val.gene);
        this.geneService.geneInsert('genetic', val.gene, 'LPE548')
          .subscribe(data => console.log(data));
      }


    });
  }

  addNewgene(type: string, alen: number, blen: number, gene: string): void {
    if (type === 'ALL') {
      if (blen < 10) {
        this.ALL[alen - 1].push(gene);
      } else {
        this.ALL.push([gene]);
      }
    } else if (type === 'AML') {
      if (blen < 10) {
        this.AML[alen - 1].push(gene);
      } else {
        this.AML.push([gene]);
      }
    } else if (type === 'LYM') {
      if (blen < 10) {
        this.LYM[alen - 1].push(gene);
      } else {
        this.LYM.push([gene]);
      }
    } else if (type === 'MDS') {
      if (blen < 10) {
        this.MDS[alen - 1].push(gene);
      } else {
        this.MDS.push([gene]);
      }
    } else if (type === 'LPE439') {
      if (blen < 10) {
        this.LPE439[alen - 1].push(gene);
      } else {
        this.LPE439.push([gene]);
      }
    } else if (type === 'LPE532') {
      if (blen < 10) {
        this.LPE532[alen - 1].push(gene);
      } else {
        this.LPE532.push([gene]);
      }
    } else if (type === 'LPE454') {
      if (blen < 10) {
        this.LPE454[alen - 1].push(gene);
      } else {
        this.LPE454.push([gene]);
      }
    } else if (type === 'LPE541') {
      if (blen < 10) {
        this.LPE541[alen - 1].push(gene);
      } else {
        this.LPE541.push([gene]);
      }
    } else if (type === 'LPE542') {
      if (blen < 10) {
        this.LPE542[alen - 1].push(gene);
      } else {
        this.LPE542.push([gene]);
      }
    } else if (type === 'LPE489') {
      if (blen < 10) {
        this.LPE489[alen - 1].push(gene);
      } else {
        this.LPE489.push([gene]);
      }
    } else if (type === 'LPE456') {
      if (blen < 10) {
        this.LPE456[alen - 1].push(gene);
      } else {
        this.LPE456.push([gene]);
      }
    } else if (type === 'LPE455') {
      if (blen < 10) {
        this.LPE455[alen - 1].push(gene);
      } else {
        this.LPE455.push([gene]);
      }
    } else if (type === 'LPE536') {
      if (blen < 10) {
        this.LPE536[alen - 1].push(gene);
      } else {
        this.LPE536.push([gene]);
      }
    } else if (type === 'LPE452') {
      if (blen < 10) {
        this.LPE452[alen - 1].push(gene);
      } else {
        this.LPE452.push([gene]);
      }
    } else if (type === 'LPE489') {
      if (blen < 10) {
        this.LPE489[alen - 1].push(gene);
      } else {
        this.LPE489.push([gene]);
      }
    } else if (type === 'LPE456') {
      if (blen < 10) {
        this.LPE456[alen - 1].push(gene);
      } else {
        this.LPE456.push([gene]);
      }
    } else if (type === 'LPE455') {
      if (blen < 10) {
        this.LPE455[alen - 1].push(gene);
      } else {
        this.LPE455.push([gene]);
      }
    } else if (type === 'LPE536') {
      if (blen < 10) {
        this.LPE536[alen - 1].push(gene);
      } else {
        this.LPE536.push([gene]);
      }
    } else if (type === 'LPE452') {
      if (blen < 10) {
        this.LPE452[alen - 1].push(gene);
      } else {
        this.LPE452.push([gene]);
      }
    } else if (type === 'LPE530') {
      if (blen < 10) {
        this.LPE530[alen - 1].push(gene);
      } else {
        this.LPE530.push([gene]);
      }
    } else if (type === 'LPE525') {
      if (blen < 10) {
        this.LPE525[alen - 1].push(gene);
      } else {
        this.LPE525.push([gene]);
      }
    } else if (type === 'LPE522') {
      if (blen < 10) {
        this.LPE522[alen - 1].push(gene);
      } else {
        this.LPE522.push([gene]);
      }
    } else if (type === 'LPE520') {
      if (blen < 10) {
        this.LPE520[alen - 1].push(gene);
      } else {
        this.LPE520.push([gene]);
      }
    } else if (type === 'LPE527') {
      if (blen < 10) {
        this.LPE527[alen - 1].push(gene);
      } else {
        this.LPE527.push([gene]);
      }
    } else if (type === 'LPE526') {
      if (blen < 10) {
        this.LPE526[alen - 1].push(gene);
      } else {
        this.LPE526.push([gene]);
      }
    } else if (type === 'LPE488') {
      if (blen < 10) {
        this.LPE488[alen - 1].push(gene);
      } else {
        this.LPE488.push([gene]);
      }
    } else if (type === 'LPE533') {
      if (blen < 10) {
        this.LPE533[alen - 1].push(gene);
      } else {
        this.LPE533.push([gene]);
      }
    } else if (type === 'LPE535') {
      if (blen < 10) {
        this.LPE535[alen - 1].push(gene);
      } else {
        this.LPE535.push([gene]);
      }
    } else if (type === 'LPE540') {
      if (blen < 10) {
        this.LPE540[alen - 1].push(gene);
      } else {
        this.LPE540.push([gene]);
      }
    } else if (type === 'LPE490') {
      if (blen < 10) {
        this.LPE490[alen - 1].push(gene);
      } else {
        this.LPE490.push([gene]);
      }
    } else if (type === 'LPE539') {
      if (blen < 10) {
        this.LPE539[alen - 1].push(gene);
      } else {
        this.LPE539.push([gene]);
      }
    } else if (type === 'LPE543') {
      if (blen < 10) {
        this.LPE543[alen - 1].push(gene);
      } else {
        this.LPE543.push([gene]);
      }
    } else if (type === 'LPE523') {
      if (blen < 10) {
        this.LPE523[alen - 1].push(gene);
      } else {
        this.LPE523.push([gene]);
      }
    } else if (type === 'LPE531') {
      if (blen < 10) {
        this.LPE531[alen - 1].push(gene);
      } else {
        this.LPE531.push([gene]);
      }
    } else if (type === 'LPE521') {
      if (blen < 10) {
        this.LPE521[alen - 1].push(gene);
      } else {
        this.LPE521.push([gene]);
      }
    } else if (type === 'LPE517') {
      if (blen < 10) {
        this.LPE517[alen - 1].push(gene);
      } else {
        this.LPE517.push([gene]);
      }
    } else if (type === 'LPE518') {
      if (blen < 10) {
        this.LPE518[alen - 1].push(gene);
      } else {
        this.LPE518.push([gene]);
      }
    } else if (type === 'LPE497') {
      if (blen < 10) {
        this.LPE497[alen - 1].push(gene);
      } else {
        this.LPE497.push([gene]);
      }
    } else if (type === 'LPE529') {
      if (blen < 10) {
        this.LPE529[alen - 1].push(gene);
      } else {
        this.LPE529.push([gene]);
      }
    } else if (type === 'LPC100') {
      if (blen < 10) {
        this.LPC100[alen - 1].push(gene);
      } else {
        this.LPC100.push([gene]);
      }
    } else if (type === 'LPC101') {
      if (blen < 10) {
        this.LPC101[alen - 1].push(gene);
      } else {
        this.LPC101.push([gene]);
      }
    } else if (type === 'LPE534') {
      if (blen < 10) {
        this.LPE534[alen - 1].push(gene);
      } else {
        this.LPE534.push([gene]);
      }
    } else if (type === 'LPE524') {
      if (blen < 10) {
        this.LPE524[alen - 1].push(gene);
      } else {
        this.LPE524.push([gene]);
      }
    } else if (type === 'LPE519') {
      if (blen < 10) {
        this.LPE519[alen - 1].push(gene);
      } else {
        this.LPE519.push([gene]);
      }
    } else if (type === 'LPE537') {
      if (blen < 10) {
        this.LPE537[alen - 1].push(gene);
      } else {
        this.LPE537.push([gene]);
      }
    } else if (type === 'LPE538') {
      if (blen < 10) {
        this.LPE538[alen - 1].push(gene);
      } else {
        this.LPE538.push([gene]);
      }
    } else if (type === 'LPE453') {
      if (blen < 10) {
        this.LPE453[alen - 1].push(gene);
      } else {
        this.LPE453.push([gene]);
      }
    } else if (type === 'LPE548') {
      if (blen < 10) {
        this.LPE548[alen - 1].push(gene);
      } else {
        this.LPE548.push([gene]);
      }
    }



  }

  // 수정 다이얼로그
  updateOpenDialog(): void {
    const updateDialogRef = this.dialog.open(UpdategeneComponent, {
      width: '330px',
      height: '260px',
      data: { type: this.genetype, gene: this.selectedgene },
      disableClose: true
    });

    updateDialogRef.afterClosed().subscribe(val => {
      if (this.genetype === 'ALL' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate(this.genetype, val.oldgene, val.newgene, '')
          .subscribe();
      } else if (this.genetype === 'AML' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate(this.genetype, val.oldgene, val.newgene, '')
          .subscribe();
      } else if (this.genetype === 'LYM' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate(this.genetype, val.oldgene, val.newgene, '')
          .subscribe();
      } else if (this.genetype === 'MDS' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate(this.genetype, val.oldgene, val.newgene, '')
          .subscribe();
      } else if (this.genetype === 'LPE439' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE439')
          .subscribe();
      } else if (this.genetype === 'LPE532' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE532')
          .subscribe();
      } else if (this.genetype === 'LPE454' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE454')
          .subscribe();
      } else if (this.genetype === 'LPE541' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE541')
          .subscribe();
      } else if (this.genetype === 'LPE542' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE542')
          .subscribe();
      } else if (this.genetype === 'LPE489' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE489')
          .subscribe();
      } else if (this.genetype === 'LPE456' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE456')
          .subscribe();
      } else if (this.genetype === 'LPE455' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE455')
          .subscribe();
      } else if (this.genetype === 'LPE536' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE536')
          .subscribe();
      } else if (this.genetype === 'LPE452' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE452')
          .subscribe();
      } else if (this.genetype === 'LPE530' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE530')
          .subscribe();
      } else if (this.genetype === 'LPE525' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE525')
          .subscribe();
      } else if (this.genetype === 'LPE522' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE522')
          .subscribe();
      } else if (this.genetype === 'LPE520' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE520')
          .subscribe();
      } else if (this.genetype === 'LPE527' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE527')
          .subscribe();
      } else if (this.genetype === 'LPE526' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE526')
          .subscribe();
      } else if (this.genetype === 'LPE488' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE488')
          .subscribe();
      } else if (this.genetype === 'LPE533' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE533')
          .subscribe();
      } else if (this.genetype === 'LPE535' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE535')
          .subscribe();
      } else if (this.genetype === 'LPE540' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE540')
          .subscribe();
      } else if (this.genetype === 'LPE490' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE490')
          .subscribe();
      } else if (this.genetype === 'LPE539' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE539')
          .subscribe();
      } else if (this.genetype === 'LPE543' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE543')
          .subscribe();
      } else if (this.genetype === 'LPE523' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE523')
          .subscribe();
      } else if (this.genetype === 'LPE531' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate(this.genetype, val.oldgene, val.newgene, 'LPE531')
          .subscribe();
      } else if (this.genetype === 'LPE521' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE521')
          .subscribe();
      } else if (this.genetype === 'LPE517' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE517')
          .subscribe();
      } else if (this.genetype === 'LPE518' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE518')
          .subscribe();
      } else if (this.genetype === 'LPE497' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE497')
          .subscribe();
      } else if (this.genetype === 'LPE529' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE529')
          .subscribe();
      } else if (this.genetype === 'LPC100' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPC100')
          .subscribe();
      } else if (this.genetype === 'LPC101' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPC101')
          .subscribe();
      } else if (this.genetype === 'LPE534' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE534')
          .subscribe();
      } else if (this.genetype === 'LPE524' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE524')
          .subscribe();
      } else if (this.genetype === 'LPE519' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE519')
          .subscribe();
      } else if (this.genetype === 'LPE537' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE537')
          .subscribe();
      } else if (this.genetype === 'LPE538' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE538')
          .subscribe();
      } else if (this.genetype === 'LPE453' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE453')
          .subscribe();
      } else if (this.genetype === 'LPE498' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE498')
          .subscribe();
      } else if (this.genetype === 'LPE548' && val.newgene.length) {
        this.updateGene(val.newgene);
        this.geneService.geneUpdate('genetic', val.oldgene, val.newgene, 'LPE548')
          .subscribe();
      }




    });

  }

  updateGene(newgene: string): void {
    // console.log('===== [256] row/col', this.row, this.col);
    if (this.genetype === 'ALL') {
      this.ALL[this.row][this.col] = newgene;
    } else if (this.genetype === 'AML') {
      this.AML[this.row][this.col] = newgene;
    } else if (this.genetype === 'LYM') {
      this.LYM[this.row][this.col] = newgene;
    } else if (this.genetype === 'MDS') {
      this.MDS[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE439') {
      this.LPE439[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE532') {
      this.LPE532[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE454') {
      this.LPE454[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE541') {
      this.LPE541[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE542') {
      this.LPE542[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE489') {
      this.LPE489[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE456') {
      this.LPE456[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE455') {
      this.LPE455[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE536') {
      this.LPE536[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE452') {
      this.LPE452[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE530') {
      this.LPE530[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE525') {
      this.LPE525[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE522') {
      this.LPE522[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE520') {
      this.LPE520[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE527') {
      this.LPE527[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE526') {
      this.LPE526[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE488') {
      this.LPE488[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE533') {
      this.LPE533[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE535') {
      this.LPE535[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE540') {
      this.LPE540[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE490') {
      this.LPE490[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE539') {
      this.LPE539[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE543') {
      this.LPE543[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE523') {
      this.LPE523[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE531') {
      this.LPE531[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE521') {
      this.LPE521[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE517') {
      this.LPE517[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE518') {
      this.LPE518[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE497') {
      this.LPE497[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE529') {
      this.LPE529[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPC100') {
      this.LPC100[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPC101') {
      this.LPC101[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE534') {
      this.LPE534[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE524') {
      this.LPE524[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE519') {
      this.LPE519[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE537') {
      this.LPE537[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE538') {
      this.LPE538[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE453') {
      this.LPE453[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE498') {
      this.LPE498[this.row][this.col] = newgene;
    } else if (this.genetype === 'LPE548') {
      this.LPE548[this.row][this.col] = newgene;
    }
  }
  // 삭제 다이얼로그
  deleteOpenDialog(): void {
    const deleteDialogRef = this.dialog.open(DeletegeneComponent, {
      width: '300px',
      height: '220px',
      data: this.selectedgene,
      disableClose: true
    });

    deleteDialogRef.afterClosed().subscribe(val => {
      if (val.message === 'YES') {
        const gene = val.gene;
        if (this.genetype === 'ALL') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'AML') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LYM') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'MDS') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE439') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE532') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE454') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE541') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE542') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE489') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE456') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE455') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE536') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE452') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE530') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE525') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE522') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE520') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE527') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE526') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE488') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE533') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE535') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE540') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE490') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE539') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE543') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE523') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE531') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE521') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE517') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE518') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE497') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE529') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPC100') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPC101') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE534') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE524') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE519') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE537') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE538') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE453') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE498') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LPE548') {
          this.deleteGene(val.gene);
        }
      }
    });

  }

  deleteGene(gene: string): void {
    if (this.genetype === 'ALL') {
      this.ALL[this.row].splice(this.col, 1);
      this.geneService.geneDelete('ALL', gene, '')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'AML') {
      this.AML[this.row].splice(this.col, 1);
      this.geneService.geneDelete('AML', gene, '')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LYM') {
      this.LYM[this.row].splice(this.col, 1);
      this.geneService.geneDelete('LYM', gene, '')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'MDS') {
      this.MDS[this.row].splice(this.col, 1);
      this.geneService.geneDelete('MDS', gene, '')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE439') {
      this.LPE439[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE439')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE532') {
      this.LPE532[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE532')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE454') {
      this.LPE454[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE454')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE541') {
      this.LPE541[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE541')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE542') {
      this.LPE542[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE542')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE489') {
      this.LPE489[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE489')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE456') {
      this.LPE456[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE456')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE455') {
      this.LPE455[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE455')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE536') {
      this.LPE536[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE536')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE452') {
      this.LPE452[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE452')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE530') {
      this.LPE530[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE530')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE525') {
      this.LPE525[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE525')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE522') {
      this.LPE522[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE522')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE520') {
      this.LPE520[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE520')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE527') {
      this.LPE527[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE527')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE526') {
      this.LPE526[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE526')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE488') {
      this.LPE488[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE488')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE533') {
      this.LPE533[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE533')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE535') {
      this.LPE535[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE535')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE540') {
      this.LPE540[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE540')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE490') {
      this.LPE490[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE490')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE539') {
      this.LPE539[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE539')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE543') {
      this.LPE543[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE543')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE523') {
      this.LPE523[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE523')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE531') {
      this.LPE531[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE531')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE521') {
      this.LPE521[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE521')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE517') {
      this.LPE517[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE517')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE518') {
      this.LPE518[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE518')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE497') {
      this.LPE497[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE497')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE529') {
      this.LPE529[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE529')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPC100 ') {
      this.LPC100[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPC100 ')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPC101') {
      this.LPC101[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPC101')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE534') {
      this.LPE534[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE534')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE524') {
      this.LPE524[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE524')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE519') {
      this.LPE519[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE519')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE537') {
      this.LPE537[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE537')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE538') {
      this.LPE538[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE538')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE453') {
      this.LPE453[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE453')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE498') {
      this.LPE498[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE498')
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LPE548') {
      this.LPE548[this.row].splice(this.col, 1);
      this.geneService.geneDelete('genetic', gene, 'LPE548')
        .subscribe(() => {
          this.init();
        });
    }
  }

  // 중복체크
  checkDuplicate(type: string, alen: number, blen: number, gene: string): boolean {
    if (this.genetype === 'ALL') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.ALL[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    } else if (this.genetype === 'AML') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.AML[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    } else if (this.genetype === 'LYM') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.LYM[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    } else if (this.genetype === 'MDS') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.MDS[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    }
  }


}


