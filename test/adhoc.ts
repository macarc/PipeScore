import Parser from "../src/Parser";
const util = require("util");

let parser: Parser = new Parser();
let ast: object;

ast = parser.parse(
    `& sharpf sharpc 4_4 I! LA_4 st2la LA_4 lst2d D_4 gst2d D_4 lgst2d D_4 tst2d D_4 ltst2d D_4 hst2d D_4 lhst2d D_4 !I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
