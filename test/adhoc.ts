import Parser from "../src/Parser";
import { readFile, readdir } from "fs/promises";
import { argv } from "process";
import { lstatSync } from "fs";

const parser: Parser = new Parser();

async function ls(path: string): Promise<void> {
    const directory = await readdir(path, { encoding: "utf8" });
    for await (const file of directory) {
        const fullPath = path + file;

        parseFile(fullPath);
    }
}

let total = 0;
let success = 0;
let fail = 0;

async function parseFile(path: string): Promise<void> {
    const file = await readFile(path, {
        encoding: "utf-8",
    });

    try {
        total++;
        parser.parse(file);
        success++;
        console.log("\x1b[32m", `Successfully parsed: ${path}!`);
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
        parser.parse(file);
        console.log("\x1b[32m", `Successfully parsed: ${path}!`);
    } catch (e) {
        console.log(`Error parsing: ${path}`);
        console.log("\x1b[31m", e);
    }
}

if (argv.length < 3) {
    console.log("Please specify the directory or path you would like to parse");
} else if (lstatSync(argv[2]).isFile()) {
    console.log("Check specific file");
    parseFileWithDetails(argv[2]).catch(console.error);
} else if (lstatSync(argv[2]).isDirectory()) {
    ls(argv[2]).catch(console.error);
}
