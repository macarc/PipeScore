import Parser from "../src/Parser";
import { Score } from "../types/main";

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

    test("it can parse a bagpipe reader software header", () => {
        expect(parser.parse(`Bagpipe Reader:1.0\r\n`)).toStrictEqual({
            name: "",
            headers: [
                {
                    type: "SOFTWARE_HEADER",
                    value: {
                        program: "Bagpipe Reader",
                        version: "1.0",
                    },
                },
            ],
            staves: [],
        });
    });

    test("it can parse a bagpipe musicworks software header", () => {
        expect(parser.parse(`Bagpipe Musicworks Gold:1.0\r\n`)).toStrictEqual({
            name: "",
            headers: [
                {
                    type: "SOFTWARE_HEADER",
                    value: {
                        program: "Bagpipe Musicworks Gold",
                        version: "1.0",
                    },
                },
            ],
            staves: [],
        });
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "B",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "C",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "B",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "C",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "B",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "C",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {},
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "B",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "C",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "E",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "F",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "HG",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "HA",
                                        length: "8",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "strike",
                                            value: {
                                                note: "lg",
                                            },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "B",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "g-gracenote-strike",
                                            value: { note: "b" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "C",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "thumb-strike",
                                            value: { note: "c" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "heavy-half-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "heavy-thumb-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "heavy-g-gracenote-strike",
                                            value: { note: "d" },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "doubling",
                                            value: { note: "la" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "B",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-doubling",
                                            value: { note: "b" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "C",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "thumb-doubling",
                                            value: { note: "c" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "doubling",
                                            value: { note: "d" },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: {
                            top: "4",
                            bottom: "4",
                        },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        pitch: "LA",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "doubling",
                                            value: { note: "la" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "B",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-doubling",
                                            value: { note: "b" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "C",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "thumb-doubling",
                                            value: { note: "c" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        pitch: "D",
                                        length: "4",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "doubling",
                                            value: { note: "d" },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "grip" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LG",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "half-grip" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "b-grip" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "b-grip" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "g-gracenote-grip",
                                            value: { note: "b" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "g-gracenote-b-grip",
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "thumb-grip",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "thumb-b-grip" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "half-b-grip" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-grip",
                                            value: { note: "b" },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "taorluath" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "b-taorluath" },
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "bubbly-note" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LG",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-bubbly-note",
                                        },
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "birl" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "HA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "a-birl" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "g-gracenote-birl",
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "HG",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "thumb-birl" },
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "throw" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "heavy-throw" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LG",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: { type: "half-throw" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LG",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-heavy-throw",
                                        },
                                    },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "pele",
                                            value: { note: "la" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-pele",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "thumb-pele",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-thumb-pele",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-pele",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-half-pele",
                                            value: { note: "d" },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "double-strike",
                                            value: { note: "la" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-double-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "g-gracenote-double-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-g-gracenote-double-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "thumb-double-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-thumb-double-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-double-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-half-double-strike",
                                            value: { note: "d" },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "triple-strike",
                                            value: { note: "la" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-triple-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "g-gracenote-triple-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-g-gracenote-triple-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "thumb-triple-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-thumb-triple-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "half-triple-strike",
                                            value: { note: "d" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "closed-half-triple-strike",
                                            value: { note: "d" },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenotes",
                                            value: { notes: ["d", "lg"] },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenotes",
                                            value: { notes: ["g", "la"] },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenotes",
                                            value: { notes: ["a", "b"] },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "HA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenotes",
                                            value: { notes: ["a", "hg"] },
                                        },
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
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenote",
                                            value: { note: "g" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "single",
                                        embellishment: { type: "taorluath" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "16",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse doubly dotted notes", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! gg LA_4 tar LAr_8 ''la Bl_16 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenote",
                                            value: { note: "g" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "double",
                                        embellishment: { type: "taorluath" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "16",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
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
                    repeat: false,

                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenote",
                                            value: { note: "g" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "single",
                                        embellishment: { type: "taorluath" },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "16",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "doubling",
                                            value: { note: "c" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "gracenote",
                                            value: { note: "e" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {
                                            type: "doubling",
                                            value: { note: "c" },
                                        },
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "8",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse a repeated part", () => {
        expect(
            parser.parse(`& sharpf sharpc 4_4 I!'' LA_4 B_4 C_4 D_4 ''!I`)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: true,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse a rest", () => {
        expect(
            parser.parse(`& sharpf sharpc 4_4 I! LA_4 B_4 REST_4 D_4 !I`)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "rest",
                                    value: {
                                        length: "4",
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse accidentals before notes", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! LA_4 sharpb B_4 flatc C_4 naturald D_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "sharp",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "flat",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "natural",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse accidentals before notes", () => {
        expect(
            parser.parse(`& sharpf sharpc 4_4 I! LA_4 B_4 C_4 fermatd D_4 !I`)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: true,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse the old tie format", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! LA_4 ^tla LA_4 B_4 C_4 ^tc ! C_4 D_2 ^td D_4 !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "2",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse the new tie format", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 4_4 I! ^ts LA_4 LA_4 ^te B_4 ^ts C_4 ! C_4 ^te ^ts D_2 D_4 ^te !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "4", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "2",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: true,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse the new triplet format", () => {
        expect(
            parser.parse(`& sharpf sharpc 2_4 I! ^3s C_8 E_8 LA_8 ^3e !I`)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "2", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "triplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse the old triplet format", () => {
        expect(
            parser.parse(`& sharpf sharpc 2_4 I! LA_4 E_8 C_8 LA_8 ^3e !I`)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "2", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "triplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse an irregular note group", () => {
        expect(
            parser.parse(`  & sharpf sharpc 6_8
                            I!
                            ^2s E_8 C_8 ^2e
                            ^43s LA_8 B_8 C_8 D_8 ^43e
                            ^46s LA_8 B_8 C_8 D_8 ^46e
                            ^53s LA_8 B_8 C_8 D_8 E_8 ^53e
                            ^54s LA_8 B_8 C_8 D_8 E_8 ^54e
                            !
                            ^64s LA_8 B_8 C_8 D_8 E_8 F_8 ^64e
                            ^74s LA_8 B_8 C_8 D_8 E_8 F_8 HG_8 ^74e
                            ^74s LA_8 B_8 C_8 D_8 E_8 F_8 HG_8 ^74e
                            !I`)
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "6", bottom: "8" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "duplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "quadruplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "B",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "D",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "quadruplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "B",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "D",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "quintuplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "B",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "D",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "quintuplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "B",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "D",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "sextuplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "B",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "D",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "F",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "septuplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "B",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "D",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "F",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "HG",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "septuplet",
                                    value: {
                                        notes: [
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "LA",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "B",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "C",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "D",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "E",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "F",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                            {
                                                type: "single",
                                                value: {
                                                    length: "8",
                                                    pitch: "HG",
                                                    accidental: "none",
                                                    tied: false,
                                                    fermata: false,
                                                    dot: "none",
                                                    embellishment: {},
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    test("it can parse time lines", () => {
        expect(
            parser.parse(
                `& sharpf sharpc 2_4 I! LA_4 B_4 ! '1 C_4 B_4 _' ! '2 C_4 D_4 _' ! 'intro HA_4 E_4 _' !I`
            )
        ).toStrictEqual({
            name: "",
            headers: [],
            staves: [
                {
                    repeat: false,
                    clef: {
                        key: [
                            { type: "sharp", note: "f" },
                            { type: "sharp", note: "c" },
                        ],
                        time: { top: "2", bottom: "4" },
                    },
                    bars: [
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "LA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "B",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "C",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "D",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                            ],
                        },
                        {
                            notes: [
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "HA",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
                                    },
                                },
                                {
                                    type: "single",
                                    value: {
                                        length: "4",
                                        pitch: "E",
                                        accidental: "none",
                                        tied: false,
                                        fermata: false,
                                        dot: "none",
                                        embellishment: {},
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
