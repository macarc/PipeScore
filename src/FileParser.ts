export default class FileParser {
    headerRegexp: RegExp =
        /^Bagpipe Reader|^Bagpipe Music Writer Gold:\d.\d|^MIDINoteMappings|^FrequencyMappings|^InstrumentMappings|^GracenoteDurations|^FontSizes|^TuneFormat/;
    tempoRegexp: RegExp = /^TuneTempo,(\d+)/;
    definitionRegexp: RegExp = /^\"(.*)\",.+/;

    parse(data: string): void {
        let lines: string[] = data.split("\r\n");
        let match: RegExpMatchArray | null;

        lines.forEach((line: string) => {
            if (line.match(this.headerRegexp)) {
                return;
            } else if ((match = line.match(this.tempoRegexp))) {
                console.log(`Matched Tempo: ${match[1]}`);
            } else if ((match = line.match(this.definitionRegexp))) {
                console.log(`Matched Definition: ${match[1]}`);
            } else if (line === "") {
                return;
            } else {
                console.log(line);
            }
        });
    }
}
