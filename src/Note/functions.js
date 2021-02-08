"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var all_1 = require("../all");
var functions_1 = require("../Gracenote/functions");
var lastNoteOfGroupNote = function (groupNote) { return (groupNote.notes.length === 0) ? null : groupNote.notes[groupNote.notes.length - 1].pitch; };
function unGroupNotes(notes) {
    return all_1.flatten(notes.map(function (note) { return note.notes; }));
}
function groupNotes(groupNotes, lengthOfGroup) {
    // TODO this could probably be cleaned up further
    var pushNote = function (group, note) {
        if (hasBeam(note)) {
            group.notes.push(note);
        }
        else {
            // Push the note as its own group. This won't modify the currentLength,
            // which means that other groupings will still be correct
            if (group.notes.length > 0)
                groupedNotes.push(__assign({}, group));
            group.notes = [note];
            groupedNotes.push(__assign({}, group));
            group.notes = [];
        }
    };
    var currentGroup = initGroupNote();
    var groupedNotes = [];
    var currentLength = 0;
    groupNotes.forEach(function (groupNote) {
        if (!groupNote.triplet) {
            groupNote.notes.forEach(function (note) {
                var length = lengthToNumber(note.length);
                if (currentLength + length < lengthOfGroup) {
                    pushNote(currentGroup, note);
                    currentLength += length;
                }
                else if (currentLength + length === lengthOfGroup) {
                    pushNote(currentGroup, note);
                    // this check is needed since pushNote could end up setting currentGroup to have no notes in it
                    if (currentGroup.notes.length > 0)
                        groupedNotes.push(currentGroup);
                    currentLength = 0;
                    currentGroup = initGroupNote();
                }
                else {
                    groupedNotes.push(currentGroup);
                    currentGroup = initGroupNote();
                    pushNote(currentGroup, note);
                    currentLength = length;
                    if (currentLength >= lengthOfGroup) {
                        groupedNotes.push(currentGroup);
                        currentGroup = initGroupNote();
                        currentLength = 0;
                    }
                }
            });
        }
        else {
            groupedNotes.push(currentGroup);
            groupedNotes.push(groupNote);
            currentGroup = initGroupNote();
            currentLength = 0;
        }
    });
    // pushes the last notes to the groupedNotes
    // this also ensures that the length will never be 0, even if there are 0 notes
    groupedNotes.push(currentGroup);
    return groupedNotes;
}
// Note Length
function hasStem(note) {
    return note.length !== "sb" /* Semibreve */;
}
function hasDot(note) {
    return (["dm" /* DottedMinim */, "dc" /* DottedCrotchet */, "dq" /* DottedQuaver */, "dsq" /* DottedSemiQuaver */, "dssq" /* DottedDemiSemiQuaver */, "dhdsq" /* DottedHemiDemiSemiQuaver */].includes(note));
}
function hasBeam(note) {
    return lengthToNumber(note.length) < 1;
}
function isFilled(note) {
    return lengthToNumber(note.length) < 2;
}
function equalOrDotted(a, b) {
    if (a === b)
        return true;
    var conv;
    switch (a) {
        case "sb" /* Semibreve */:
            conv = "sb" /* Semibreve */;
            break;
        case "dm" /* DottedMinim */:
            conv = "m" /* Minim */;
            break;
        case "m" /* Minim */:
            conv = "dm" /* DottedMinim */;
            break;
        case "dc" /* DottedCrotchet */:
            conv = "c" /* Crotchet */;
            break;
        case "c" /* Crotchet */:
            conv = "dc" /* DottedCrotchet */;
            break;
        case "dq" /* DottedQuaver */:
            conv = "q" /* Quaver */;
            break;
        case "q" /* Quaver */:
            conv = "dq" /* DottedQuaver */;
            break;
        case "dsq" /* DottedSemiQuaver */:
            conv = "sq" /* SemiQuaver */;
            break;
        case "sq" /* SemiQuaver */:
            conv = "dsq" /* DottedSemiQuaver */;
            break;
        case "dssq" /* DottedDemiSemiQuaver */:
            conv = "ssq" /* DemiSemiQuaver */;
            break;
        case "ssq" /* DemiSemiQuaver */:
            conv = "dssq" /* DottedDemiSemiQuaver */;
            break;
        case "dhdsq" /* DottedHemiDemiSemiQuaver */:
            conv = "hdsq" /* HemiDemiSemiQuaver */;
            break;
        case "hdsq" /* HemiDemiSemiQuaver */:
            conv = "dhdsq" /* DottedHemiDemiSemiQuaver */;
            break;
    }
    return b === conv;
}
function lengthToNumber(length) {
    switch (length) {
        case "sb" /* Semibreve */: return 4;
        case "dm" /* DottedMinim */: return 3;
        case "m" /* Minim */: return 2;
        case "dc" /* DottedCrotchet */: return 1.5;
        case "c" /* Crotchet */: return 1;
        case "dq" /* DottedQuaver */: return 0.75;
        case "q" /* Quaver */: return 0.5;
        case "dsq" /* DottedSemiQuaver */: return 0.375;
        case "sq" /* SemiQuaver */: return 0.25;
        case "dssq" /* DottedDemiSemiQuaver */: return 0.1875;
        case "ssq" /* DemiSemiQuaver */: return 0.125;
        case "dhdsq" /* DottedHemiDemiSemiQuaver */: return 0.9375;
        case "hdsq" /* HemiDemiSemiQuaver */: return 0.0625;
    }
}
function lengthToNumTails(length) {
    switch (length) {
        case "sb" /* Semibreve */:
        case "dm" /* DottedMinim */:
        case "m" /* Minim */:
        case "dc" /* DottedCrotchet */:
        case "c" /* Crotchet */:
            return 0;
        case "dq" /* DottedQuaver */:
        case "q" /* Quaver */:
            return 1;
        case "dsq" /* DottedSemiQuaver */:
        case "sq" /* SemiQuaver */:
            return 2;
        case "dssq" /* DottedDemiSemiQuaver */:
        case "ssq" /* DemiSemiQuaver */:
            return 3;
        case "dhdsq" /* DottedHemiDemiSemiQuaver */:
        case "hdsq" /* HemiDemiSemiQuaver */:
            return 4;
    }
}
function toggleDot(length) {
    switch (length) {
        case "sb" /* Semibreve */: return "sb" /* Semibreve */;
        case "dm" /* DottedMinim */: return "m" /* Minim */;
        case "m" /* Minim */: return "dm" /* DottedMinim */;
        case "dc" /* DottedCrotchet */: return "c" /* Crotchet */;
        case "c" /* Crotchet */: return "dc" /* DottedCrotchet */;
        case "dq" /* DottedQuaver */: return "q" /* Quaver */;
        case "q" /* Quaver */: return "dq" /* DottedQuaver */;
        case "dsq" /* DottedSemiQuaver */: return "sq" /* SemiQuaver */;
        case "sq" /* SemiQuaver */: return "dsq" /* DottedSemiQuaver */;
        case "dssq" /* DottedDemiSemiQuaver */: return "ssq" /* DemiSemiQuaver */;
        case "ssq" /* DemiSemiQuaver */: return "dssq" /* DottedDemiSemiQuaver */;
        case "dhdsq" /* DottedHemiDemiSemiQuaver */: return "hdsq" /* HemiDemiSemiQuaver */;
        case "hdsq" /* HemiDemiSemiQuaver */: return "dhdsq" /* DottedHemiDemiSemiQuaver */;
    }
}
var numberOfNotes = function (note) { return note.notes.length; };
var initNote = function (pitch, length, tied) {
    if (tied === void 0) { tied = false; }
    return ({
        pitch: pitch,
        length: length,
        gracenote: functions_1["default"].init(),
        tied: tied,
        id: all_1.genId()
    });
};
var initGroupNote = function () { return ({
    notes: [],
    triplet: false
}); };
var groupNoteFrom = function (notes) { return ({
    notes: notes,
    triplet: false
}); };
var initTriplet = function (length) { return ({
    notes: [initNote("A" /* A */, length), initNote("A" /* A */, length), initNote("A" /* A */, length)],
    triplet: true
}); };
exports["default"] = {
    initNote: initNote,
    init: initGroupNote,
    initTriplet: initTriplet,
    groupNoteFrom: groupNoteFrom,
    numberOfNotes: numberOfNotes,
    unGroupNotes: unGroupNotes,
    groupNotes: groupNotes,
    lastNoteOfGroupNote: lastNoteOfGroupNote,
    lengthToNumTails: lengthToNumTails,
    hasStem: hasStem,
    hasDot: hasDot,
    hasBeam: hasBeam,
    isFilled: isFilled,
    toggleDot: toggleDot,
    equalOrDotted: equalOrDotted
};
