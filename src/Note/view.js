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
exports.lastNoteXOffset = exports.totalBeatWidth = void 0;
/*
  Note.ts - Note implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var all_1 = require("../all");
var global_1 = require("../global");
var functions_1 = require("./functions");
var functions_2 = require("../Gracenote/functions");
var view_1 = require("../Gracenote/view");
var gracenoteToNoteWidthRatio = 0.6;
var tailGap = 5;
var shortTailLength = 10;
// note that this is actually *half* the width
var noteHeadWidth = 5;
var noteAndGracenoteWidth = function (notes, prevNote) {
    return notes.map(function (n, i) { return 1 + (n.tied ? 0 :
        (gracenoteToNoteWidthRatio * functions_2["default"].numberOfNotes(n.gracenote, n.pitch, i === 0 ? prevNote : notes[i - 1].pitch))); }).reduce(function (a, b) { return a + b; }, 0);
};
var totalBeatWidth = function (note, previousPitch) { return noteAndGracenoteWidth(note.notes, previousPitch); };
exports.totalBeatWidth = totalBeatWidth;
var lastNoteXOffset = function (beatWidth, note, previousPitch) { return beatWidth * noteAndGracenoteWidth(note.notes.slice().splice(0, note.notes.length), previousPitch) - beatWidth; };
exports.lastNoteXOffset = lastNoteXOffset;
function beamFrom(x1, y1, x2, y2, tails1, tails2) {
    // draw beams from note1 at x1,y1 with tails1 to note2 x2,y2 with tails2
    var leftIs1 = x1 < x2;
    var leftTails = leftIs1 ? tails1 : tails2;
    var rightTails = leftIs1 ? tails2 : tails1;
    var xL = leftIs1 ? x1 : x2;
    var xR = leftIs1 ? x2 : x1;
    var yL = leftIs1 ? y1 : y2;
    var yR = leftIs1 ? y2 : y1;
    var diffIsL = leftTails > rightTails;
    // tails shared by both notes
    var sharedTails = diffIsL ? __spreadArrays(Array(rightTails).keys()) : __spreadArrays(Array(leftTails).keys());
    // tails extra tails for one note
    var diffTails = diffIsL ? __spreadArrays(Array(leftTails).keys()).splice(rightTails) : __spreadArrays(Array(rightTails).keys()).splice(leftTails);
    var tailEndY = diffIsL
        // because similar triangles
        ? yL + shortTailLength / (xR - xL) * (yR - yL)
        : yR - shortTailLength / (xR - xL) * (yR - yL);
    return uhtml_1.svg(templateObject_3 || (templateObject_3 = __makeTemplateObject(["<g class=\"tails\">\n    ", "\n    ", "\n\t</g>"], ["<g class=\"tails\">\n    ",
        "\n    ",
        "\n\t</g>"])), sharedTails.map(function (i) {
        return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<line\n      x1=", "\n      x2=", "\n      y1=", "\n      y2=", "\n      stroke=\"black\"\n      stroke-width=\"2\" />"], ["<line\n      x1=", "\n      x2=", "\n      y1=", "\n      y2=", "\n      stroke=\"black\"\n      stroke-width=\"2\" />"])), xL, xR, yL - i * tailGap, yR - i * tailGap);
    }), diffTails.map(function (i) {
        return uhtml_1.svg(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<line\n      x1=", "\n      x2=", "\n      y1=", "\n      y2=", "\n      stroke=\"black\"\n      stroke-width=\"2\" />"], ["<line\n      x1=", "\n      x2=", "\n      y1=", "\n      y2=", "\n      stroke=\"black\"\n      stroke-width=\"2\" />"])), diffIsL ? xL : xR, diffIsL ? xL + shortTailLength : xR - shortTailLength, (diffIsL ? yL : yR) - i * tailGap, tailEndY - i * tailGap);
    }));
}
function noteHead(x, y, note, mousedown, opacity) {
    if (opacity === void 0) { opacity = 1; }
    // Draw note head, ledger line and dot
    var noteWidth = 5;
    var noteHeight = 4;
    var rotation = 30;
    var clickableWidth = 14;
    var clickableHeight = 12;
    var dotted = functions_1["default"].hasDot(note.length);
    var dotYOffset = (["G" /* G */, "B" /* B */, "D" /* D */, "F" /* F */, "HA" /* HA */].includes(note.pitch)) ? -3 : 0;
    var dotXOffset = 10;
    var dragged = note === global_1.draggedNote; //todo isBeingDragged(note);
    var selected = false; //todo isSelected(note);
    // pointer events must be set so that if it is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)
    var pointerEvents = dragged ? 'none' : 'visiblePainted';
    var filled = functions_1["default"].isFilled(note);
    var rotateText = "rotate(" + rotation + " " + Math.round(x) + " " + Math.round(y) + ")";
    var colour = selected ? "orange" : "black";
    return uhtml_1.svg(templateObject_6 || (templateObject_6 = __makeTemplateObject(["<g class=\"note-head\">\n      <ellipse cx=", " cy=", " rx=", " ry=", " stroke=", " fill=", " transform=", " pointer-events=", " opacity=", " />\n\n      ", "\n\n      ", "\n\n\n      <rect x=", " y=", " width=", " height=", " onmousedown=", " pointer-events=", " opacity=\"0\"/>\n    </g>"], ["<g class=\"note-head\">\n      <ellipse cx=", " cy=", " rx=", " ry=", " stroke=", " fill=", " transform=", " pointer-events=", " opacity=", " />\n\n      ", "\n\n      ", "\n\n\n      <rect x=", " y=", " width=", " height=", " onmousedown=", " pointer-events=", " opacity=\"0\"/>\n    </g>"])), x, y, noteWidth, noteHeight, colour, filled ? colour : "white", rotateText, pointerEvents, opacity, dotted ? uhtml_1.svg(templateObject_4 || (templateObject_4 = __makeTemplateObject(["<circle cx=", " cy=", " r=\"1.5\" fill=", " pointer-events=\"none\" opacity=", " />"], ["<circle cx=", " cy=", " r=\"1.5\" fill=", " pointer-events=\"none\" opacity=", " />"])), x + dotXOffset, y + dotYOffset, colour, opacity) : null, (note.pitch === "HA" /* HA */) ? uhtml_1.svg(templateObject_5 || (templateObject_5 = __makeTemplateObject(["<line class=\"ledger\" x1=", " x2=", " y1=", " y2=", " stroke=", " pointer-events=\"none\" opacity=", " />"], ["<line class=\"ledger\" x1=", " x2=", " y1=", " y2=", " stroke=", " pointer-events=\"none\" opacity=", " />"])), x - 8, x + 8, y, y, colour, opacity) : null, x - clickableWidth / 2, y - clickableHeight / 2, clickableWidth, clickableHeight, mousedown, pointerEvents);
}
function tie(staveY, pitch, x, previousNote) {
    var tieOffsetY = 10;
    var tieHeight = 15;
    var tieWidth = 8;
    var y = all_1.noteY(staveY, pitch);
    var x0 = x - 1;
    var y0 = y - tieOffsetY;
    var x1 = previousNote.x + 1;
    var y1 = previousNote.y - tieOffsetY;
    var midx = previousNote.x + (x - previousNote.x) / 2.0;
    var midy = y0 + (y1 - y0) / 2.0;
    var midloy = midy - tieHeight;
    var midhiy = midy - tieHeight - tieWidth;
    var path = "\nM " + x0 + "," + y0 + " S " + midx + "," + midhiy + ", " + x1 + "," + y1 + "\nM " + x1 + "," + y1 + " S " + midx + "," + midloy + ", " + x0 + "," + y0 + "\n    ";
    return uhtml_1.svg(templateObject_7 || (templateObject_7 = __makeTemplateObject(["<path d=", " stroke=\"black\" />"], ["<path d=", " stroke=\"black\" />"])), path);
}
function triplet(staveY, x1, x2, y1, y2) {
    var midx = x1 + (x2 - x1) / 2;
    var height = 40;
    var midy = staveY - height;
    var gap = 15;
    var path = "\nM " + x1 + "," + (y1 - gap) + " Q " + midx + "," + midy + "," + x2 + "," + (y2 - gap) + "\n";
    return uhtml_1.svg(templateObject_8 || (templateObject_8 = __makeTemplateObject(["<g class=\"triplet\">\n    <text x=", " y=", " text-anchor=\"centre\">3</text>\n    <path d=", " stroke=\"black\" fill=\"none\" />\n  </g>"], ["<g class=\"triplet\">\n    <text x=", " y=", " text-anchor=\"centre\">3</text>\n    <path d=", " stroke=\"black\" fill=\"none\" />\n  </g>"])), midx, midy + 10, path);
}
var shouldTie = function (note, previous) { return note.tied && (previous || false) && previous.pitch === note.pitch; };
function singleton(note, x, y, gracenoteProps, previousNote, drawNoteBoxes, dispatch) {
    // todo this is complected with stemXOf in `render`
    var stemX = x - noteHeadWidth;
    var stemY = all_1.noteY(y, note.pitch) + 30;
    var numberOfTails = functions_1["default"].lengthToNumTails(note.length);
    return uhtml_1.svg(templateObject_12 || (templateObject_12 = __makeTemplateObject(["<g class=\"singleton\">\n    ", "\n    ", "\n\n    ", "\n    ", "\n    ", "\n\n    ", "\n  </g>"], ["<g class=\"singleton\">\n    ", "\n    ", "\n\n    ", "\n    ",
        "\n    ",
        "\n\n    ", "\n  </g>"])), shouldTie(note, previousNote) ? tie(y, note.pitch, x, previousNote) : null, shouldTie(note, previousNote) ? null : view_1["default"](note.gracenote, gracenoteProps), noteHead(x, all_1.noteY(y, note.pitch), note, function (event) { return dispatch({ name: 'note clicked', note: note, event: event }); }), functions_1["default"].hasStem(note) ? uhtml_1.svg(templateObject_9 || (templateObject_9 = __makeTemplateObject(["<line\n      x1=", "\n      x2=", "\n      y1=", "\n      y2=", "\n      stroke=\"black\"\n      />"], ["<line\n      x1=", "\n      x2=", "\n      y1=", "\n      y2=", "\n      stroke=\"black\"\n      />"])), stemX, stemX, all_1.noteY(y, note.pitch), stemY) : null, numberOfTails > 0 ? uhtml_1.svg(templateObject_11 || (templateObject_11 = __makeTemplateObject(["<g class=\"tails\">\n      ", "\n    </g>"], ["<g class=\"tails\">\n      ", "\n    </g>"])), __spreadArrays(Array(numberOfTails).keys()).map(function (t) { return uhtml_1.svg(templateObject_10 || (templateObject_10 = __makeTemplateObject(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" stroke-width=\"2\" />"], ["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" stroke-width=\"2\" />"])), stemX, stemX + 10, stemY - 5 * t, stemY - 5 * t - 10); })) : null, drawNoteBoxes());
}
function render(groupNote, props) {
    var previousPitch = props.previousNote && props.previousNote.pitch;
    var canAddNotes = !groupNote.triplet;
    if (groupNote.notes.length === 0) {
        return uhtml_1.svg(templateObject_13 || (templateObject_13 = __makeTemplateObject(["<g></g>"], ["<g></g>"])));
    }
    else {
        // relativeIndex takes a note and returns not the actual index, but the index including
        // gracenoteToNoteWidthRatio * all the gracenotes up to it
        // useful for x calculations
        var relativeIndexOfGracenote_1 = function (index) { return noteAndGracenoteWidth(groupNote.notes.slice().splice(0, index), previousPitch); };
        var relativeIndexOf_1 = function (note, index) { return relativeIndexOfGracenote_1(index) + (note.tied ? 0 : gracenoteToNoteWidthRatio * (functions_2["default"].numberOfNotes(note.gracenote, note.pitch, index === 0 ? previousPitch : groupNote.notes[index - 1].pitch))); };
        var xOf_1 = function (noteIndex) { return props.x + relativeIndexOf_1(groupNote.notes[noteIndex], noteIndex) * props.noteWidth; };
        var yOf_1 = function (note) { return all_1.noteY(props.y, note.pitch); };
        var stemXOf_1 = function (index) { return xOf_1(index) - noteHeadWidth; };
        var firstNote = groupNote.notes[0];
        var lastNote = groupNote.notes[groupNote.notes.length - 1];
        var gracenoteX_1 = function (index) { return props.x + props.noteWidth * relativeIndexOfGracenote_1(index); };
        var setNoteXY_1 = function (note, index) { return global_1.setXY(note.id, gracenoteX_1(index) - noteHeadWidth, xOf_1(index) + noteHeadWidth, props.y); };
        if (functions_1["default"].numberOfNotes(groupNote) === 1) {
            setNoteXY_1(firstNote, 0);
            var gracenoteProps = ({
                // can just be props.x since it is the first note
                x: props.x,
                y: props.y,
                gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
                thisNote: firstNote.pitch,
                previousNote: previousPitch,
                dispatch: props.dispatch
            });
            var nb = canAddNotes ? function () { return all_1.noteBoxes(xOf_1(0) + noteHeadWidth, props.y, props.noteWidth, function (pitch) { return props.dispatch({ name: 'mouse over pitch', pitch: pitch }); }, function (pitch) { return props.dispatch({ name: 'note added', pitch: pitch, index: 1, groupNote: groupNote }); }); } : function () { return uhtml_1.svg(templateObject_14 || (templateObject_14 = __makeTemplateObject([""], [""]))); };
            return singleton(firstNote, xOf_1(0), props.y, gracenoteProps, props.previousNote, nb, props.dispatch);
        }
        else {
            var cap = function (n, max) {
                return (n > max) ? max :
                    (n < -max) ? -max :
                        n;
            };
            var diff_1 = cap(
            // todo cap should be dependent on how many notes are in the group
            // difference between first and last notes in a group
            all_1.noteOffset(lastNote.pitch)
                - all_1.noteOffset(firstNote.pitch), 30 / groupNote.notes.length);
            var _a = groupNote.notes.reduce(function (last, next, index) {
                if (index === 0) {
                    return last;
                }
                var lowestNoteSoFar = last[0], lowestNoteIndexSoFar = last[1];
                if (all_1.noteOffset(next.pitch) === all_1.noteOffset(lowestNoteSoFar.pitch)) {
                    return [lowestNoteSoFar, lowestNoteIndexSoFar, true];
                }
                else if (all_1.noteOffset(next.pitch) > all_1.noteOffset(lowestNoteSoFar.pitch)) {
                    return [next, index, false];
                }
                else {
                    return last;
                }
            }, [firstNote, 0, false]), lowestNote = _a[0], lowestNoteIndex = _a[1], multipleLowest_1 = _a[2];
            var diffForLowest_1 = 30 + all_1.noteOffset(lowestNote.pitch) - (multipleLowest_1 ? 0 : diff_1 * relativeIndexOf_1(lowestNote, lowestNoteIndex) / exports.totalBeatWidth(groupNote, previousPitch));
            var stemYOf_1 = function (note, index) {
                return (functions_1["default"].hasBeam(note) ?
                    props.y
                        + (multipleLowest_1
                            // straight line if there is more than one lowest note
                            ? 0
                            // otherwise use a slant
                            : diff_1 * relativeIndexOf_1(note, index) / exports.totalBeatWidth(groupNote, previousPitch))
                        // offset so that the lowest note is always a constant height
                        + diffForLowest_1
                    : all_1.noteY(props.y, note.pitch) + 30);
            };
            return uhtml_1.svg(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\n        <g class=\"grouped-notes\">\n          ", "\n          ", "\n      </g>"], ["\n        <g class=\"grouped-notes\">\n          ", "\n          ",
                "\n      </g>"])), (groupNote.triplet && groupNote.notes.length === 3) ? triplet(props.y, xOf_1(0), xOf_1(2), yOf_1(firstNote), yOf_1(lastNote)) : null, groupNote.notes.map(function (note, index) {
                setNoteXY_1(note, index);
                var previousNote = groupNote.notes[index - 1] || null;
                var gracenoteProps = ({
                    x: gracenoteX_1(index),
                    y: props.y,
                    gracenoteWidth: props.noteWidth * 0.6,
                    thisNote: note.pitch,
                    previousNote: previousNote ? previousNote.pitch : previousPitch,
                    dispatch: props.dispatch
                });
                var previousNoteObj = (function () {
                    if (previousNote !== null)
                        return ({
                            pitch: previousNote.pitch,
                            x: xOf_1(index - 1),
                            y: yOf_1(previousNote)
                        });
                    else
                        return props.previousNote;
                })();
                return uhtml_1.svg["for"](note)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["<g class=\"grouped-note\">\n                ", "\n                ", "\n\n                ", "\n\n                ", "\n\n                ", "\n\n                <line\n                  x1=", "\n                  x2=", "\n                  y1=", "\n                  y2=", "\n                  stroke=\"black\"\n                  />\n              </g>"], ["<g class=\"grouped-note\">\n                ", "\n                ", "\n\n                ", "\n\n                ",
                    "\n\n                ", "\n\n                <line\n                  x1=", "\n                  x2=", "\n                  y1=", "\n                  y2=", "\n                  stroke=\"black\"\n                  />\n              </g>"])), shouldTie(note, previousNoteObj) ? tie(props.y, note.pitch, xOf_1(index), previousNoteObj) : null, shouldTie(note, previousNoteObj) ? null : view_1["default"](note.gracenote, gracenoteProps), noteHead(xOf_1(index), yOf_1(note), note, function (event) { return props.dispatch({ name: 'note clicked', note: note, event: event }); }), (previousNote !== null && index > 0) ? beamFrom(stemXOf_1(index), stemYOf_1(note, index), stemXOf_1(index - 1), stemYOf_1(previousNote, index - 1), functions_1["default"].lengthToNumTails(note.length), functions_1["default"].lengthToNumTails(previousNote.length)) : null, canAddNotes ? all_1.noteBoxes(xOf_1(index) + noteHeadWidth, props.y, props.noteWidth, function (pitch) { return props.dispatch({ name: 'mouse over pitch', pitch: pitch }); }, function (pitch) { return props.dispatch({ name: 'note added', pitch: pitch, index: index + 1, groupNote: groupNote }); }) : null, stemXOf_1(index), stemXOf_1(index), yOf_1(note), stemYOf_1(note, index));
            }));
        }
    }
}
exports["default"] = render;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16;
