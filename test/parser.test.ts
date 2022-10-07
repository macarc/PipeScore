import Parser from "../src/Parser";

describe("correctly parses file header", () => {
    let parser = new Parser();

    test("it handles a two captures", () => {
        expect(parser.parse(`Bagpipe Music Writer Gold:1.0\r\n`)).toStrictEqual(
            {
                name: "",
                headers: [
                    {
                        type: "SOFTWARE_HEADER",
                        value: {
                            program: "Bagpipe Music Writer Gold",
                            version: "1.0",
                        },
                    },
                ],
                staves: [],
            }
        );
    });

    test("it handles header with multiple captures", () => {
        expect(
            parser.parse(`
                MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)
            `)
        ).toStrictEqual({
            name: "",
            headers: [
                {
                    type: "MIDI_NOTE_MAPPINGS_HEADER",
                    value: "MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)",
                },
            ],
            staves: [],
        });
    });
});
