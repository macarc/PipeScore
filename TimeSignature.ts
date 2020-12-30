import { NoteLength } from './NoteLength';

// todo more denominators
type Denominator = 4 | 8;
type TimeSignature = [number, Denominator];

export function timeSignatureToNumberOfBeats(ts: TimeSignature): number {
  switch (ts[1]) {
    case 4:
      return ts[0];
    case 8:
      return Math.ceil(ts[0] / 3);
  }
}
