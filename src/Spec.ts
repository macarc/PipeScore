import { SpecType, TokenType } from "../types/main";

const Spec: SpecType[] = [
    {
        regex: /^\s+/,
        type: TokenType.SKIP,
    },
    {
        regex: /^(Bagpipe Music Writer Gold):(\d\.\d)/,
        type: TokenType.SOFTWARE_HEADER,
    },
    {
        regex: /^MIDINoteMappings,\((\d{0,2},?){27}\)/,
        type: TokenType.MIDI_NOTE_MAPPINGS_HEADER,
    },
    {
        regex: /^FrequencyMappings,\((\d{3},?){27}\)/,
        type: TokenType.FREQUENCY_MAPPINGS_HEADER,
    },
    {
        regex: /^InstrumentMappings,\((\d{1,4},?){7}\)/,
        type: TokenType.INSTRUMENT_MAPPINGS_HEADER,
    },
    {
        regex: /^GracenoteDurations,\((\d{1,3},?){14}\)/,
        type: TokenType.GRACENOTE_DURATIONS_HEADER,
    },
    {
        regex: /^FontSizes,\((\d{1,3},?){5}\)/,
        type: TokenType.FONT_SIZES_HEADER,
    },
    {
        regex: /^TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{2,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)/,
        type: TokenType.TUNE_FORMAT_HEADER,
    },
    {
        regex: /^TuneTempo,(\d*)/,
        type: TokenType.TUNE_TEMPO_HEADER,
    },
    {
        regex: /^"([^"]*)",\((\w),(\w),\d{1,2},\d{1,2},[^,]*,\d{1,2},\d{1,3},\d{1,3},\d,\d{1,2},\d,\d,\d\)/,
        type: TokenType.TEXT_TAG,
    },
    {
        regex: /^&/,
        type: TokenType.CLEF,
    },
    {
        regex: /^((?:sharp|flat)(?:lg|la|b|c|d|e|f|g|a))/,
        type: TokenType.KEY_SIGNATURE,
    },
    {
        regex: /^(?:(\d)_(\d))|(C_)|(C)/,
        type: TokenType.TIME_SIGNATURE,
    },
];

export default Spec;
