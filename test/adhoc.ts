import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const ast: object = parser.parse(
    `& sharpf sharpc 4_4 E_8 ! gg LA_4 tar LAr_8 'la Bl_16 dbc Cr_8 eg LAl_8 dbc Cr_8 El_8 !I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
