"use strict";
exports.__esModule = true;
/*
  Bar/functions.ts - Defines functions that transform Bars
  Copyright (C) 2020 Archie Maclean
*/
var all_1 = require("../all");
var model_1 = require("./model");
var functions_1 = require("../Note/functions");
var functions_2 = require("../TimeSignature/functions");
var groupNotes = function (bar) { return bar.notes; };
function lastNoteIndex(bar) {
    var index = bar.notes.length - 1;
    if (functions_1["default"].numberOfNotes(bar.notes[bar.notes.length - 1]) === 0)
        index = bar.notes.length - 2;
    return index;
}
function lastNote(bar) {
    var lastGroupNote = bar.notes[lastNoteIndex(bar)] || null;
    if (lastGroupNote !== null) {
        return functions_1["default"].lastNoteOfGroupNote(lastGroupNote);
    }
    else {
        return null;
    }
}
function numberOfGroupNotes(bar) {
    return lastNoteIndex(bar) + 1;
}
var init = function (isAnacrusis) {
    if (isAnacrusis === void 0) { isAnacrusis = false; }
    return ({
        timeSignature: functions_2["default"].init(),
        notes: [functions_1["default"].init(), functions_1["default"].init()],
        frontBarline: model_1.Barline.Normal,
        backBarline: model_1.Barline.Normal,
        isAnacrusis: isAnacrusis,
        id: all_1.genId()
    });
};
exports["default"] = {
    init: init,
    groupNotes: groupNotes,
    numberOfGroupNotes: numberOfGroupNotes,
    lastNote: lastNote,
    lastNoteIndex: lastNoteIndex
};
