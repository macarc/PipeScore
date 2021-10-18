/*
  IDs are used as unique identifiers in e.g. selection, second timings
  Copyright (C) 2021 macarc
*/
export type ID = number;

export class Item {
  public id: ID;
  constructor(id: ID | null) {
    this.id = id || genId();
  }
  public hasID(id: ID) {
    return this.id === id;
  }
}

// Generate a random ID
export const genId = (): ID => Math.floor(Math.random() * 1000000000000);
