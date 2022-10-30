import Parser from "../src/Parser";

describe("correctly parses file header", () => {
    const parser = new Parser();

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
    const parser = new Parser();

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
                        time: { type: "common" },
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
                        time: { type: "cut" },
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
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse a multiple bars", () => {
        expect(
            parser.parse(`
            & sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 ! LA_4 B_4 C_4 D_4 !I
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
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse a multiple lines", () => {
        expect(
            parser.parse(`
            & sharpf sharpc 4_4 I! LA_4 !I
            & sharpf sharpc  I! LA_4 !I
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
                                    dotted: false,
                                    embellishment: {},
                                },
                            ],
                        },
                    ],
                },
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: {},
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
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
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "B",
                                    length: "8",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "C",
                                    length: "8",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "D",
                                    length: "8",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "E",
                                    length: "8",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "F",
                                    length: "8",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "HG",
                                    length: "8",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "HA",
                                    length: "8",
                                    tied: false,
                                    dotted: false,
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
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    pitch: "LA",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
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
                                    dotted: false,
                                    embellishment: {
                                        type: "g-gracenote-strike",
                                        value: { note: "b" },
                                    },
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "thumb-strike",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "half-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "heavy-half-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "heavy-thumb-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
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
                                    dotted: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "la" },
                                    },
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "half-doubling",
                                        value: { note: "b" },
                                    },
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "thumb-doubling",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
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
                                    dotted: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "la" },
                                    },
                                },
                                {
                                    pitch: "B",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "half-doubling",
                                        value: { note: "b" },
                                    },
                                },
                                {
                                    pitch: "C",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "thumb-doubling",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    pitch: "D",
                                    length: "4",
                                    tied: false,
                                    dotted: false,
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

    test("it can parse grips", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! LA_4 grp E_4 LG_4 hgrp E_4 D_4 grpb E_4 D_4 grpb LA_4 E_4 ggrpb B_4 D_4 ggrpdb E_4 tgrpd D_4 tgrpdb D_4 hgrpdb D_4 hgrpb B_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "grip" },
                                },
                                {
                                    length: "4",
                                    pitch: "LG",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "half-grip" },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "b-grip" },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "b-grip" },
                                },
                                {
                                    length: "4",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "B",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "g-gracenote-grip",
                                        value: { note: "b" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "g-gracenote-b-grip",
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "thumb-grip",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "thumb-b-grip" },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "half-b-grip" },
                                },
                                {
                                    length: "4",
                                    pitch: "B",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "half-grip",
                                        value: { note: "b" },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse taorluaths", () => {
        expect(
            parser.parse(`& sharpf sharpc 4_4 I! C_4 tar LA_4 D_4 tarb LA_4 !I`)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "C",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "taorluath" },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "b-taorluath" },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse bubbly notes", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! C_4 bubly B_4 LG_4 hbubly B_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "C",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "B",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "bubbly-note" },
                                },
                                {
                                    length: "4",
                                    pitch: "LG",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "B",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "half-bubbly-note" },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse birls", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! LA_4 brl LA_4 HA_4 abr LA_4 E_4 gbr LA_4 HG_4 tbr LA_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "birl" },
                                },
                                {
                                    length: "4",
                                    pitch: "HA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "a-birl" },
                                },
                                {
                                    length: "4",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "g-gracenote-birl" },
                                },
                                {
                                    length: "4",
                                    pitch: "HG",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "thumb-birl" },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse throws", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! LA_4 thrd D_4 LA_4 hvthrd D_4 LG_4 hthrd D_4 LG_4 hhvthrd D_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "throw" },
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "heavy-throw" },
                                },
                                {
                                    length: "4",
                                    pitch: "LG",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "half-throw" },
                                },
                                {
                                    length: "4",
                                    pitch: "LG",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: { type: "half-heavy-throw" },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse peles", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! E_4 pella LA_4 lpeld D_4 tpeld D_4 ltpeld D_4 hpeld D_4 lhpeld D_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "pele",
                                        value: { note: "la" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-pele",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "thumb-pele",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-thumb-pele",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "half-pele",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-half-pele",
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

    test("it can parse double strikes", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! LA_4 st2la LA_4 lst2d D_4 gst2d D_4 lgst2d D_4 tst2d D_4 ltst2d D_4 hst2d D_4 lhst2d D_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "double-strike",
                                        value: { note: "la" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-double-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "g-gracenote-double-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-g-gracenote-double-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "thumb-double-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-thumb-double-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "half-double-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-half-double-strike",
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

    test("it can parse triple strikes", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! LA_4 st3la LA_4 lst3d D_4 gst3d D_4 lgst3d D_4 tst3d D_4 ltst3d D_4 hst3d D_4 lhst3d D_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "triple-strike",
                                        value: { note: "la" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-triple-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "g-gracenote-triple-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-g-gracenote-triple-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "thumb-triple-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-thumb-triple-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "half-triple-strike",
                                        value: { note: "d" },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "D",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "closed-half-triple-strike",
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

    test("it can parse double gracenotes", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! dlg LA_4 gla B_4 tb C_4 thg HA_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "gracenotes",
                                        value: { notes: ["d", "lg"] },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "B",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "gracenotes",
                                        value: { notes: ["g", "la"] },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "C",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "gracenotes",
                                        value: { notes: ["a", "b"] },
                                    },
                                },
                                {
                                    length: "4",
                                    pitch: "HA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "gracenotes",
                                        value: { notes: ["a", "hg"] },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse singly dotted notes", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! gg LA_4 tar LAr_8 'la Bl_16 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "gracenote",
                                        value: { note: "g" },
                                    },
                                },
                                {
                                    length: "8",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: true,
                                    embellishment: { type: "taorluath" },
                                },
                                {
                                    length: "16",
                                    pitch: "B",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse an anacrusis", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 E_8 ! gg LA_4 tar LAr_8 'la Bl_16 dbc Cr_8 eg LAl_8 dbc Cr_8 El_8 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    clef: {
                        key: ["sharpf", "sharpc"],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    length: "8",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    length: "4",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "gracenote",
                                        value: { note: "g" },
                                    },
                                },
                                {
                                    length: "8",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: true,
                                    embellishment: { type: "taorluath" },
                                },
                                {
                                    length: "16",
                                    pitch: "B",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                                {
                                    length: "8",
                                    pitch: "C",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    length: "8",
                                    pitch: "LA",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "gracenote",
                                        value: { note: "e" },
                                    },
                                },
                                {
                                    length: "8",
                                    pitch: "C",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {
                                        type: "doubling",
                                        value: { note: "c" },
                                    },
                                },
                                {
                                    length: "8",
                                    pitch: "E",
                                    tied: false,
                                    dotted: false,
                                    embellishment: {},
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
});
