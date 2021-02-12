
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

export type ID = number;
export const genId = (): ID => Math.floor(Math.random() * 100000000)

export function deepcopy<A>(obj: A): A {
  return JSON.parse(JSON.stringify(obj));
}

export function removeNull<A>(a: A | null): a is A {
  return a !== null;
}

export function flatten<T>(array: T[][]): T[] {
  return ([] as T[]).concat(...array);
}

