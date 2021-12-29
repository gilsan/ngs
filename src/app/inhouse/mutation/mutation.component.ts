import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IAML, IGenetic, IMutation, ISEQ } from '../models/mutation';
import { MutationService } from 'src/app/services/mutation.service';
import { ExcelService } from 'src/app/home/services/excelservice';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mutation',
  templateUrl: './mutation.component.html',
  styleUrls: ['./mutation.component.scss']
})
export class MutationComponent implements OnInit {

  @ViewChild('type') type: ElementRef;
  @ViewChild('selectedtype') selectedtype: ElementRef;
  @ViewChild('functionalimpact') functionalimpact: ElementRef;
  constructor(
    private mutationService: MutationService,
    private excel: ExcelService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }
  lists$: Observable<IMutation[]>;
  lists: IMutation[];
  listMutations: IMutation[];
  mutationInfo: IMutation;
  gubun = 'AMLALL';

  genes: string;
  curPage: number;
  totPage: number;
  pageLine: number;
  totRecords: number;

  private apiUrl = emrUrl;

  geneticForm: FormGroup;
  seqForm: FormGroup;
  amlForm: FormGroup;

  ZYGOSITY: string[] = ['Heterozygous', 'Homozygous'];

  ngOnInit(): void {
    this.init();
    this.loadGeneticForm();
    this.loadSeqForm();
    this.loadAmlForm();
  }


  init(): void {
    this.search('', '', 'AMLALL');
  }

  deleteRow(id: string, genes: string, patientName: string): void {

    if (id === '') {
      const result = confirm('삭제 하시겠습니까?');
      if (result) {
        this.lists = this.lists.slice(0, this.lists.length - 1);
      }
    } else {
      const result = confirm(patientName + '를 삭제 하시겠습니까?');
      if (result) {
        this.mutationService.deleteMutationList(id, genes)
          .subscribe((data) => {
            console.log('[170][mutation 삭제]', data);
            alert("삭제 되었습니다.");
            const type = this.type.nativeElement.value;
            this.search(genes, '', type);
          });
      }
    }
  }

  updateRow(id: string): void {
    console.log('[68][mutation]', id);
    const buccal: HTMLInputElement = document.getElementById("buccal" + id) as HTMLInputElement;
    const patientName: HTMLInputElement = document.getElementById("patientName" + id) as HTMLInputElement;
    const registerNumber: HTMLInputElement = document.getElementById("registerNumber" + id) as HTMLInputElement;
    const fusion: HTMLInputElement = document.getElementById("fusion" + id) as HTMLInputElement;
    const gene: HTMLInputElement = document.getElementById("gene" + id) as HTMLInputElement;
    const functionalImpact: HTMLInputElement = document.getElementById("functionalImpact" + id) as HTMLInputElement;
    const transcript: HTMLInputElement = document.getElementById("transcript" + id) as HTMLInputElement;
    const exonIntro: HTMLInputElement = document.getElementById("exonIntro" + id) as HTMLInputElement;
    const nucleotideChange: HTMLInputElement = document.getElementById("nucleotideChange" + id) as HTMLInputElement;
    const aminoAcidChange: HTMLInputElement = document.getElementById("aminoAcidChange" + id) as HTMLInputElement;
    const zygosity: HTMLInputElement = document.getElementById("zygosity" + id) as HTMLInputElement;
    const vaf: HTMLInputElement = document.getElementById("vaf" + id) as HTMLInputElement;
    const reference: HTMLInputElement = document.getElementById("reference" + id) as HTMLInputElement;
    const cosmicId: HTMLInputElement = document.getElementById("cosmicId" + id) as HTMLInputElement;
    const siftPolyphen: HTMLInputElement = document.getElementById("siftPolyphenMutationTaster" + id) as HTMLInputElement;
    const buccal2: HTMLInputElement = document.getElementById("buccal2" + id) as HTMLInputElement;
    const igv: HTMLInputElement = document.getElementById("igv" + id) as HTMLInputElement;
    const sanger: HTMLInputElement = document.getElementById("sanger" + id) as HTMLInputElement;
    /* 03.02
    const exac: HTMLInputElement = document.getElementById('exac' + id) as HTMLInputElement;
    // tslint:disable-next-line:variable-name
    const exac_east_asia: HTMLInputElement = document.getElementById('exac_east_asia' + id) as HTMLInputElement;
    const krgdb: HTMLInputElement = document.getElementById('krgdb' + id) as HTMLInputElement;
    const etc1: HTMLInputElement = document.getElementById('etc1' + id) as HTMLInputElement;
    const etc2: HTMLInputElement = document.getElementById('etc2' + id) as HTMLInputElement;
    const etc3: HTMLInputElement = document.getElementById('etc3' + id) as HTMLInputElement;
    */
    /*
        if(buccal.value ==""){
          alert("buccal 값은 필수 입니다.");
          return;
        }
    */
    if (patientName.value === '') {
      alert('patient Name 값은 필수 입니다.');
      return;
    }
    if (gene.value === '') {
      alert('gene 값은 필수 입니다.');
      return;
    }
    if (transcript.value === '') {
      alert('transcript 값은 필수 입니다.');
      return;
    }

    // const type = this.type.nativeElement.value;
    const type = this.selectedtype.nativeElement.value;
    if (type === '') {
      alert('Type 값은 필수 입니다.');
      return;
    }

    const functional = this.functionalimpact.nativeElement.value;

    console.log('[114][update] ', type);
    if (id !== '') {
      /* 2021.03.02
            this.mutationService.updateMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
              functionalImpact.value, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
              zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value,
              exac.value, exac_east_asia.value, krgdb.value, etc1.value, etc2.value, etc3.value)
              */
      this.mutationService.updateMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
        functional, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
        zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value, type)
        .subscribe((data) => {
          console.log('[170][Mutation 수정]', data);
          alert('수정 되었습니다.');
          this.search(gene.value, '', type);
        });
    } else {
      /* 2021.03.02
      this.mutationService.insertMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
        functionalImpact.value, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
        zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value,
        exac.value, exac_east_asia.value, krgdb.value, etc1.value, etc2.value, etc3.value)
      */

      this.mutationService.insertMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
        functional, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
        zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value, type)
        .subscribe((data) => {
          console.log('[170][Mutation 저장]', data);
          alert('저장 되었습니다.');
          // this.search(gene.value, '', type);
          this.search('', '', 'AMLALL');
        });
    }
  }

  insertRow(): void {
    this.lists.push({
      id: '',
      buccal: '',
      patient_name: '',
      register_number: '',
      fusion: '',
      gene: '',
      functional_impact: '',
      transcript: '',
      exon_intro: '',
      nucleotide_change: '',
      amino_acid_change: '',
      zygosity: '',
      vaf: '',
      reference: '',
      cosmic_id: '',
      sift_polyphen_mutation_taster: '',
      buccal2: '',
      igv: '',
      sanger: '',
      exac: '',
      exac_east_asia: '',
      krgdb: '',
      etc1: '',
      etc2: '',
      etc3: '',
    });

    if (this.gubun === 'Genetic') {
      this.geneticRows().push(this.newGeneticRow());
    } else if (this.gubun === 'SEQ') {
      this.seqRows().push(this.newSeqRow());
    } else if (this.gubun === 'AMLALL') {
      this.amlRows().push(this.newAmlRow());
    }
  }
  myFunc(status: string): void {
    console.log('function called' + status);
  }

  goPage(page: string): void {
    if (page === '<' && this.pageLine > 0) {
      this.pageLine--;
      this.curPage = this.pageLine * 10 - 1;
      if (this.curPage < 1) { this.curPage = 1 }
    } else if (page === '>' && this.pageLine < Math.ceil(this.totPage / 10) - 1) {
      this.pageLine++;
      this.curPage = this.pageLine * 10 + 1;
    } else {
      if (page !== '<' && page !== '>') {
        this.curPage = Number(page);
      }
    }
    page = this.curPage + '';
    this.lists = this.listMutations.slice((Number(page) - 1) * 10, (Number(page)) * 10);

    if (this.gubun === 'Genetic') {
      this.geneticRows().clear();
      this.makeGeneticRows(this.lists);
    } else if (this.gubun === 'SEQ') {
      this.seqRows().clear();
      this.makeSeqRows(this.lists);
    } else if (this.gubun === 'AMLALL' || this.gubun === 'LYM' || this.gubun === 'MDS') {
      this.amlRows().clear();
      this.makeAmlRows(this.lists);
    }
  }

  search(genes: string, coding: string = '', type: string): void {
    this.gubun = type;
    if (type === 'ALL') {
      type = '';
    }
    this.totRecords = 0;
    this.lists$ = this.mutationService.getMutationList(genes, coding, type);
    this.lists$.subscribe((data) => {

      this.lists = data;
      this.mapping();
      this.listMutations = data;
      this.lists = data.slice(0, 10);
      console.log('[249][Mutation 검색]', this.lists);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listMutations.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listMutations.length;
      this.goPage('1');
    });

  }

  excelDownload(): void {
    // console.log('excel', this.listMutations);
    this.excel.exportAsExcelFile(this.listMutations, 'mutation');
  }

  findMutation(type): void {

    this.gubun = type;
    this.totRecords = 0;
    if (type === 'ALL') {

      this.lists$ = this.mutationService.getMutationList('', '', '');
    } else {
      this.lists$ = this.mutationService.getMutationList('', '', type);
    }

    this.lists$.subscribe((data) => {
      console.log('[260][Mutation 검색]', data, this.gubun);
      this.lists = data;
      this.mapping();
      this.listMutations = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listMutations.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listMutations.length;

      if (this.gubun === 'Genetic') {
        this.geneticRows().clear();
        this.makeGeneticRows(this.lists);
      } else if (this.gubun === 'SEQ') {
        this.seqRows().clear();
        this.makeSeqRows(this.lists);
      } else if (this.gubun === 'AMLALL' || this.gubun === 'LYM' || this.gubun === 'MDS') {
        this.amlRows().clear();
        this.makeAmlRows(this.lists);
      } else if (this.gubun === 'ALL') {
        this.lists = data;
      }
    });
  }

  mapping(): void {
    this.lists.forEach(item => {
      if (item.type === 'AMLALL') {
        item.display = 'AMLALL';
      } else if (item.type === 'MDS') {
        item.display = 'MDSMPN';
      } else if (item.type === 'LYM') {
        item.display = '악성림프종/형질세포종';
      } else if (item.type === 'Genetic') {
        item.display = '유전성 유전질환';
      }
    });

  }


  /////// 유전성유전
  loadGeneticForm(): void {
    this.geneticForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }

  makeGeneticRows(lists: IMutation[]): void {
    lists.forEach(list => {
      this.geneticRows().push(this.createGeneticRow({
        id: list.id,
        gene: list.gene,
        functional_impact: list.functional_impact,
        transcript: list.transcript,
        name: list.patient_name,
        patientID: '',
        exon: list.exon_intro,
        nucleotideChange: list.nucleotide_change,
        aminoAcidChange: list.amino_acid_change,
        zygosity: list.zygosity,
        dbSNPHGMD: list.dbsnp_hgmd,
        gnomADEAS: list.gnomad_eas,
        OMIM: list.omim,
        igv: list.igv,
        sanger: list.sanger
      }));
    });
  }

  createGeneticRow(list: IGenetic): FormGroup {
    return this.fb.group({
      id: list.id,
      gene: list.gene,
      functional_impact: list.functional_impact,
      transcript: list.transcript,
      name: list.name,
      patientID: list.patientID,
      exon: list.exon,
      nucleotideChange: list.nucleotideChange,
      aminoAcidChange: list.aminoAcidChange,
      zygosity: list.zygosity,
      dbSNPHGMD: list.dbSNPHGMD,
      gnomADEAS: list.gnomADEAS,
      OMIM: list.OMIM,
      igv: list.igv,
      sanger: list.sanger
    });
  }

  newGeneticRow(): FormGroup {
    return this.fb.group({
      id: 'N',
      gene: '',
      functional_impact: '',
      transcript: '',
      name: '',
      patientID: '',
      exon: '',
      nucleotideChange: '',
      aminoAcidChange: '',
      zygosity: '',
      dbSNPHGMD: '',
      gnomADEAS: '',
      OMIM: '',
      igv: '',
      sanger: ''
    });
  }

  geneticRows(): FormArray {
    return this.geneticForm.get('tableRows') as FormArray;
  }

  addNewGeneticRow(): void {
    this.geneticRows().push(this.newGeneticRow());
  }

  geneticSave(i: number): void {
    const control = this.geneticForm.get('tableRows') as FormArray;
    const rowData: IGenetic = control.at(i).value;
    console.log(rowData);
    const id = rowData.id;
    if (id === 'N') {
      this.mutationService.insertGenetic(rowData).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
        // this.geneticRows().clear();
        // this.loadData();
      });
    } else {
      this.mutationService.updateGenetic(rowData).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
      });
    }
  }

  geneticDelete(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      const control = this.geneticForm.get('tableRows') as FormArray;
      const rowData: IGenetic = control.at(i).value;
      this.geneticRows().removeAt(i);
      console.log('[399][삭제]', rowData);
      if (rowData.id === 'N') {
        this.geneticRows().removeAt(i);
        this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
      }
      this.mutationService.deleteGenetic(rowData.id)
        .subscribe(data => {
          this.geneticRows().removeAt(i);
          this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
        });
    } else {
      return;
    }
  }

  ///////////////////////////////////////////////// sequencing
  loadSeqForm(): void {
    this.seqForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }

  makeSeqRows(lists: IMutation[]): void {
    lists.forEach(list => {
      this.seqRows().push(this.createSeqRow({
        id: list.id,
        name: list.patient_name,
        functional_impact: list.functional_impact,
        gene: list.gene,
        exonintron: list.exon_intro,
        nucleotideChange: list.nucleotide_change,
        aminoAcidChange: list.amino_acid_change,
        zygosity: list.zygosity,
        rsid: list.rsid,
        genbankaccesion: list.genbank_accesion
      }));
    });
  }

  createSeqRow(list: ISEQ): FormGroup {
    return this.fb.group({
      id: list.id,
      name: list.name,
      functional_impact: list.functional_impact,
      gene: list.gene,
      exonintron: list.exonintron,
      nucleotideChange: list.nucleotideChange,
      aminoAcidChange: list.aminoAcidChange,
      zygosity: list.zygosity,
      rsid: list.rsid,
      genbankaccesion: list.genbankaccesion,
    });
  }


  newSeqRow(): FormGroup {
    return this.fb.group({
      id: 'N',
      name: '',
      functional_impact: '',
      gene: '',
      exonintron: '',
      nucleotideChange: '',
      aminoAcidChange: '',
      zygosity: '',
      rsid: '',
      genbankaccesion: '',
    });
  }

  seqRows(): FormArray {
    return this.seqForm.get('tableRows') as FormArray;
  }

  addNewSeqRow(): void {
    this.geneticRows().push(this.newGeneticRow());
  }

  seqSave(i: number): void {
    const control = this.seqForm.get('tableRows') as FormArray;
    const rowData: ISEQ = control.at(i).value;
    console.log(rowData);
    const id = rowData.id;
    if (id === 'N') {
      this.mutationService.insertSequencing(rowData).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
      });
    } else {
      this.mutationService.updateSequencing(rowData).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
      });
    }
  }

  seqDelete(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      const control = this.seqForm.get('tableRows') as FormArray;
      const rowData: ISEQ = control.at(i).value;
      this.seqRows().removeAt(i);
      console.log('[516][삭제][SEQ]', rowData);
      if (rowData.id === 'N') {
        this.seqRows().removeAt(i);
        this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
      }
      this.mutationService.deleteGenetic(rowData.id)
        .subscribe(data => {
          this.geneticRows().removeAt(i);
          this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
        });
    } else {
      return;
    }
  }
  //////////////////////////////////////////////////////////////////////
  /// AMLALL LYM MDS/MPN
  loadAmlForm(): void {
    this.amlForm = this.fb.group({
      tableRows: this.fb.array([])
    });
  }

  makeAmlRows(lists: IMutation[]): void {
    lists.forEach(list => {
      this.amlRows().push(this.createAmlRow({
        id: list.id,
        name: list.patient_name,
        gene: list.gene,
        functional_impact: list.functional_impact,
        transcript: list.transcript,
        exon: list.exon_intro,
        nucleotideChange: list.nucleotide_change,
        aminoAcidChange: list.amino_acid_change,
        zygosity: list.zygosity,
        vaf: list.vaf,
        reference: list.reference,
        cosmic_id: list.cosmic_id,
        igv: list.igv,
        sanger: list.sanger
      }));
    });
  }

  createAmlRow(list: IAML): FormGroup {
    return this.fb.group({
      id: list.id,
      name: list.name,
      gene: list.gene,
      functional_impact: list.functional_impact,
      transcript: list.transcript,
      exon: list.exon,
      nucleotideChange: list.nucleotideChange,
      aminoAcidChange: list.aminoAcidChange,
      zygosity: list.zygosity,
      vaf: list.vaf,
      reference: list.reference,
      cosmic_id: list.cosmic_id,
      igv: list.igv,
      sanger: list.sanger
    });
  }

  newAmlRow(): FormGroup {
    return this.fb.group({
      id: 'N',
      name: '',
      gene: '',
      functional_impact: '',
      transcript: '',
      exon: '',
      nucleotideChange: '',
      aminoAcidChange: '',
      zygosity: '',
      vaf: '',
      reference: '',
      cosmic_id: '',
      igv: '',
      sanger: '',
    });
  }

  amlRows(): FormArray {
    return this.amlForm.get('tableRows') as FormArray;
  }

  addNewAmlRow(): void {
    this.amlRows().push(this.newAmlRow());
  }

  amlSave(i: number): void {
    const control = this.amlForm.get('tableRows') as FormArray;
    const rowData: IAML = control.at(i).value;
    console.log(rowData);
    const id = rowData.id;
    if (id === 'N') {
      this.mutationService.insertAML(rowData, this.gubun).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
      });
    } else {
      this.mutationService.updateAML(rowData, this.gubun).subscribe(data => {
        this.snackBar.open('저장 하였습니다.', '닫기', { duration: 3000 });
      });
    }
  }

  amlDelete(i: number): void {
    const ask = confirm('삭제 하시겠습니까');
    if (ask) {
      const control = this.amlForm.get('tableRows') as FormArray;
      const rowData: IAML = control.at(i).value;
      this.seqRows().removeAt(i);
      console.log('[626][삭제][AML]', rowData);
      if (rowData.id === 'N') {
        this.amlRows().removeAt(i);
        this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
      }
      this.mutationService.deleteAML(rowData.id)
        .subscribe(data => {
          this.amlRows().removeAt(i);
          this.snackBar.open('삭제 하였습니다.', '닫기', { duration: 3000 });
        });
    } else {
      return;
    }
  }





















}
