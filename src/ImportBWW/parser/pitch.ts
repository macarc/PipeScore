import { Pitch } from '../../PipeScore/global/pitch';

// There are two pitch formats - one is used for all notes and
// in some embellishments, the other is used for single gracenotes
// or for single gracenotes as part of an embellishment (e.g. for
// the gracenote on a birl)

export function toGracenotePitch(pitch: string): Pitch {
  switch (pitch.toLowerCase()) {
    case 'a':
      return Pitch.A;
    case 'b':
      return Pitch.B;
    case 'c':
      return Pitch.C;
    case 'd':
      return Pitch.D;
    case 'e':
      return Pitch.E;
    case 'f':
      return Pitch.F;
    case 'g':
      return Pitch.HG;
    case 't':
      return Pitch.HA;
    default:
      throw new Error(`Unrecognised gracenote pitch: got "${pitch}"`);
  }
}

export function toPitch(pitch: string): Pitch {
  switch (pitch.toLowerCase()) {
    case 'lg':
      return Pitch.G;
    case 'la':
      return Pitch.A;
    case 'b':
      return Pitch.B;
    case 'c':
      return Pitch.C;
    case 'd':
      return Pitch.D;
    case 'e':
      return Pitch.E;
    case 'f':
      return Pitch.F;
    case 'hg':
      return Pitch.HG;
    case 'ha':
      return Pitch.HA;
    default:
      throw new Error(`Unrecognised pitch: got "${pitch}"`);
  }
}
