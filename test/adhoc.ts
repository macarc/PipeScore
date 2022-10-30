import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const score = `& sharpf sharpc 4_4 I! LA_4 sharpb B_4 flatc C_4 naturald D_4 !I`;
const ast: object = parser.parse(score);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
