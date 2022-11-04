import Parser from "../src/Parser";
import util from "util";
import { Score } from "../types/main";

const parser: Parser = new Parser();
const score = `& sharpf sharpc 6_8
                I!
                ^2s E_8 C_8 ^2e
                ^43s LA_8 B_8 C_8 D_8 ^43e
                ^46s LA_8 B_8 C_8 D_8 ^46e
                ^53s LA_8 B_8 C_8 D_8 E_8 ^53e
                ^54s LA_8 B_8 C_8 D_8 E_8 ^54e
                !
                ^64s LA_8 B_8 C_8 D_8 E_8 F_8 ^64e
                ^74s LA_8 B_8 C_8 D_8 E_8 F_8 HG_8 ^74e
                ^74s LA_8 B_8 C_8 D_8 E_8 F_8 HG_8 ^74e
                !I`;

try {
    const ast: Score = parser.parse(score);
    console.log("Success!");
    console.log(util.inspect(ast, false, null, true));
} catch (e) {
    console.log("There was an error.");
    console.log(e);
}
