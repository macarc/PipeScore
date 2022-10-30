import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const score = `& sharpf sharpc 4_4 I! LA_4 B_4 C_4 fermatd D_4 !I`;
const ast: object = parser.parse(score);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
