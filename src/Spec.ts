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
        regex: /^I!/,
        type: TokenType.PART_BEGINNING,
    },
    {
        regex: /^!I/,
        type: TokenType.PART_END,
    },
    {
        regex: /^!/,
        type: TokenType.BAR_LINE,
    },

    {
        regex: /^((?:sharp|flat)(?:lg|la|b|c|d|e|f|g|a))/,
        type: TokenType.KEY_SIGNATURE,
    },
    {
        regex: /^((?:LG)|(?:LA)|(?:[BCDEF])|(?:HG)|(?:HA))([lr])?_(\d{1,2})/,
        type: TokenType.MELODY_NOTE,
    },
    {
        regex: /^(?:(\d)_(\d))|^(C_)|^(C)/,
        type: TokenType.TIME_SIGNATURE,
    },
    {
        regex: /^REST_(\d{1,2})/,
        type: TokenType.REST,
    },
    {
        regex: /^'{1,2}((?:lg)|(?:la)|[bcdef]|(?:hg)|(?:ha))/,
        type: TokenType.DOTTED_NOTE,
    },
    {
        regex: /^([th]?db)((?:[lh][ga])|([bcdef]))/,
        type: TokenType.DOUBLING,
    },
    {
        regex: /^((?:(?:lh)|(?:lt)|(?:lg)|[gth]?)str?)((?:lg)|(?:la)|(?:hg)|(?:ha)|[bcdef])/,
        type: TokenType.STRIKE,
    },
    {
        regex: /^((?:htar)|(?:tarb?))/,
        type: TokenType.TAORLUATH,
    },
    {
        regex: /^(h?bubly)/,
        type: TokenType.BUBBLY,
    },
    {
        regex: /^((?:hgrp)|(?:grpb)|(?:grp))[^\w]/,
        type: TokenType.REGULAR_GRIP,
    },
    {
        regex: /^((?:[hgt])?grp?(?:db)*)((?:la)|(?:hg)|(?:ha)|[bcdef])*/,
        type: TokenType.COMPLEX_GRIP,
    },
    {
        regex: /^^((?:brl)|(?:[agt]br))/,
        type: TokenType.BIRL,
    },
    {
        regex: /^((?:thrd)|(?:hvthrd)|(?:hthrd)|(?:hhvthrd))/,
        type: TokenType.THROW,
    },
    {
        regex: /^(pel)((?:la)|[bcdef])/,
        type: TokenType.PELE,
    },
    {
        regex: /^([th]pel)((?:la)|(?:hg)|[bcdef])/,
        type: TokenType.PELE,
    },
    {
        regex: /^(l[th]*pel)(d)/,
        type: TokenType.PELE,
    },
    {
        regex: /^(st2)((?:ha)|(?:hg)|(?:la)|[bcdef])/,
        type: TokenType.DOUBLE_STRIKE,
    },
    {
        regex: /^(gst2)((?:la)|[bcdef])/,
        type: TokenType.DOUBLE_STRIKE,
    },
    {
        regex: /^(tst2)((?:la)|(?:hg)|[bcdef])/,
        type: TokenType.DOUBLE_STRIKE,
    },
    {
        regex: /^(hst2)((?:la)|(?:hg)|(?:ha)|[bcdef])/,
        type: TokenType.DOUBLE_STRIKE,
    },
    {
        regex: /^(l[hgt]*st2)(d)/,
        type: TokenType.DOUBLE_STRIKE,
    },
    {
        regex: /^(st3)((?:ha)|(?:hg)|(?:la)|[bcdef])/,
        type: TokenType.TRIPLE_STRIKE,
    },
    {
        regex: /^(gst3)((?:la)|[bcdef])/,
        type: TokenType.TRIPLE_STRIKE,
    },
    {
        regex: /^(tst3)((?:la)|(?:hg)|[bcdef])/,
        type: TokenType.TRIPLE_STRIKE,
    },
    {
        regex: /^(hst3)((?:la)|(?:hg)|(?:ha)|[bcdef])/,
        type: TokenType.TRIPLE_STRIKE,
    },
    {
        regex: /^(l[hgt]*st3)(d)/,
        type: TokenType.TRIPLE_STRIKE,
    },
    {
        regex: /^([defgt])((?:la)|(?:lg)|(?:hg)|[bcdef])/,
        type: TokenType.DOUBLE_GRACENOTE,
    },
    {
        regex: /^([abcdefgt])g/,
        type: TokenType.GRACENOTE,
    },
];

export default Spec;
