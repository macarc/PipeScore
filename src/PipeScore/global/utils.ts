/*
  General helper functions
  Copyright (C) 2021 Archie Maclean
*/

export type Obj = Record<string, any>;
// Log helper functions, make logging easier
// E.g. x = someThing + (whatIsThis * 3) --> x = something + (log(whatIsThis) * 3)
// log - print value and return it
// log2 - print first value, return second
// logf - print function when called, return function
export const log = <T>(a: T): T => {
  console.log(a);
  return a;
};
export const log2 = <T, A>(a: A, b: T): T => {
  console.log(a);
  return b;
};
export const logf = <A, T extends () => A>(a: T): T => {
  console.log(a());
  return a;
};
export const unlog = <T>(a: T): T => a;
export const unlogf = <T>(a: T): T => a;
export const unlog2 = <T, A>(a: A, b: T): T => b;

// Deep copy an object
export function deepcopy<A>(obj: A): A {
  return JSON.parse(JSON.stringify(obj));
}

// Type guard for non-null
export function removeNull<A>(a: A | null): a is A {
  return a !== null;
}

// Turn a 1-deep nested array into a flat array
export function arrayflatten<T>(array: T[][]): T[] {
  return ([] as T[]).concat(...array);
}

export const car = <U, V>(pair: [U, V]): U => pair[0];
export const first = <T>(array: T[]): T | null => array[0] || null;
// Find the last value of an array in fewer characters
export const last = <T>(array: T[]): T | null =>
  array[array.length - 1] || null;
// ONLY use this if you have checked before hand that the array length is >= 1
export const nlast = <T>(array: T[]): T => array[array.length - 1];

// null functor :)
export const nmap = <T, A>(a: T | null, f: (a: T) => A): A | null =>
  a ? f(a) : null;

// Immutable splice
export const replaceIndex = <T>(
  index: number,
  numberToRemove: number,
  array: T[],
  ...replace: T[]
): T[] => [
  ...(array.slice(0, index) || []),
  ...(replace || []),
  ...(array.slice(index + numberToRemove) || []),
];

export const replace = <T>(
  item: T,
  numberToRemove: number,
  array: T[],
  ...replace: T[]
): T[] => replaceIndex(array.indexOf(item), numberToRemove, array, ...replace);
