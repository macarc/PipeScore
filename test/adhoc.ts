import Parser from "../src/Parser";
const util = require("util");

let parser: Parser = new Parser();
let ast: object;

ast = parser.parse(
    `& sharpf sharpc 4_4 I! dlg LA_4 gla B_4 tb C_4 thg HA_4 !I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
