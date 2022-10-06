import Tokenizer from "./Tokenizer";

const spec = [
    [/^Bagpipe Music Writer Gold:\d\.\d/, "Program Header"],
    [/^MIDINoteMappings,\((\d{0,2},?){27}\)/, "MIDI Note Mappings Header"],
    [/^FrequencyMappings,\((\d{2},?){27}\)/, "Frequency Mappings Header"],
    [/^InstrumentMappings,\((\d{1,4},?){7}\)/, "Instrument Mappings Header"],
    [/^GracenoteDurations,\((\d{1,3},?){14}\)/, "Gracenote Durations Header"],
    [/^FontSizes,\((\d{1,3},?){5}\)/, "Font Sizes Header"],
    [
        /TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{2,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)/,
        "TuneFormat",
    ],
    [/TuneTempo,(\d*)/, "Tune Tempo Header"],
];

export default class Parser {
    private data: string;
    private tokenizer: Tokenizer;

    constructor() {
        this.data = "";
        this.tokenizer = new Tokenizer();
    }

    /**
     * Returns an AST of the BWW file
     */
    parse(data: string): object {
        this.data = data;
        this.tokenizer.init(this.data);
        console.log("Initialized tokenizer with data: ", this.data);
        this.tokenizer.getNextToken();

        return this.Score();
    }

    Score() {
        return {
            name: "",
            staves: [],
        };
    }
}
