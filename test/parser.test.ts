import Parser from "../src/Parser";

describe("correctly parses file header", () => {
    let parser = new Parser();

    test("parses tempo with multiple header lines", () => {
        expect(parser.parse(`Bagpipe Music Writer Gold:1.0\r\n`)).toStrictEqual(
            {
                name: "",
                staves: [],
            }
        );
    });
});
