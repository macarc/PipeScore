import { parse } from '../Parser';

export function parsesWithoutWarnings(text: string): boolean {
  const warnings = parse(text).warnings;
  if (warnings.some((w) => w.startsWith("Didn't parse full score"))) {
    console.log(warnings);
    return false;
  }
  return true;
}
