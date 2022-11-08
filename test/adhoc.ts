import Parser from "../src/Parser";
import { readFile, readdir } from "fs/promises";
import { argv } from "process";
import { lstatSync } from "fs";
import { Score } from "../types";
import util from "util";

let total = 0;
let success = 0;
let fail = 0;
const parser: Parser = new Parser();

async function ls(path: string): Promise<void> {
    const directory = await readdir(path, { encoding: "utf8" });
    for await (const file of directory) {
        const fullPath = path + file;

        try {
            parseFile(fullPath);
        } catch (e) {
            console.error(e);
        }
    }
}

async function parseFile(path: string): Promise<void> {
    const file = await readFile(path, {
        encoding: "utf-8",
    });

    try {
        total++;
        parser.parse(file);
        console.log("\x1b[32m", `Successfully parsed: ${path}`);
        success++;
    } catch (e) {
        fail++;
        console.log("\x1b[31m", `Error parsing: ${path}`);
    } finally {
        console.log(
            "\x1b[37m",
            `Total: ${total}, Success: ${success}, Failed: ${fail}`
        );
    }
}

async function parseFileWithDetails(path: string): Promise<void> {
    const file = await readFile(path, {
        encoding: "utf-8",
    });

    try {
        const ast: Score = parser.parse(file);
        console.log("\x1b[32m", `Successfully parsed: ${path}`);
        console.log(util.inspect(ast, false, null, true));
    } catch (e) {
        console.log("\x1b[31m", `Error parsing: ${path}`);
        console.log("\x1b[31m", e);
    }
}

async function parseStringWithDetails(tune: string): Promise<void> {
    try {
        const ast: Score = parser.parse(tune);
        console.log("\x1b[32m", `Successfully parsed tune.`);
        console.log(util.inspect(ast, false, null, false));
    } catch (e) {
        console.log("\x1b[31m", `Error parsing tune`);
        console.log("\x1b[31m", e);
    }
}

if (argv.length < 3) {
    console.log("Please specify the directory or path you would like to parse");
} else if (argv[2] === "-s") {
    console.log("Parse string");
    parseStringWithDetails(argv[3]);
} else if (lstatSync(argv[2]).isFile()) {
    console.log("Check specific file");
    parseFileWithDetails(argv[2]).catch(console.error);
} else if (lstatSync(argv[2]).isDirectory()) {
    ls(argv[2]).catch(console.error);
}
