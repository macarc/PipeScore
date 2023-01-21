import { Pitch } from '../../PipeScore/global/pitch';

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
      throw new Error('Unrecognised pitch');
  }
}
