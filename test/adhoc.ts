import Parser from "../src/Parser";
const util = require("util");

let parser: Parser = new Parser();
let ast: object;

ast = parser.parse(
    `& sharpf sharpc 4_4 I! E_4 pella LA_4 lpeld D_4 tpeld D_4 ltpeld D_4 hpeld D_4 lhpeld D_4 !I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
