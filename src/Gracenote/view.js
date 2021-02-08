"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
/*
  Gracenote.ts - Gracenote implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var all_1 = require("../all");
var global_1 = require("../global");
var functions_1 = require("./functions");
var tailXOffset = 3;
// actually this is half of the head width
var gracenoteHeadWidth = 3.5;
function head(x, y, note, beamY, isValid) {
    var ledgerLeft = 5;
    var ledgerRight = 5.2;
    // todo: make ledger line the correct length
    var rotateText = "rotate(-30 " + x + " " + y + ")";
    return uhtml_1.svg(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<g class=\"gracenote-head\">\n    ", "\n    <ellipse cx=", " cy=", " rx=", " ry=\"2.5\" transform=\"", "\" fill=", " pointer-events=\"none\" />\n\n    <line x1=", " y1=", " x2=", " y2=", " stroke=\"black\" />\n  </g>"], ["<g class=\"gracenote-head\">\n    ", "\n    <ellipse cx=", " cy=", " rx=", " ry=\"2.5\" transform=\"", "\" fill=", " pointer-events=\"none\" />\n\n    <line x1=", " y1=", " x2=", " y2=", " stroke=\"black\" />\n  </g>"])), note === "HA" /* HA */ ? uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"], ["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"])), x - ledgerLeft, x + ledgerRight, y, y) : null, x, y, gracenoteHeadWidth, rotateText, isValid ? "black" : "red", x + tailXOffset, y, x + tailXOffset, beamY);
}
var stemXOf = function (x) { return x + 3; };
var stemYOf = function (y) { return y - 2; };
function single(note, x, staveY, dispatch, gracenote) {
    var y = all_1.noteY(staveY, note);
    var boxWidth = 2.5 * gracenoteHeadWidth;
    var boxHeight = 6;
    return uhtml_1.svg(templateObject_5 || (templateObject_5 = __makeTemplateObject(["<g class=\"gracenote\">\n    ", "\n\n    ", "\n\n    <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n\n    ", "\n  </g>"], ["<g class=\"gracenote\">\n    ", "\n\n    ",
        "\n\n    <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n\n    ", "\n  </g>"])), head(x, y, note, y - 3 * all_1.lineGap, true), (gracenote !== null)
        ? uhtml_1.svg(templateObject_3 || (templateObject_3 = __makeTemplateObject(["<rect onmousedown=", " x=", " y=", " width=", " height=", " pointer-events=", " opacity=\"0\" />"], ["<rect onmousedown=", " x=", " y=", " width=", " height=", " pointer-events=", " opacity=\"0\" />"])), function () { return dispatch({ name: 'gracenote clicked', gracenote: gracenote }); }, x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, gracenote === global_1.draggedGracenote ? "none" : "default") : null, stemXOf(x), stemXOf(x), stemYOf(y), stemYOf(y) - 20, [0, 1, 2].map(function (n) { return uhtml_1.svg(templateObject_4 || (templateObject_4 = __makeTemplateObject(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"], ["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"])), stemXOf(x), stemXOf(x) + 5, stemYOf(y) - 20 + 3 * n, stemYOf(y) - 16 + 3 * n); }));
}
function render(gracenote, props) {
    if (gracenote.type === 'single') {
        return single(gracenote.note, props.x, props.y, props.dispatch, gracenote);
    }
    else if (gracenote.type === 'reactive') {
        // notes must be mapped to objects so that .indexOf will give
        // the right answer (so it will compare by reference
        // rather than by value)
        var grace_1 = functions_1["default"].notesOf(gracenote, props.thisNote, props.previousNote);
        var uniqueNotes_1 = functions_1["default"].isInvalid(grace_1) ? grace_1.gracenote.map(function (note) { return ({ note: note }); }) : grace_1.map(function (note) { return ({ note: note }); });
        var xOf_1 = function (noteObj) { return props.x + uniqueNotes_1.indexOf(noteObj) * props.gracenoteWidth + gracenoteHeadWidth; };
        var y_1 = function (note) { return all_1.noteY(props.y, note); };
        if (uniqueNotes_1.length === 1) {
            return single(uniqueNotes_1[0].note, xOf_1(uniqueNotes_1[0]), props.y, props.dispatch, null);
        }
        else {
            return uhtml_1.svg(templateObject_7 || (templateObject_7 = __makeTemplateObject(["<g class=\"reactive-gracenote\">\n        ", "\n        ", "\n      </g>"], ["<g class=\"reactive-gracenote\">\n        ",
                "\n        ",
                "\n      </g>"])), [0, 2, 4].map(function (i) { return uhtml_1.svg(templateObject_6 || (templateObject_6 = __makeTemplateObject(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"], ["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"])), xOf_1(uniqueNotes_1[0]) + tailXOffset, xOf_1(uniqueNotes_1[uniqueNotes_1.length - 1]) + tailXOffset, props.y - 3.5 * all_1.lineGap + i, props.y - 3.5 * all_1.lineGap + i); }), uniqueNotes_1.map(function (noteObj) { return head(xOf_1(noteObj), y_1(noteObj.note), noteObj.note, props.y - 3.5 * all_1.lineGap, !functions_1["default"].isInvalid(grace_1)); }));
        }
    }
    else if (gracenote.type === 'none') {
        return uhtml_1.svg(templateObject_8 || (templateObject_8 = __makeTemplateObject(["<g class=\"no-gracenote\"></g>"], ["<g class=\"no-gracenote\"></g>"])));
    }
    else {
        return gracenote;
    }
}
exports["default"] = render;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
