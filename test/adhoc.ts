import Parser from "../src/Parser";
import util from "util";
import { Score } from "../types/main";

const parser: Parser = new Parser();
const score = `& sharpf sharpc 2_4 I! LA_4 E_8 C_8 LA_8 ^3e !I`;

try {
    const ast: Score = parser.parse(score);
    console.log("Success!");
} catch (e) {
    console.log("There was an error.");
    console.log(e);
}
