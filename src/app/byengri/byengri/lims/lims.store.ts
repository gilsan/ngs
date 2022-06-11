import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root',
})
export class LimtStore {
 // RNAseP
  ct: string[] = [];
  quantity: string[] = [];
  // qPCR
  qPCRQuantity: string[] = [];
  // qubitData
  origin: string[] = [];

  setRNAsepCT(ct: string[] = []): void {
    this.ct = ct;
  }

  getRNAsepCT( ): string[] {
    return this.ct;
  }

  setRNAsepQuantity(quantity: string[] = []): void {
    this.quantity = quantity;
  }

  getRNAsepQuantity( ): string[] {
    return this.quantity;
  }
//////////////////////////////////////////////////
  setqPCRQuantity(quantity: string[] = []): void {
    this.qPCRQuantity = quantity;
  }

  getqPCRQuantity( ): string[] {
    return this.qPCRQuantity;
  }
///////////////////////////////////////////

  setqubitDatOrigin(origin: string[] =[] ): void {
    this.origin = origin;
  }

  getqubitDatOrigin( ): string[] {
    return this.origin;
  }








}

