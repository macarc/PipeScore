import FileParser from "./src/FileParser";

const fs = require("fs");
const readline = require("readline");

// Need to parse a BWW file.
let parser: FileParser = new FileParser();

fs.readFile(
    "./test/examples/Scotland_the_Brave.bww",
    "utf8",
    function (err: any, data: string) {
        if (err) {
            return console.log(err);
        }

        parser.parse(data);
    }
);
