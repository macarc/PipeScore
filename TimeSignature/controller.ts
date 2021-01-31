import { TimeSignatureModel } from './model';

type EditNumerator = {
  name: 'edit numerator',
  timeSignature: TimeSignatureModel
}
const isEditNumerator = (e: TimeSignatureEvent): e is EditNumerator => e.name === 'edit numerator';

type EditDenominator = {
  name: 'edit denominator',
  timeSignature: TimeSignatureModel
}
const isEditDenominator = (e: TimeSignatureEvent): e is EditDenominator => e.name === 'edit denominator';

type TimeSignatureEvent = EditNumerator | EditDenominator;

export function dispatch(a: TimeSignatureEvent) { }
