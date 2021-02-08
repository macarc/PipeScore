"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.widthOfAnacrusis = exports.xOffsetOfLastNote = exports.beatsOf = void 0;
/*
  Bar/view.ts - defines how to display a bar
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var all_1 = require("../all");
var global_1 = require("../global");
var model_1 = require("./model");
var functions_1 = require("./functions");
var functions_2 = require("../Note/functions");
var view_1 = require("../TimeSignature/view");
var functions_3 = require("../TimeSignature/functions");
var view_2 = require("../Note/view");
var beatsOf = function (bar, previousNote) { return bar.notes
    .reduce(function (nums, n, index) {
    var previous = index === 0 ? previousNote : functions_2["default"].lastNoteOfGroupNote(bar.notes[index - 1]);
    return __spreadArrays(nums, [nums[nums.length - 1] + view_2.totalBeatWidth(n, previous || null)]);
}, [1]); };
exports.beatsOf = beatsOf;
var minimumBeatWidth = 30;
function xOffsetOfLastNote(bar, width, previousBar) {
    var lastNoteIndex = functions_1["default"].lastNoteIndex(bar);
    var lastNote = functions_1["default"].lastNote(bar);
    var previousBarLastNote = previousBar ? functions_1["default"].lastNote(previousBar) : null;
    if (lastNote !== null) {
        var beats = exports.beatsOf(bar, null);
        var totalNumberOfBeats = beats[beats.length - 1];
        var beatWidth = width / totalNumberOfBeats;
        return beatWidth * beats[lastNoteIndex] + view_2.lastNoteXOffset(beatWidth, bar.notes[lastNoteIndex], (functions_1["default"].numberOfGroupNotes(bar) === 1 ? previousBarLastNote : functions_2["default"].lastNoteOfGroupNote(bar.notes[lastNoteIndex - 1])) || null);
    }
    else {
        return 0;
    }
}
exports.xOffsetOfLastNote = xOffsetOfLastNote;
function widthOfAnacrusis(anacrusis, previousNote) {
    var beats = exports.beatsOf(anacrusis, previousNote);
    var totalNumberOfBeats = Math.max(beats[beats.length - 1], 2);
    return minimumBeatWidth * totalNumberOfBeats;
}
exports.widthOfAnacrusis = widthOfAnacrusis;
function renderBarline(type, x, y) {
    var height = all_1.lineHeightOf(4);
    var lineOffset = 6;
    var circleXOffset = 10;
    var topCircleY = y + all_1.lineHeightOf(1);
    var bottomCircleY = y + all_1.lineHeightOf(3);
    var circleRadius = 2;
    var thickLineWidth = 2.5;
    if (type === model_1.Barline.Normal) {
        return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n    "], ["\n      <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n    "])), x, x, y, y + height);
    }
    else if (type === model_1.Barline.RepeatFirst) {
        return uhtml_1.svg(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<g class=\"barline-repeat-first\">\n      <rect x=", " y=", " width=", " height=", " fill=\"black\" />\n      <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n    </g>"], ["<g class=\"barline-repeat-first\">\n      <rect x=", " y=", " width=", " height=", " fill=\"black\" />\n      <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n    </g>"])), x, y, thickLineWidth, height, x + lineOffset, x + lineOffset, y, y + height, x + circleXOffset, topCircleY, circleRadius, x + circleXOffset, bottomCircleY, circleRadius);
    }
    else if (type === model_1.Barline.RepeatLast) {
        return uhtml_1.svg(templateObject_3 || (templateObject_3 = __makeTemplateObject(["<g class=\"barline-repeat-last\">\n      <rect x=", " y=", " width=", " height=", " fill=\"black\" />\n      <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n    </g>"], ["<g class=\"barline-repeat-last\">\n      <rect x=", " y=", " width=", " height=", " fill=\"black\" />\n      <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n      <circle cx=", " cy=", " r=", " fill=\"black\" />\n    </g>"])), x - thickLineWidth, y, thickLineWidth, height, x - lineOffset, x - lineOffset, y, y + height, x - circleXOffset, topCircleY, circleRadius, x - circleXOffset, bottomCircleY, circleRadius);
    }
    else {
        // never
        return type;
    }
}
function barlineWidth(barline) {
    return (barline === model_1.Barline.Normal ? 1 : 10);
}
function render(bar, props) {
    global_1.setXY(bar.id, props.x, props.x + props.width, props.y);
    var staveY = props.y;
    var hasTimeSignature = props.previousBar !== null ? !(functions_3["default"].equal(props.previousBar.timeSignature, bar.timeSignature)) : true;
    var width = props.width - (hasTimeSignature ? functions_3.timeSignatureWidth : 0) - barlineWidth(bar.frontBarline) - barlineWidth(bar.backBarline);
    var xAfterTimeSignature = props.x + (hasTimeSignature ? functions_3.timeSignatureWidth : 0);
    var xAfterBarline = xAfterTimeSignature + barlineWidth(bar.frontBarline);
    var previousWholeNote = props.previousBar ? (function () {
        var last = props.previousBar.notes[props.previousBar.notes.length - 1];
        if (functions_2["default"].numberOfNotes(last) === 0) {
            // if all the notes add up to an even number, then the final note in the bar will have 0 length
            // so in that case, return the second last note
            return props.previousBar.notes[props.previousBar.notes.length - 2];
        }
        else {
            return last;
        }
    })() : null;
    var previousNote = previousWholeNote ? functions_2["default"].lastNoteOfGroupNote(previousWholeNote) : null;
    var beats = exports.beatsOf(bar, previousNote);
    var totalNumberOfBeats = beats[beats.length - 1];
    var beatWidth = width / totalNumberOfBeats;
    var getX = function (noteIndex) { return xAfterBarline + beatWidth * beats[noteIndex]; };
    function previousNoteData(index) {
        var lastNote = (index > 0) ? functions_2["default"].lastNoteOfGroupNote(bar.notes[index - 1]) : null;
        if (index === 0) {
            if (previousNote !== null && props.lastNoteX !== null) {
                return ({
                    pitch: previousNote,
                    x: props.lastNoteX,
                    y: all_1.noteY(props.y, previousNote)
                });
            }
            else {
                return null;
            }
        }
        else if (lastNote !== null) {
            var noteBeforeThat = (index < 2) ? null : functions_2["default"].lastNoteOfGroupNote(bar.notes[index - 2]);
            var x = getX(index - 1) + view_2.lastNoteXOffset(beatWidth, bar.notes[index - 1], noteBeforeThat);
            return ({
                pitch: lastNote,
                x: x,
                y: all_1.noteY(props.y, lastNote)
            });
        }
        else {
            return null;
        }
    }
    var noteProps = function (note, index) { return ({
        x: getX(index),
        y: staveY,
        noteWidth: beatWidth,
        previousNote: previousNoteData(index),
        selectedNotes: [],
        dispatch: props.dispatch
    }); };
    // note that the noteBoxes must extend the whole width of the bar because they are used to drag notes
    return uhtml_1.svg(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n    <g class=\"bar\">\n      ", "\n      ", "\n\n      ", "\n      ", "\n      ", "\n    </g>"], ["\n    <g class=\"bar\">\n      ", "\n      ",
        "\n\n      ", "\n      ", "\n      ", "\n    </g>"])), all_1.noteBoxes(xAfterBarline, staveY, width, function (pitch) { return props.dispatch({ name: 'mouse over pitch', pitch: pitch }); }, function (pitch) { return props.dispatch({ name: 'note added', index: 0, pitch: pitch, groupNote: bar.notes[0] }); }), bar.notes.map(function (note, idx) { return uhtml_1.svg["for"](note)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["", ""], ["", ""])), view_2["default"](note, noteProps(note, idx))); }), renderBarline(bar.frontBarline, xAfterTimeSignature, props.y), ((bar.backBarline !== model_1.Barline.Normal) || props.shouldRenderLastBarline) ? renderBarline(bar.backBarline, props.x + props.width, props.y) : null, hasTimeSignature ? view_1["default"](bar.timeSignature, { x: props.x + 10, y: props.y, dispatch: props.dispatch }) : null);
}
exports["default"] = render;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
