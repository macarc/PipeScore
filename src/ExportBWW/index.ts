//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  Export to BWW format

import { IScore } from '../PipeScore/Score';
import { BBeatBreak } from './BWWItem';
import { toLinearScore } from './LinearScore';

export default function exportBWW(score: IScore): string {
  return (
    header(score) +
    toLinearScore(score).reduce(
      (acc, item, i, ls) =>
        `${acc}${
          item instanceof BBeatBreak ||
          ls[i - 1] instanceof BBeatBreak ||
          ls[i - 1] === undefined
            ? ''
            : ' '
        }${item.generate()}`,
      ''
    )
  );
}

function header(score: IScore): string {
  return `Bagpipe Reader:1.0
MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,6
8,70,55,57,59,60,62,64,65,67,69)
FrequencyMappings,(370,415,466,494,554,622,659,740,831,415,466,52
3,554,622,699,740,831,932,392,440,494,523,587,659,699,784,880)
InstrumentMappings,(71,71,45,33,1000,100)
GracenoteDurations,(20,40,30,50,100,200,800,1200,250,250,250,500,20
0)
FontSizes,(100,100,100,100)
TuneFormat,(1,0,F,L,500,500,500,500,P,0,0)
TuneTempo,90
"${score.name()}",(T,L,0,0,Times New Roman,16,700,0,0,18,0,0,0)
"${score.textBoxes()[0][2]?.text() || 'Type'}",(Y,C,0,0,Times New Roman,14,400,0,0,18,0,0,0)
"${score.textBoxes()[0][1]?.text() || 'Composer/Arranger'}",(M,R,0,0,Times New Roman,14,400,0,0,18,0,0,0)
"BWW file generated using PipeScore's experimental export feature",(F,R,0,0,Times New Roman,10,400,0,0,0,0,0,0)`;
}
