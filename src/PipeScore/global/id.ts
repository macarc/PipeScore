/*
  IDs are used as unique identifiers in e.g. selection, second timings
  Copyright (C) 2021 Archie Maclean
*/
export type ID = number;

export interface Item {
  id: ID;
}

// Generate a random ID
export const genId = (): ID => Math.floor(Math.random() * 1000000000000);
