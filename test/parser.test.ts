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

    test("it handles multiple headers", () => {
        expect(
            parser.parse(`
                Bagpipe Music Writer Gold:1.0
                MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)
            `)
        ).toStrictEqual({
            name: "",
            headers: [
                {
                    type: "SOFTWARE_HEADER",
                    value: {
                        program: "Bagpipe Music Writer Gold",
                        version: "1.0",
                    },
                },
                {
                    type: "MIDI_NOTE_MAPPINGS_HEADER",
                    value: "MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)",
                },
            ],
            staves: [],
        });
    });

    test("it handles all headers", () => {
        expect(
            parser.parse(`
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
        ).toStrictEqual({
            name: "",
            headers: [
                {
                    type: "SOFTWARE_HEADER",
                    value: {
                        program: "Bagpipe Music Writer Gold",
                        version: "1.0",
                    },
                },
                {
                    type: "MIDI_NOTE_MAPPINGS_HEADER",
                    value: "MIDINoteMappings,(54,56,58,59,61,63,64,66,68,56,58,60,61,63,65,66,68,70,55,57,59,60,62,64,65,67,69)",
                },
                {
                    type: "FREQUENCY_MAPPINGS_HEADER",
                    value: "FrequencyMappings,(370,415,466,494,554,622,659,740,831,415,466,523,554,622,699,740,831,932,392,440,494,523,587,659,699,784,880)",
                },
                {
                    type: "INSTRUMENT_MAPPINGS_HEADER",
                    value: "InstrumentMappings,(71,71,45,33,1000,60,70)",
                },
                {
                    type: "GRACENOTE_DURATIONS_HEADER",
                    value: "GracenoteDurations,(20,40,30,50,100,200,800,1200,250,250,250,500,200)",
                },
                {
                    type: "FONT_SIZES_HEADER",
                    value: "FontSizes,(100,130,55,100,250)",
                },
                {
                    type: "TUNE_FORMAT_HEADER",
                    value: "TuneFormat,(1,0,F,L,500,500,500,500,P,0,0)",
                },
                {
                    type: "TUNE_TEMPO_HEADER",
                    value: "90",
                },
                {
                    type: "TEXT_TAG",
                    value: {
                        text: "Scotland the Brave",
                        textType: "T",
                    },
                },
                {
                    type: "TEXT_TAG",
                    value: {
                        text: "March",
                        textType: "Y",
                    },
                },
                {
                    type: "TEXT_TAG",
                    value: {
                        text: "Traditional",
                        textType: "M",
                    },
                },
                {
                    type: "TEXT_TAG",
                    value: {
                        text: "",
                        textType: "F",
                    },
                },
            ],
            staves: [],
        });
    });
});

describe("correctly parses score body", () => {
    let parser = new Parser();

    test("it works without any headers", () => {
        expect(parser.parse(`& sharpf sharpc 3_4`)).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: {
                            top: "3",
                            bottom: "4",
                        },
                    },
                    bars: [],
                },
            ],
        });
    });

    test("it can parse common time signature", () => {
        expect(parser.parse(`& sharpf sharpc C`)).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: "common",
                    },
                    bars: [],
                },
            ],
        });
    });

    test("it can parse cut time signature", () => {
        expect(parser.parse(`& sharpf sharpc C_`)).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: "cut",
                    },
                    bars: [],
                },
            ],
        });
    });

    test("it can parse a single bar", () => {
        expect(
            parser.parse(`
            & sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 !I
            `)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    embellishment: {},
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse left and right beam directions", () => {
        expect(
            parser.parse(`
            & sharpf sharpc 4_4 I! LAr_8 Bl_8 Cr_8 Dl_8 Er_8 Fl_8 HGr_8 HAl_8 !I
            `)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    pitch: "LA",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "B",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "C",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "D",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "E",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "F",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "HG",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "HA",
                                    length: "8",
                                    tied: false,
                                    embellishment: {},
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse gracenotes", () => {
        expect(
            parser.parse(`
            & sharpf sharpc 4_4 I! LA_4 strlg LA_4 gstb B_4 tstc C_4 hstd D_4 lhstd D_4 ltstd D_4 lgstd D_4 !I
            `)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "strike",
                                        value: {
                                            note: "lg",
                                        },
                                    },
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "g-gracenote-strike",
                                        value: { note: "b" },
                                    },
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "thumb-strike",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "half-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "heavy-half-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "heavy-thumb-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "heavy-g-gracenote-strike",
                                        value: { note: "d" },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse doublings", () => {
        expect(
            parser.parse(`
            & sharpf sharpc 4_4 I! dbla LA_4 hdbb B_4 tdbc C_4 dbd D_4 !I
            `)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "la" },
                                    },
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "half-doubling",
                                        value: { note: "b" },
                                    },
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "thumb-doubling",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "d" },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse strikes", () => {
        expect(
            parser.parse(`
            & sharpf sharpc 4_4 I! dbla LA_4 hdbb B_4 tdbc C_4 dbd D_4 !I
            `)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "la" },
                                    },
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "half-doubling",
                                        value: { note: "b" },
                                    },
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "thumb-doubling",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "d" },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
});
