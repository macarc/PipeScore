import SpecType from "./types/SpecType";

const Spec: SpecType[] = [
    {
        regex: /^\s+/,
        type: "SKIP",
    },
    {
        regex: /^(Bagpipe Music Writer Gold):(\d\.\d)/,
        type: "SOFTWARE_HEADER",
    },
    {
        regex: /^MIDINoteMappings,\((\d{0,2},?){27}\)/,
        type: "MIDI_NOTE_MAPPINGS_HEADER",
    },
    {
        regex: /^FrequencyMappings,\((\d{3},?){27}\)/,
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
        regex: /^TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{2,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)/,
        type: "TUNE_FORMAT_HEADER",
    },
    {
        regex: /^TuneTempo,(\d*)/,
        type: "TUNE_TEMPO_HEADER",
    },
    {
        regex: /^"([^"]*)",\((\w),(\w),\d{1,2},\d{1,2},[^,]*,\d{1,2},\d{1,3},\d{1,3},\d,\d{1,2},\d,\d,\d\)/,
        type: "TEXT_TAG",
    },
    {
        regex: /^&/,
        type: "CLEF",
    },
];

export default Spec;
