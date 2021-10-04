/*
  Define format for bar
  Copyright (C) 2021 Archie Maclean
 */
import { TimeSignatureModel } from '../TimeSignature/model';
import { Note } from '../Note/model';
import TimeSignature from '../TimeSignature/functions';
import { genId, Item } from '../global/id';

export enum Barline {
  Repeat,
  Normal,
  End,
}

// TODO :)
export class BarModel extends Item {
  public timeSignature: TimeSignatureModel;
  public notes: Note[];
  public frontBarline: Barline;
  public backBarline: Barline;
  public isAnacrusis: boolean;
  constructor(timeSignature = TimeSignature.init(), anacrusis = false) {
    super(genId());
    this.timeSignature = timeSignature;
    this.notes = [];
    this.frontBarline = Barline.Normal;
    this.backBarline = Barline.Normal;
    this.isAnacrusis = anacrusis;
  }
  public static initAnacrusis(timeSignature = TimeSignature.init()) {
    return new BarModel(timeSignature, true);
  }
  public copy() {
    const b = new BarModel(this.timeSignature);
    b.notes = this.notes; //.map((n) => n.copy());
    b.frontBarline = this.frontBarline;
    b.backBarline = this.backBarline;
    b.isAnacrusis = this.isAnacrusis;
  }
}
