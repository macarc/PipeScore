import exportBWW from '..';
import { Score } from '../../PipeScore/Score/impl';
import { TimeSignature } from '../../PipeScore/TimeSignature/impl';

describe('exportBWW', () => {
  it('works for an empty score', () => {
    const score = new Score(
      'test title',
      'test composer',
      'test tune type',
      0,
      false,
      new TimeSignature()
    );
    expect(exportBWW(score)).toBe(`Bagpipe Reader:1.0
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
"test title",(T,L,0,0,Times New Roman,16,700,0,0,18,0,0,0)
"test tune type",(Y,C,0,0,Times New Roman,14,400,0,0,18,0,0,0)
"test composer",(M,R,0,0,Times New Roman,14,400,0,0,18,0,0,0)
"BWW file generated using PipeScore's experimental export feature",(F,R,0,0,Times New Roman,10,400,0,0,0,0,0,0)
& sharpf sharpc`);
  });
});
