import { parsesWithoutWarnings } from './test_common';

describe('parse header', () => {
  it('handles a two captures', () =>
    expect(parsesWithoutWarnings('Bagpipe Music Writer Gold:1.0\r\n')).toBe(
      true
    ));
  it('parses a bagpipe reader software header', () =>
    expect(parsesWithoutWarnings('Bagpipe Reader:1.0\r\n')).toBe(true));
  it('parses a bagpipe musicworks software header', () =>
    expect(parsesWithoutWarnings('Bagpipe Musicworks Gold:1.0\r\n')).toBe(
      true
    ));

  it('parses multiple headers', () =>
    expect(
      parsesWithoutWarnings(`
                  Bagpipe Music Writer Gold:1.0
                  MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)
              `)
    ).toBe(true));

  it('parses all headers', () =>
    expect(
      parsesWithoutWarnings(`
                  Bagpipe Music Writer Gold:1.0
                  MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)
                  FrequencyMappings,(370,415,466,494,554,622,659,740,831,415,466,523,554,622,699,740,831,932,392,440,494,523,587,659,699,784,880)
                  InstrumentMappings,(71,71,45,33,1000,60,70)
                  GracenoteDurations,(20,40,30,50,100,200,800,1200,250,250,250,500,200)
                  FontSizes,(100,130,55,100,250)
                  TuneFormat,(1,0,F,L,500,500,500,500,P,0,0)
                  TuneTempo,90
  
                  "Scotland the Brave",(T,C,0,0,Times New Roman,18,700,0,0,18,0,0,0)
                  "March",(Y,L,0,0,Times New Roman,12,700,255,0,18,0,0,0)
                  "Traditional",(M,R,0,0,Times New Roman,12,700,255,0,18,0,0,0)
                  "",(F,C,0,0,Times New Roman,12,700,1,0,18,0,0,0)`)
    ).toBe(true));
});
