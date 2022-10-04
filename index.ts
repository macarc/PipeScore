import FileParser from "./src/FileParser";

const fs = require('fs');
const readline = require('readline');

// Need to parse a BWW file.

fs.readFile('./test/examples/Scotland_the_Brave.bww', 'utf8', function (err: any, data: any) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});


let parser: FileParser = new FileParser();

parser.parse();
