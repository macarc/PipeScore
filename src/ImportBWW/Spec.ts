import { TokenType } from './token';

type SpecType = {
  regex: RegExp;
  type: TokenType;
};

export const Spec: SpecType[] = [
  {
    regex:
      /^(Bagpipe Reader|Bagpipe Music Writer Gold|Bagpipe Musicworks Gold):(\d\.\d)/,
    type: TokenType.SOFTWARE_NAME_AND_VERSION,
  },
  {
    regex: /^MIDINoteMappings,\((\d{0,2},?){27}\)/,
    type: TokenType.MIDI_NOTE_MAPPINGS,
  },
  {
    regex: /^FrequencyMappings,\((\d{3},?){27}\)/,
    type: TokenType.FREQUENCY_MAPPINGS,
  },
  {
    regex: /^InstrumentMappings,\((\d{1,4},?){7}\)/,
    type: TokenType.INSTRUMENT_MAPPINGS,
  },
  {
    regex: /^GracenoteDurations,\((\d{1,3},?){14}\)/,
    type: TokenType.GRACENOTE_DURATIONS,
  },
  {
    regex: /^FontSizes,\((\d{1,3},?){5}\)/,
    type: TokenType.FONT_SIZES,
  },
  {
    regex:
      /^TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{2,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)/,
    type: TokenType.TUNE_FORMAT,
  },
  {
    regex: /^TuneTempo,(\d*)/,
    type: TokenType.TUNE_TEMPO,
  },
  {
    regex:
      /^"([^"]*)",\((\w),(\w),\d{1,2},\d{1,2},[^,]*,\d{1,2},\d{1,3},\d{1,3},\d,\d{1,2},\d,\d,\d\)/,
    type: TokenType.TEXT_TAG,
  },
  {
    regex: /^"(.*?)"/,
    type: TokenType.TEXT_TAG,
  },
  {
    regex: /^&(?=\s)/,
    type: TokenType.CLEF,
  },
  {
    regex: /^I!('')?(?=\s)/,
    type: TokenType.PART_BEGINNING,
  },
  {
    regex: /^('')?!I(?=\s)/,
    type: TokenType.PART_END,
  },
  {
    regex: /^!t(?=\s)/,
    type: TokenType.TERMINATING_BAR_LINE,
  },
  {
    regex: /^!(?=\s)/,
    type: TokenType.BAR_LINE,
  },
  {
    regex: /^(?:(sharp|natural|flat)(lg|la|b|c|d|e|f|g|a))(?=\s)/,
    type: TokenType.ACCIDENTAL,
  },
  {
    regex: /^(?:fermat)(lg|la|b|c|d|e|f|hg|ha)(?=\s)/,
    type: TokenType.FERMATA,
  },
  {
    regex: /^((?:LG)|(?:LA)|(?:[BCDEF])|(?:HG)|(?:HA))([lr])?_(\d{1,2})(?=\s)/,
    type: TokenType.MELODY_NOTE,
  },
  {
    regex: /^(?:(\d{1,2})_(\d{1,2}))|^(C_)|^(C)(?=\s)/,
    type: TokenType.TIME_SIGNATURE,
  },
  {
    regex: /^REST_(\d{1,2})(?=\s)/,
    type: TokenType.REST,
  },
  {
    regex: /^('{1,2})((?:lg)|(?:la)|[bcdef]|(?:hg)|(?:ha))(?=\s)/,
    type: TokenType.DOTTED_NOTE,
  },
  {
    regex: /^([th]?db)((?:[lh][ga])|([bcdef]))(?=\s)/,
    type: TokenType.DOUBLING,
  },
  {
    regex:
      /^(?:((?:lh)|(?:lt)|(?:lg)|[gth]?)str?)((?:lg)|(?:la)|(?:hg)|(?:ha)|[bcdef])(?=\s)/,
    type: TokenType.STRIKE,
  },
  {
    regex: /^((?:htar)|(?:tarb?))(?=\s)/,
    type: TokenType.TAORLUATH,
  },
  {
    regex: /^(h?bubly)(?=\s)/,
    type: TokenType.BUBBLY,
  },
  {
    regex: /^((?:hgrp)|(?:grpb)|(?:grp))(?=\s)/,
    type: TokenType.REGULAR_GRIP,
  },
  {
    regex: /^((?:[hgt])?grp?(?:db)*)((?:la)|(?:hg)|(?:ha)|[bcdef])*(?=\s)/,
    type: TokenType.COMPLEX_GRIP,
  },
  {
    regex: /^[gtp]?(edre|dare|chechere|dale)(?:(?:lg)|(?:la)|[bcdef])?/,
    type: TokenType.EDRE,
  },
  {
    regex: /^^((?:brl)|(?:[agt]br))(?=\s)/,
    type: TokenType.BIRL,
  },
  {
    regex: /^((?:thrd)|(?:hvthrd)|(?:hthrd)|(?:hhvthrd))(?=\s)/,
    type: TokenType.THROW,
  },
  {
    regex: /^(pel)((?:la)|[bcdef])(?=\s)/,
    type: TokenType.PELE,
  },
  {
    regex: /^([th]pel)((?:la)|(?:hg)|[bcdef])(?=\s)/,
    type: TokenType.PELE,
  },
  {
    regex: /^(l[th]*pel)(d)(?=\s)/,
    type: TokenType.PELE,
  },
  {
    regex: /^(st2)((?:ha)|(?:hg)|(?:la)|[bcdef])(?=\s)/,
    type: TokenType.DOUBLE_STRIKE,
  },
  {
    regex: /^(gst2)((?:la)|[bcdef])(?=\s)/,
    type: TokenType.DOUBLE_STRIKE,
  },
  {
    regex: /^(tst2)((?:la)|(?:hg)|[bcdef])(?=\s)/,
    type: TokenType.DOUBLE_STRIKE,
  },
  {
    regex: /^(hst2)((?:la)|(?:hg)|(?:ha)|[bcdef])(?=\s)/,
    type: TokenType.DOUBLE_STRIKE,
  },
  {
    regex: /^(l[hgt]*st2)(d)(?=\s)/,
    type: TokenType.DOUBLE_STRIKE,
  },
  {
    regex: /^(st3)((?:ha)|(?:hg)|(?:la)|[bcdef])(?=\s)/,
    type: TokenType.TRIPLE_STRIKE,
  },
  {
    regex: /^(gst3)((?:la)|[bcdef])(?=\s)/,
    type: TokenType.TRIPLE_STRIKE,
  },
  {
    regex: /^(tst3)((?:la)|(?:hg)|[bcdef])(?=\s)/,
    type: TokenType.TRIPLE_STRIKE,
  },
  {
    regex: /^(hst3)((?:la)|(?:hg)|(?:ha)|[bcdef])(?=\s)/,
    type: TokenType.TRIPLE_STRIKE,
  },
  {
    regex: /^(l[hgt]*st3)(d)(?=\s)/,
    type: TokenType.TRIPLE_STRIKE,
  },
  {
    regex: /^([defgt])((?:la)|(?:lg)|(?:hg)|[bcdef])(?=\s)/,
    type: TokenType.DOUBLE_GRACENOTE,
  },
  {
    regex: /^([abcdefgt])g(?=\s)/,
    type: TokenType.GRACENOTE,
  },
  // These have to be the same token since ^te could either be
  // the end of the new tie format, or a tie on E on the old tie format
  {
    regex: /^\^t((?:lg)|(?:la)|(?:hg)|(?:ha)|[bcdef])(?=\s)/,
    type: TokenType.TIE_END_OR_TIE_OLD_FORMAT,
  },
  {
    regex: /^\^ts(?=\s)/,
    type: TokenType.TIE_START,
  },
  {
    regex: /^\^3((?:lg)|(?:la)|(?:hg)|(?:ha)|[bcdef])(?=\s)/,
    type: TokenType.TRIPLET_OLD_FORMAT,
  },
  {
    regex: /^\^(3)s(?=\s)/,
    type: TokenType.TRIPLET_NEW_FORMAT,
  },
  {
    regex:
      /^\^((?:[2])|(?:43)|(?:46)|(?:53)|(?:54)|(?:64)|(?:74)|(?:76))s(?=\s)/,
    type: TokenType.IRREGULAR_GROUP_START,
  },
  {
    regex:
      /^\^((?:[2])|(?:43)|(?:46)|(?:53)|(?:54)|(?:64)|(?:74)|(?:76))e(?=\s)/,
    type: TokenType.IRREGULAR_GROUP_END,
  },
  {
    regex: /^'(?:([12])(\d*)|(intro|si|do|bis))(?=\s)/,
    type: TokenType.TIME_LINE_START,
  },
  {
    regex: /^_'(?=\s)/,
    type: TokenType.TIME_LINE_END,
  },
  {
    regex: /^space/,
    type: TokenType.SPACE,
  },
];
