/*
   Copyright (C) 2021 Archie Maclean
 */
import { ID } from './types';

// Log helper functions, make logging easier
// E.g. x = someThing + (whatIsThis * 3) --> x = something + (log(whatIsThis) * 3)
// log - print value and return it
// log2 - print first value, return second
// logf - print function when called, return function
export const log = <T>(a: T): T => {
  console.log(a);
  return a;
}
export const log2 = <T, A>(a: A,b: T): T => {
  console.log(a);
  return b;
}
export const logf = <A, T extends () => A>(a: T): T => {
  console.log(a());
  return a;
}
export const unlog = <T>(a: T): T => a;
export const unlogf = <T>(a: T): T => a;
export const unlog2 = <T, A>(a: A,b: T): T => b;

// Generate a random ID
export const genId = (): ID => Math.floor(Math.random() * 100000000)

// Deep copy an object
export function deepcopy<A>(obj: A): A {
  return JSON.parse(JSON.stringify(obj));
}

// Type guard for non-null
export function removeNull<A>(a: A | null): a is A {
  return a !== null;
}

// Turn a 1-deep nested array into a flat array
export function flatten<T>(array: T[][]): T[] {
  return ([] as T[]).concat(...array);
}

// Find the last value of an array in fewer characters
export const last = <T>(array: T[]): T | null => array[array.length - 1] || null;
// ONLY use this if you have checked before hand that the array length is >= 1
export const nlast = <T>(array: T[]): T => array[array.length - 1];

// null functor :)
export const nmap = <T, A>(a: T | null, f: (a: T) => A): A | null => a ? f(a) : null;
