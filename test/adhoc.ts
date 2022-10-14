import Parser from "../src/Parser";
const util = require("util");

let parser: Parser = new Parser();
let ast: object;

ast = parser.parse(`& sharpf sharpc 4_4 I! C_4 bubly B_4 LG_4 hbubly B_4 !I`);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
