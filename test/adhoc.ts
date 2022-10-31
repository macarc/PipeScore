import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const score = `& sharpf sharpc 2_4 I! LA_4 E_8 C_8 LA_8 ^3e !I`;
const ast: object = parser.parse(score);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
