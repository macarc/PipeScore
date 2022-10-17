import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const ast: object = parser.parse(
    `& sharpf sharpc 4_4 I! dlg LA_4 gla B_4 tb C_4 thg HA_4 !I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
