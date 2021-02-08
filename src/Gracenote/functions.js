"use strict";
exports.__esModule = true;
function isInvalid(gracenote) {
    return gracenote.gracenote != null;
}
var invalidateIf = function (pred, gracenote) { return pred ? ({ gracenote: gracenote }) : gracenote; };
var gracenotes = new Map();
gracenotes.set('throw-d', function (note) { return invalidateIf(note !== "D" /* D */, ["G" /* G */, "D" /* D */, "C" /* C */]); });
gracenotes.set('doubling', function (note, prev) {
    var pitches = [];
    if (note === "G" /* G */ || note === "A" /* A */ || note === "B" /* B */ || note === "C" /* C */) {
        pitches = ["HG" /* HG */, note, "D" /* D */];
    }
    else if (note === "D" /* D */) {
        pitches = ["HG" /* HG */, note, "E" /* E */];
    }
    else if (note === "E" /* E */) {
        pitches = ["HG" /* HG */, note, "F" /* F */];
    }
    else if (note === "F" /* F */) {
        pitches = ["HG" /* HG */, note, "HG" /* HG */];
    }
    else if (note === "HG" /* HG */) {
        // [HA, note, HA] or [HG,F] ?
        pitches = ["HA" /* HA */, note, "HA" /* HA */];
    }
    else if (note === "HA" /* HA */) {
        pitches = ["HA" /* HA */, "HG" /* HG */];
    }
    else {
        return [];
    }
    if (prev === "HG" /* HG */ && (note !== "HA" /* HA */ && note !== "HG" /* HG */)) {
        pitches[0] = "HA" /* HA */;
    }
    else if (prev === "HA" /* HA */) {
        pitches = pitches.splice(1);
        if (note === "HG" /* HG */)
            pitches = ["HG" /* HG */, "F" /* F */];
    }
    return pitches;
});
gracenotes.set('grip', function (note) {
    if (note === "D" /* D */) {
        return ["G" /* G */, "B" /* B */, "G" /* G */];
    }
    else {
        return ["G" /* G */, "D" /* D */, "G" /* G */];
    }
});
gracenotes.set('toarluath', function (note, prev) {
    var pitches = [];
    if (prev === "D" /* D */) {
        pitches = ["G" /* G */, "B" /* B */, "G" /* G */, "E" /* E */];
    }
    else {
        pitches = ["G" /* G */, "D" /* D */, "G" /* G */, "E" /* E */];
    }
    if (note === "E" /* E */ || note === "F" /* F */ || note === "HG" /* HG */ || note === "HA" /* HA */) {
        pitches = pitches.slice(0, 3);
    }
    return pitches;
});
gracenotes.set('birl', function (note, prev) {
    return invalidateIf(note !== "A" /* A */, prev === "A" /* A */ ? ["G" /* G */, "A" /* A */, "G" /* G */] : ["A" /* A */, "G" /* G */, "A" /* A */, "G" /* G */]);
});
gracenotes.set('g-gracenote-birl', function (note, prev) {
    if (prev === "HA" /* HA */) {
        return invalidateIf(note !== "A" /* A */, ["A" /* A */, "G" /* G */, "A" /* A */, "G" /* G */]);
    }
    else if (prev === "HG" /* HG */) {
        return invalidateIf(note !== "A" /* A */, ["HA" /* HA */, "A" /* A */, "G" /* G */, "A" /* A */, "G" /* G */]);
    }
    else {
        return invalidateIf(note !== "A" /* A */, ["HG" /* HG */, "A" /* A */, "G" /* G */, "A" /* A */, "G" /* G */]);
    }
});
function numberOfNotes(gracenote, thisNote, previousNote) {
    var grace = notesOf(gracenote, thisNote, previousNote);
    if (isInvalid(grace)) {
        if (grace.gracenote.length > 0) {
            return grace.gracenote.length + 1;
        }
        else {
            return 0;
        }
    }
    else {
        if (grace.length > 0) {
            return grace.length + 1;
        }
        else {
            return 0;
        }
    }
}
function notesOf(gracenote, thisNote, previousNote) {
    if (gracenote.type === 'single') {
        return [gracenote.note];
    }
    else if (gracenote.type === 'reactive') {
        var notes = gracenotes.get(gracenote.name);
        if (notes) {
            return notes(thisNote, previousNote);
        }
        return [];
    }
    else if (gracenote.type === 'none') {
        return [];
    }
    else {
        // never
        return gracenote;
    }
}
var init = function () { return ({
    type: 'none'
}); };
var from = function (name) {
    return (name === null)
        ? ({
            type: 'single',
            note: "HG" /* HG */
        })
        : ({
            type: 'reactive',
            name: name
        });
};
exports["default"] = {
    init: init,
    from: from,
    notesOf: notesOf,
    numberOfNotes: numberOfNotes,
    isInvalid: isInvalid
};
