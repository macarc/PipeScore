interface BWWFileSpec {
    regex: RegExp;
    type: string;
}

const spec: BWWFileSpec[] = [
    {
        regex: /^Bagpipe Music Writer Gold:\d\.\d/,
        type: "Program Header",
    },
    {
        regex: /^MIDINoteMappings,\((\d{0,2},?){27}\)/,
        type: "MIDI Note Mappings Header",
    },
    {
        regex: /^FrequencyMappings,\((\d{2},?){27}\)/,
        type: "Frequency Mappings Header",
    },
    {
        regex: /^InstrumentMappings,\((\d{1,4},?){7}\)/,
        type: "Instrument Mappings Header",
    },
    {
        regex: /^GracenoteDurations,\((\d{1,3},?){14}\)/,
        type: "Gracenote Durations Header",
    },
    {
        regex: /^FontSizes,\((\d{1,3},?){5}\)/,
        type: "Font Sizes Header",
    },
    {
        regex: /TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{2,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)/,
        type: "Tune Format Header",
    },
    {
        regex: /TuneTempo,(\d*)/,
        type: "Tune Tempo Header",
    },
];

export default class Tokenizer {
    private stream: string;
    private cursor: number;

    constructor() {
        this.stream = "";
        this.cursor = 0;
    }

    init(stream: string) {
        this.stream = stream;
    }

    hasMoreTokens(): boolean {
        return this.cursor < this.stream.length;
    }

    getNextToken(): string | null {
        if (!this.hasMoreTokens()) {
            return null;
        }

        const slice = this.stream.slice(this.cursor);
        console.log("Getting slice");
        console.log(slice, spec[0]);

        let matched = spec[0].regex.exec(slice);

        if (matched) {
            console.log("Found a match");
        }

        return "";
    }
}
