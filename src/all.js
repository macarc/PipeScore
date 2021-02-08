"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
exports.noteBoxes = exports.flatten = exports.deepcopy = exports.genId = exports.removeNull = exports.noteY = exports.noteOffset = exports.pitchToHeight = exports.lineHeightOf = exports.lineGap = exports.unlog2 = exports.unlogf = exports.unlog = exports.staveGap = exports.scoreHeight = exports.scoreWidth = exports.logf = exports.log2 = exports.log = void 0;
/*
  all.ts - general helper functions and global types for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var log = function (a) {
    console.log(a);
    return a;
};
exports.log = log;
var log2 = function (a, b) {
    console.log(a);
    return b;
};
exports.log2 = log2;
var logf = function (a) {
    console.log(a());
    return a;
};
exports.logf = logf;
exports.scoreWidth = 210 * 5;
exports.scoreHeight = 297 * 5;
exports.staveGap = 100;
var unlog = function (a) { return a; };
exports.unlog = unlog;
var unlogf = function (a) { return a; };
exports.unlogf = unlogf;
var unlog2 = function (a, b) { return b; };
exports.unlog2 = unlog2;
exports.lineGap = 7;
var lineHeightOf = function (n) { return n * exports.lineGap; };
exports.lineHeightOf = lineHeightOf;
function pitchToHeight(pitch) {
    switch (pitch) {
        case "HA" /* HA */: return -1;
        case "HG" /* HG */: return -0.5;
        case "F" /* F */: return 0;
        case "E" /* E */: return 0.5;
        case "D" /* D */: return 1;
        case "C" /* C */: return 1.5;
        case "B" /* B */: return 2;
        case "A" /* A */: return 2.5;
        case "G" /* G */: return 3;
    }
}
exports.pitchToHeight = pitchToHeight;
// Return the difference from the top of the stave
// to the note
var noteOffset = function (note) { return exports.lineHeightOf(pitchToHeight(note)); };
exports.noteOffset = noteOffset;
// return the y value of given note
var noteY = function (staveY, note) { return staveY + exports.noteOffset(note); };
exports.noteY = noteY;
function removeNull(a) {
    return a !== null;
}
exports.removeNull = removeNull;
var genId = function () { return Math.floor(Math.random() * 100000000); };
exports.genId = genId;
function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.deepcopy = deepcopy;
function flatten(array) {
    var _a;
    return (_a = []).concat.apply(_a, array);
}
exports.flatten = flatten;
function noteBoxes(x, y, width, mouseOver, mouseDown) {
    if (mouseOver === void 0) { mouseOver = function () { return null; }; }
    if (mouseDown === void 0) { mouseDown = function () { return null; }; }
    // Invisible rectangles that are used to detect note dragging
    var height = exports.lineGap / 2;
    var pitches = ["G" /* G */, "A" /* A */, "B" /* B */, "C" /* C */, "D" /* D */, "E" /* E */, "F" /* F */, "HG" /* HG */, "HA" /* HA */];
    return uhtml_1.svg(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<g class=\"drag-boxes\">\n    <rect x=", " y=", " width=", " height=", " onmouseover=", " onmousedown=", " opacity=\"0\" />\n    <rect x=", " y=", " width=", " height=", " onmouseover=", " onmousedown=", " opacity=\"0\" />\n\n    ", "\n  </g>"], ["<g class=\"drag-boxes\">\n    <rect x=", " y=", " width=", " height=", " onmouseover=", " onmousedown=", " opacity=\"0\" />\n    <rect x=", " y=", " width=", " height=", " onmouseover=", " onmousedown=", " opacity=\"0\" />\n\n    ",
        "\n  </g>"])), x, y - 4 * exports.lineGap, width, exports.lineGap * 4, function () { return mouseOver("HA" /* HA */); }, function () { return mouseDown("HA" /* HA */); }, x, y + 3 * exports.lineGap, width, exports.lineGap * 4, function () { return mouseOver("G" /* G */); }, function () { return mouseDown("G" /* G */); }, pitches.map(function (n) { return [n, pitchToHeight(n)]; }).map(function (_a) {
        var note = _a[0], boxY = _a[1];
        return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<rect\n        x=", "\n        y=", "\n        width=", "\n        height=", "\n        onmouseover=", "\n        onmousedown=", "\n        opacity=\"0\"\n        />"], ["<rect\n        x=", "\n        y=", "\n        width=", "\n        height=", "\n        onmouseover=", "\n        onmousedown=", "\n        opacity=\"0\"\n        />"])), x, y + exports.lineGap * boxY - exports.lineGap / 2, width, height, function () { return mouseOver(note); }, function () { return mouseDown(note); });
    }));
}
exports.noteBoxes = noteBoxes;
var templateObject_1, templateObject_2;
