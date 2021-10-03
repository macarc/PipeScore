/*
  IDs are used as unique identifiers in e.g. selection, second timings
  Copyright (C) 2021 Archie Maclean
*/
export type ID = number;

export class Item {
  public id: ID;
  constructor(id: ID | null) {
    this.id = id || genId();
  }
}

// Generate a random ID
export const genId = (): ID => Math.floor(Math.random() * 1000000000000);
