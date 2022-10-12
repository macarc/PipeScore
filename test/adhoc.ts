import Parser from "../src/Parser";
const util = require("util");

let parser: Parser = new Parser();

let ast: object = parser.parse(
    `& sharpf sharpc 4_4 I! dbla LA_4 hdbb B_4 tdbc C_4 dbd D_4 lgstd D_4 !I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
