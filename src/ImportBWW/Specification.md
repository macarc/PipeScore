# BWW File Specification

This is **not** an official specification. This is just something I've made to help myself better understand BWW files, and to help with the implementation. If you have come across files that do not conform to this, they are not necessarily wrong. Let me know and I can see if I can incorporate them into the spec.

This is largely translated from [this manual](http://bagpipe.ddg-hansa.com/Bagpipe_Reader.pdf).

## Notation

I'm using a weird BNF-type grammar. Literal text is surrounded by `'` or `"`. `a <> b` means match `a` then immediately after it match `b`. `a b` means match `a <> (%any unicode whitespace character% | 'space')* <> b`. In the body of the file (not the header), this extends to `a <> (%any unicode whitespace character% | space | header-line | time-signature)* <> b`. `[p1 p2 p3]` means match `p1`, `p2`, `p3` in any order (really, that the order was left unspecified in the manual). `(pattern ^ e1 e2)` means match `pattern` but not `e1` or `e1`.

## Header

Every BWW file starts with a header.

```
header := header-line* tune-start

header-line := software-name-and-version | midi-note-mappings | frequency-mappings | instrument-mappings | gracenote-durations | font-sizes | tune-format | tune-tempo | text
software-name-and-version := software-name ':' software-version
midi-note-mappings := 'MIDINoteMappings' comma bracketed-integer-list
frequency-mappings := 'FrequencyMappings' comma bracketed-integer-list
instrument-mappings := 'InstrumentMappings' comma bracketed-integer-list
gracenote-durations := 'GracenoteDurations' comma bracketed-integer-list
font-sizes := 'FontSizes' comma bracketed-integer-list
tune-format := 'TuneFormat' comma bracketed-identifier-list
tune-tempo := 'TuneTempo' comma integer
text := '"' any* '"' comma bracketed-identifier-list

software-name := 'Bagpipe Reader' | 'Bagpipe Music Writer Gold' | 'Bagpipe Musicworks Gold'
software-version := integer '.' integer

# clef from 'Body' section below
tune-start := clef

# Helpers

any := any character
comma := ','

bracketed-identifier-list := '(' identifier-list? ')'
identifier-list := ((identifier | integer) ',')* (identifier | integer)
identifier := ('a'..'z' | 'A'..'Z' | '0'..'9' | %any unicode whitespace character%)+

bracketed-integer-list := '(' integer-list ')'
integer-list := (integer ',')* integer
integer := ('0'..'9')+
```

## Body

s
This contains the tune.

```
score := score-line*
score-line := clef timeline-start? barline-part-start? (bar '!')* bar timeline-end? line-ending-barline
bar := timeline-end? note-and-gracenote* timeline-start?

note-and-gracenote := rest | melody-note
rest := [timeline-start? irregular-group-start?] 'REST_' <> note-length [timeline-end? irregular-group-end? old-triplet?]
# if no note flag direction is specified, the note is alone (no beams)
melody-note := [tie-start? gracenote? piob-gracenote? irregular-group-start? timeline-start?] 'fermata'? <> pitch <> note-flag-direction? <> '_' <> note-length [note-dot? tie-end? tie-old? irregular-group-end? old-triplet? timeline-end?]

# start and end of a group should match (have the same length)
irregular-group-start := '^' <> irregular-group-length <> 's'
irregular-group-end := '^' <> irregular-group-length <> 'e'
irregular-group-length := '2' | '3' | '43' | '46' | '53' | '54' | '64' | '74' | '76'

# placed after a triplet - the pitch should be the highest pitch in the triplet
old-triplet := '^3' <> (lowercase-pitch)

tie-start := '^ts'
tie-end := '^te'
# pitch should match adjacent pitches
tie-old := '^t' <> (lowercase-pitch)

note-dot := single-note-dot | double-note-dot
single-note-dot := "'"
double-note-dot := "''"
note-flag-direction := 'l' | 'r'
note-length := '1' | '2' | '4' | '8' | '16' | '32'

barline-part-start := double-barline-start | repeat-barline-start
barline-part-end := double-barline-end | repeat-barline-end
line-ending-barline := line-ending-normal-barline | barline-part-end
line-ending-normal-barline := '!t'
double-barline-start := 'I!'
repeat-barline-start := "I!''"
double-barline-end := '!I'
repeat-barline-end := "''!I"

clef := '&' accidental*
accidental := accidental-type <> lowercase-pitch
accidental-type := 'sharp' | 'natural' | 'flat'

time-signature := normal-time-signature | common-time | cut-time
normal-time-signature := integer <> '_' <> ('2' | '4' | '8' | '16')
common-time := 'C'
cut-time := 'C_'

# the latter digits indicate what other parts the timing applies to
timeline-start := "'" <> ('1' | '2' | 'intro' | 'si | 'do' | 'bis') <> integer*
timeline-end := "_'" | "bis_'"

pitch := lowercase-pitch | uppercase-pitch
lowercase-pitch := 'lg' | 'la' | 'b' | 'c' | 'd' | 'e' | 'f' | 'hg' | 'ha'
uppercase-pitch := 'LG' | 'LA' | 'B' | 'C' | 'D' | 'E' | 'F' | 'HG' | 'HA'

```

### Gracenotes

```
gracenote := single-gracenote | doubling | single-strike | complex-strike | regular-grip | complex-grip
            | taorluath | bubly | birl | throw | pele | regular-multi-strike | complex-multi-strike | double-gracenote

gracenote-pitch := 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 't'

single-gracenote := gracenote-pitch <> 'g'

doubling := normal-doubling | thumb-doubling | half-doubling
normal-doubling := 'db' <> lowercase-pitch
thumb-doubling := 'tdb' <> (lowercase-pitch ^ 'ha' 'hg')
half-doubling := 'hdb' <> (lowercase-pitch ^ 'ha' 'hg')

single-strike := 'str' <> (lowercase-pitch ^ 'ha')

complex-strike := g-gracenote-strike | thumb-gracenote-strike | half-strike
# the exceptions are light strikes on D (which have C instead of G)
g-gracenote-strike := 'gst' <> (lowercase-pitch ^ 'lg' 'ha' 'hg')  | 'lgstd'
thumb-gracenote-strike := 'tst' <> (lowercase-pitch ^ 'lg' 'ha')  | 'ltstd'
half-strike := 'hst'  <> (lowercase-pitch ^ 'lg' 'ha')  | 'lhstd'

regular-grip := 'grp' | 'hgrp' | 'grpb'

complex-grip := g-gracenote-grip | thumb-gracenote-grip | half-grip
# the exceptions are B grips on D
g-gracenote-grip := 'ggrp' <> (lowercase-pitch ^ 'lg' 'ha' 'hg')  | 'ggrpdb'
thumb-gracenote-grip := 'tgrp' <> (lowercase-pitch ^ 'lg' 'ha')  | 'tgrpdb'
half-grip := 'hgrp' <> (lowercase-pitch ^ 'lg')  | 'hgrpdb'

taorluath := 'tar' | 'tarb' | 'htar'

bubly := 'bubly' | 'hbubly'

birl := 'brl' | 'abr' | 'gbr' | 'tbr'

throw := normal-throw | heavy-throw
normal-throw := 'thrd' | 'hthrd'
# heavy throws have a G grace between C and D in the throw
heavy-throw := 'hvthrd' | 'hhvthrd'

pele := regular-pele | thumb-pele | half-pele
# the exceptions are light peles on D (which have C instead of G)
regular-pele := 'pel' <> (lowercase-pitch ^ 'lg' 'ha' 'hg')  | 'lpeld'
thumb-pele := 'tpel' <> (lowercase-pitch ^ 'lg' 'ha')  | 'ltpeld'
half-pele := 'hpel' <> (lowercase-pitch ^ 'lg')  | 'lhpeld'

# lst2d for light multi strike on D (which has C instead of G)
regular-multi-strike := strike-type <> (lowercase-pitch ^ 'lg')  | 'lst2d'

complex-multi-strike := g-gracenote-multi-strike | thumb-gracenote-multi-strike | half-multi-strike
# the exceptions are light multi strikes on D (which have C instead of G)
g-gracenote-multi-strike := 'g' <> strike-type <> (lowercase-pitch ^ 'lg' 'ha' 'hg')  | 'lg' <> strike-type <> 'd'
thumb-gracenote-multi-strike := 't' <> strike-type <> (lowercase-pitch ^ 'lg' 'ha')  | 'lt' <> strike-type <> 'd'
half-multi-strike := 'h' <> strike-type <> (lowercase-pitch ^ 'lg')  | 'lh' <> strike-type <> 'd'

# st2 for double strike, st2 for triple strike
strike-type := 'st2' | 'st3'

double-gracenote := d-double-gracenote | e-double-gracenote | f-double-gracenote | g-double-gracenote | thumb-double-gracenote
d-double-gracenote := 'd' <> (lowercase-pitch ^ 'lg' 'ha' 'hg' 'f' 'e')
e-double-gracenote := 'e' <> (lowercase-pitch ^ 'lg' 'ha' 'hg' 'f')
f-double-gracenote := 'f' <> (lowercase-pitch ^ 'lg' 'ha' 'hg')
g-double-gracenote := 'g' <> (lowercase-pitch ^ 'lg' 'ha')
thumb-double-gracenote := 't' <> (lowercase-pitch ^ 'lg')
```

### Piobaireachd

```
piob-gracenote := cadence | piob-throw | piob-complex-throw | piob-grip

cadence := (cad | fcad) <> ('a' | 'g' | 'f' | 'e' | 'd' | 'c' | 'b')

piob-throw := p? <> (d-throw | e-throw | f-throw | hg-throw | ha-throw)
# don't know the difference between tra and tra8
d-throw := tra | htra | tra8
e-throw := embari | endari
f-throw := chedari
hg-throw := hedari
ha-throw := dili

piob-complex-throw := e-complex-throw | f-complex-throw | hg-complex-throw
e-complex-throw := gedre | tedre | dre
# typo?
f-complex-throw := gdare | tdare | hedale
hg-complex-throw := tchechere | hchechere

piob-grip := grp | pgrp | deda

# todo : more piobaireachd movements

```
