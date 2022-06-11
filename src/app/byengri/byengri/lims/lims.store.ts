import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root',
})
export class LimtStore {
 // RNAseP
  wellposition: string[] = [];
  samplename: string[] = [];
  ct: string[] = [];
  quantity: string[] = [];
  // qPCR
  qPCRWellposition: string[] = [];
  qPCRQuantity: string[] = [];
  // qubitData
  assay: string[] = [];
  origin: string[] = [];

  setRNAsePWellPosition(wellposition: string[]): void {
    this.wellposition = wellposition;
  }

  getRNAsePWellPosition( ): string[] {
    return this.wellposition;
  }

  setRNAsepSampleName(samplename: string[]): void {
    this.samplename = samplename;
  }

  getRNAsepSampleName( ): string[] {
    return this.samplename;
  }

  setRNAsepCT(ct: string[]): void {
    this.ct = ct;
  }

  getRNAsepCT( ): string[] {
    return this.ct;
  }

  setRNAsepQuantity(quantity: string[]): void {
    this.quantity = quantity;
  }

  getRNAsepQuantity( ): string[] {
    return this.quantity;
  }
//////////////////////////////////////////////////
  setqPCRWellPosition(wellposition: string[]): void {
    this.qPCRWellposition = wellposition;
  }

  getqPCRWellPosition( ): string[] {
    return this.qPCRWellposition;
  }

  setqPCRQuantity(quantity: string[]): void {
    this.qPCRQuantity = quantity;
  }

  getqPCRQuantity( ): string[] {
    return this.qPCRQuantity;
  }

///////////////////////////////////////////
  setqubitDataAssay(assay: string[]): void {
    this.assay = assay;
  }

  getqubitDataAssay( ): string[] {
     return this.assay ;
  }

  setqubitDatOrigin(origin: string[] ): void {
    this.origin = origin;
  }

  getqubitDatOrigin( ): string[] {
    return this.origin;
  }








}

