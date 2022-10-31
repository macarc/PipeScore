import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const score = `& sharpf sharpc 4_4 I! ^ts LA_4 LA_4 ^te B_4 ^ts C_4 ! C_4 ^te ^ts D_2 D_4 ^te !I`;
const ast: object = parser.parse(score);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
