import { match } from "assert";
import Token from "./types/Token";

interface BWWFileSpec {
    regex: RegExp;
    type: string;
}

const spec: BWWFileSpec[] = [
    {
        regex: /^(Bagpipe Music Writer Gold):(\d\.\d)/,
        type: "SOFTWARE_HEADER",
    },
    {
        regex: /^MIDINoteMappings,\((\d{0,2},?){27}\)/,
        type: "MIDI_NOTE_MAPPINGS_HEADER",
    },
    {
        regex: /^FrequencyMappings,\((\d{2},?){27}\)/,
        type: "FREQUENCY_MAPPINGS_HEADER",
    },
    {
        regex: /^InstrumentMappings,\((\d{1,4},?){7}\)/,
        type: "INSTRUMENT_MAPPINGS_HEADER",
    },
    {
        regex: /^GracenoteDurations,\((\d{1,3},?){14}\)/,
        type: "GRACENOTE_DURATIONS_HEADER",
    },
    {
        regex: /^FontSizes,\((\d{1,3},?){5}\)/,
        type: "FONT_SIZES_HEADER",
    },
    {
        regex: /TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{2,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)/,
        type: "TUNE_FORMAT_HEADER",
    },
    {
        regex: /TuneTempo,(\d*)/,
        type: "TUNE_TEMPO_HEADER",
    },
    {
        regex: /^"([^"]*)",\((\w),(\w),\d{1,2},\d{1,2},[^,]*,\d{1,2},\d{1,3},\d{1,3},\d,\d{1,2},\d,\d,\d\)/,
        type: "TEXT_TAG",
    },
    {
        regex: /^\s+/,
        type: "SKIP",
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
        this.cursor = 0;
    }

    isEOF(): boolean {
        return this.cursor === this.stream.length;
    }

    hasMoreTokens(): boolean {
        return this.cursor < this.stream.length;
    }

    getNextToken(): Token | null {
        if (!this.hasMoreTokens()) {
            return null;
        }

        const slice = this.stream.slice(this.cursor);

        for (const item of spec) {
            let token = item.regex.exec(slice);

            // Couldn't match this rule, continue.
            if (token == null) {
                continue;
            }

            this.cursor += token[0].length;

            if (item.type === "SKIP") {
                return this.getNextToken();
            }

            return {
                type: item.type,
                value: token,
            };
        }

        throw new SyntaxError(`Unexpected token: "${slice[0]}"`);
    }
}
