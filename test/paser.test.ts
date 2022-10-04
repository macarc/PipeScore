import FileParser from "../src/FileParser";

describe("correctly parses file header", () => {
    let parser = new FileParser();

    test("parses tempo with multiple header lines", () => {
        parser.parse(
            `Bagpipe Music Writer Gold:1.0\r\nMIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)\r\nFrequencyMappings,(370,415,466,494,554,622,659,740,831,415,466,523,554,622,699,740,831,932,392,440,494,523,587,659,699,784,880)\r\nInstrumentMappings,(71,71,45,33,1000,60,70)\r\nGracenoteDurations,(20,40,30,50,100,200,800,1200,250,250,250,500,200)\r\nFontSizes,(100,130,55,100,250)\r\nTuneFormat,(1,0,F,L,500,500,500,500,P,0,0)\r\nTuneTempo,90\r\n`
        );

        expect(parser.getTempo()).toBe(90);
    });

    test("parses single tempo line", () => {
        parser.parse(`TuneTempo,90\r\n`);

        expect(parser.getTempo()).toBe(90);
    });
});
