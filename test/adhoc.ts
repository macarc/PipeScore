import Parser from "../src/Parser";
import util from "util";
import { Score } from "../types/main";

const parser: Parser = new Parser();
const score = `& sharpf sharpc 2_4 I! LA_4 B_4 ! '1 C_4 B_4 _' ! '2 C_4 D_4 _' ! 'intro HA_4 E_4 _' !I`;

try {
    const ast: Score = parser.parse(score);
    console.log("Success!");
    console.log(util.inspect(ast, false, null, true));
} catch (e) {
    console.log("There was an error.");
    console.log(e);
}
