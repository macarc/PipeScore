import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const ast: object = parser.parse(
    `& sharpf sharpc 4_4 I! gg LA_4 tar LAr_8 'la Bl_16 !I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
