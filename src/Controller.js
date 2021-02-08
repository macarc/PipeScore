"use strict";
exports.__esModule = true;
exports.dispatch = void 0;
/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var all_1 = require("./all");
var ScoreEvent = require("./Event");
var functions_1 = require("./Score/functions");
var functions_2 = require("./Stave/functions");
var functions_3 = require("./Note/functions");
var functions_4 = require("./Gracenote/functions");
var functions_5 = require("./TimeSignature/functions");
var functions_6 = require("./TextBox/functions");
var functions_7 = require("./SecondTiming/functions");
var view_1 = require("./Score/view");
var view_2 = require("./UI/view");
var global_1 = require("./global");
function dispatch(event) {
    /*
       The global event handler.
       Takes an event, processes it to create a new state, then rerenders the view if necessary.
     */
    var changed = false;
    var recalculateNoteGroupings = false;
    var noteModels = currentNoteModels();
    var selectedNotes = selectionToNotes(global_1.selection, noteModels);
    if (ScoreEvent.isMouseMovedOver(event)) {
        if (global_1.draggedNote !== null && event.pitch !== global_1.draggedNote.pitch) {
            changed = true;
            global_1.draggedNote.pitch = event.pitch;
            makeCorrectTie(global_1.draggedNote);
        }
        if (global_1.draggedGracenote !== null && event.pitch !== global_1.draggedGracenote.note) {
            changed = true;
            global_1.draggedGracenote.note = event.pitch;
        }
    }
    else if (ScoreEvent.isNoteClicked(event)) {
        global_1.setDraggedNote(event.note);
        changed = true;
        if (!event.event.shiftKey) {
            global_1.setSelection({ start: event.note, end: event.note });
        }
        else {
            if (global_1.selection === null) {
                global_1.setSelection({ start: event.note, end: event.note });
            }
            else {
                var ind = noteModels.indexOf(event.note);
                if (ind < noteModels.indexOf(global_1.selection.start)) {
                    global_1.selection.start = event.note;
                }
                else if (ind > noteModels.indexOf(global_1.selection.end)) {
                    global_1.selection.end = event.note;
                }
            }
        }
    }
    else if (ScoreEvent.isSingleGracenoteClicked(event)) {
        global_1.setDraggedGracenote(event.gracenote);
        changed = true;
    }
    else if (ScoreEvent.isBackgroundClicked(event)) {
        if (selectedNotes.length > 0) {
            global_1.setSelection(null);
            changed = true;
        }
        if (global_1.inputLength !== null) {
            global_1.setInputLength(null);
            changed = true;
        }
        if (global_1.selectedText !== null) {
            global_1.setSelectedText(null);
            changed = true;
        }
    }
    else if (ScoreEvent.isMouseUp(event)) {
        if (global_1.draggedNote !== null || global_1.draggedGracenote !== null) {
            global_1.unDragNote();
            global_1.setDraggedGracenote(null);
            changed = true;
        }
    }
    else if (ScoreEvent.isDeleteSelectedNotes(event)) {
        if (selectedNotes.length > 0) {
            var groupedNotes = functions_1["default"].groupNotes(global_1.score);
            // quadratic!
            groupedNotes.forEach(function (g) {
                // Need to slice it so that deleting inside the loop works
                var newNotes = g.notes.slice();
                g.notes.forEach(function (note) {
                    if (selectedNotes.includes(note)) {
                        deleteNote(note, newNotes);
                    }
                });
                g.notes = newNotes;
            });
            global_1.setSelection(null);
            changed = true;
            recalculateNoteGroupings = true;
        }
    }
    else if (ScoreEvent.isSetGracenoteOnSelected(event)) {
        selectedNotes.forEach(function (note) { return note.gracenote = functions_4["default"].from(event.value); });
        changed = true;
    }
    else if (ScoreEvent.isSetInputLength(event)) {
        if (event.length !== global_1.inputLength) {
            global_1.setInputLength(event.length);
            changed = true;
        }
    }
    else if (ScoreEvent.isStopInputtingNotes(event)) {
        if (global_1.inputLength !== null) {
            global_1.setInputLength(null);
        }
    }
    else if (ScoreEvent.isNoteAdded(event)) {
        if (global_1.inputLength !== null) {
            var newNote = functions_3["default"].initNote(event.pitch, global_1.inputLength);
            event.groupNote.notes.splice(event.index, 0, newNote);
            changed = true;
            // todo - should this need to be done?
            makeCorrectTie(newNote);
            recalculateNoteGroupings = true;
        }
    }
    else if (ScoreEvent.isToggleDotted(event)) {
        selectedNotes.forEach(function (note) { return note.length = functions_3["default"].toggleDot(note.length); });
        if (global_1.inputLength !== null)
            global_1.setInputLength(functions_3["default"].toggleDot(global_1.inputLength));
        changed = true;
        recalculateNoteGroupings = true;
    }
    else if (ScoreEvent.isAddTriplet(event)) {
        if (selectedNotes.length > 0 && global_1.inputLength !== null) {
            var _a = currentBar(selectedNotes[0]), groupNote = _a.groupNote, bar = _a.bar;
            bar.notes.splice(bar.notes.indexOf(groupNote) + 1, 0, functions_3["default"].initTriplet(global_1.inputLength));
            changed = true;
            recalculateNoteGroupings = true;
        }
    }
    else if (ScoreEvent.isChangeZoomLevel(event)) {
        if (event.zoomLevel !== global_1.zoomLevel) {
            global_1.setZoomLevel(event.zoomLevel);
            changed = true;
        }
    }
    else if (ScoreEvent.isTextClicked(event)) {
        global_1.setSelectedText(event.text);
        global_1.setDraggedText(event.text);
        changed = true;
    }
    else if (ScoreEvent.isTextMouseUp(event)) {
        global_1.setDraggedText(null);
    }
    else if (ScoreEvent.isTextDragged(event)) {
        if (global_1.draggedText !== null) {
            functions_6["default"].setCoords(global_1.draggedText, event.x, event.y);
            changed = true;
        }
    }
    else if (ScoreEvent.isCentreText(event)) {
        if (global_1.selectedText !== null) {
            functions_6["default"].centre(global_1.selectedText, all_1.scoreWidth);
            changed = true;
        }
    }
    else if (ScoreEvent.isAddText(event)) {
        global_1.score.textBoxes.push(functions_6["default"].init());
        changed = true;
    }
    else if (ScoreEvent.isDeleteText(event)) {
        if (global_1.selectedText !== null) {
            global_1.score.textBoxes.splice(global_1.score.textBoxes.indexOf(global_1.selectedText), 1);
            changed = true;
        }
    }
    else if (ScoreEvent.isEditText(event)) {
        var newText = prompt("Enter new text:", event.text.text);
        if (newText && newText !== event.text.text) {
            event.text.text = newText;
            changed = true;
        }
    }
    else if (ScoreEvent.isAddBar(event)) {
        if (global_1.selection) {
            var _b = currentBar(global_1.selection.start), bar = _b.bar, stave = _b.stave;
            functions_2["default"].addBar(stave, bar);
            changed = true;
        }
    }
    else if (ScoreEvent.isDeleteBar(event)) {
        if (global_1.selection) {
            // todo delete all selected bars
            var _c = currentBar(global_1.selection.start), bar = _c.bar, stave = _c.stave;
            var newNotes_1 = all_1.flatten(bar.notes.slice().map(function (n) { return n.notes; }));
            bar.notes.forEach(function (groupNote) { return groupNote.notes.forEach(function (note) { return deleteNote(note, newNotes_1); }); });
            global_1.deleteXY(bar.id);
            functions_2["default"].deleteBar(stave, bar);
            changed = true;
        }
    }
    else if (ScoreEvent.isAddStave(event)) {
        if (global_1.selection) {
            var stave = currentBar(global_1.selection.start).stave;
            functions_1["default"].addStave(global_1.score, stave);
            changed = true;
        }
    }
    else if (ScoreEvent.isDeleteStave(event)) {
        if (global_1.selection) {
            // todo delete all selected staves
            var stave = currentBar(global_1.selection.start).stave;
            var notes = all_1.flatten(stave.bars.map(function (bar) { return all_1.flatten(bar.notes.map(function (n) { return n.notes; })); }));
            var newNotes_2 = notes.slice();
            notes.forEach(function (note) { return deleteNote(note, newNotes_2); });
            functions_1["default"].deleteStave(global_1.score, stave);
            changed = true;
        }
    }
    else if (ScoreEvent.isTieSelectedNotes(event)) {
        if (selectedNotes.length > 0) {
            selectedNotes.forEach(function (note) {
                note.tied = !note.tied;
                makeCorrectTie(note);
            });
            changed = true;
        }
    }
    else if (ScoreEvent.isAddSecondTiming(event)) {
        if (selectedNotes.length >= 3) {
            var notes = sortByPosition(selectedNotes);
            global_1.score.secondTimings.push(functions_7["default"].init(notes[0].id, notes[1].id, notes[2].id));
            changed = true;
        }
    }
    else if (ScoreEvent.isEditTimeSignatureNumerator(event)) {
        var newNumerator = prompt('Enter new top number:', event.timeSignature[0].toString());
        if (!newNumerator)
            return;
        var asNumber = parseInt(newNumerator, 10);
        if (asNumber === event.timeSignature[0])
            return;
        if (!isNaN(asNumber) && asNumber > 0) {
            setTimeSignatureFrom(event.timeSignature, [asNumber, event.timeSignature[1]]);
            recalculateNoteGroupings = true;
            changed = true;
        }
        else {
            alert('Invalid time signature');
        }
    }
    else if (ScoreEvent.isEditTimeSignatureDenominator(event)) {
        var newDenominator = prompt('Enter new bottom number:', event.timeSignature[1].toString());
        if (!newDenominator)
            return;
        var denom = functions_5["default"].parseDenominator(newDenominator);
        if (denom === event.timeSignature[1])
            return;
        if (denom === null) {
            alert('Invalid time signature - PipeScore only supports 4 and 8 time signatures right now, sorry.');
        }
        else {
            setTimeSignatureFrom(event.timeSignature, [event.timeSignature[0], denom]);
            recalculateNoteGroupings = true;
            changed = true;
        }
    }
    else if (ScoreEvent.isCopy(event)) {
        global_1.setClipboard(JSON.parse(JSON.stringify(selectedNotes)));
    }
    else if (ScoreEvent.isPaste(event)) {
        if (!global_1.selection || !global_1.clipboard) {
            return;
        }
        var toPaste = global_1.clipboard.map(function (note) {
            var n = functions_3["default"].initNote(note.pitch, note.length, note.tied);
            n.gracenote = all_1.deepcopy(note.gracenote);
            return n;
        });
        var pasteAfter = global_1.selection.end;
        var bar = currentBar(pasteAfter).bar;
        bar.notes.splice(bar.notes.length, 0, functions_3["default"].groupNoteFrom(toPaste));
        changed = true;
        recalculateNoteGroupings = true;
    }
    else {
        return event;
    }
    if (recalculateNoteGroupings) {
        makeCorrectGroupings();
    }
    if (changed) {
        updateView(global_1.score);
    }
}
exports.dispatch = dispatch;
function makeCorrectTie(noteModel) {
    // corrects the pitches of any notes tied to noteModel
    var bars = functions_1["default"].bars(global_1.score);
    var noteModels = all_1.flatten(bars.map(function (b) { return functions_3["default"].unGroupNotes(b.notes); }));
    for (var i = 0; i < noteModels.length; i++) {
        if (noteModels[i].id === noteModel.id) {
            var b = i;
            while ((b > 0) && noteModels[b].tied) {
                noteModels[b - 1].pitch = noteModel.pitch;
                b -= 1;
            }
            var a = i;
            while ((a < noteModels.length - 1) && noteModels[a + 1].tied) {
                noteModels[a + 1].pitch = noteModel.pitch;
                a += 1;
            }
            break;
        }
    }
}
function sortByPosition(notes) {
    var bars = functions_1["default"].bars(global_1.score);
    var noteModels = all_1.flatten(bars.map(function (b) { return functions_3["default"].unGroupNotes(b.notes); }));
    notes.sort(function (a, b) { return noteModels.indexOf(a) > noteModels.indexOf(b) ? 1 : -1; });
    return notes;
}
function makeCorrectGroupings() {
    var bars = functions_1["default"].bars(global_1.score);
    for (var i = 0; i < bars.length; i++) {
        // todo actually pass the correct time signature
        bars[i].notes = functions_3["default"].groupNotes(bars[i].notes, functions_5["default"].beatDivision(bars[i].timeSignature));
    }
}
function dragText(event) {
    if (global_1.draggedText !== null) {
        var svg = global_1.currentSvg.current;
        if (svg == null) {
            return;
        }
        else {
            var CTM = svg.getScreenCTM();
            if (CTM == null)
                return;
            var pt = svg.createSVGPoint();
            pt.x = event.clientX;
            pt.y = event.clientY;
            var svgPt = pt.matrixTransform(CTM.inverse());
            dispatch({ name: 'text dragged', x: svgPt.x, y: svgPt.y });
        }
    }
}
function deleteNote(note, newNotes) {
    if (newNotes.indexOf(note) === -1) {
        console.error("tried to delete a note that wasn't there");
        return;
    }
    newNotes.splice(newNotes.indexOf(note), 1);
    global_1.deleteXY(note.id);
    var secondTimingsToDelete = [];
    global_1.score.secondTimings.forEach(function (t) {
        if (t.start === note.id || t.middle === note.id || t.end === note.id) {
            secondTimingsToDelete.push(t);
        }
    });
    secondTimingsToDelete.forEach(function (t) {
        return global_1.score.secondTimings.splice(global_1.score.secondTimings.indexOf(t), 1);
    });
    if (global_1.selection && (note === global_1.selection.start || note === global_1.selection.end)) {
        global_1.setSelection(null);
    }
}
function currentBar(note) {
    // This is extremely inefficient and should only be used in instances that don't occur regularly
    var staves = functions_1["default"].staves(global_1.score);
    for (var _i = 0, staves_1 = staves; _i < staves_1.length; _i++) {
        var stave = staves_1[_i];
        var bars = functions_2["default"].bars(stave);
        for (var _a = 0, bars_1 = bars; _a < bars_1.length; _a++) {
            var bar = bars_1[_a];
            var groupNoteModels = bar.notes;
            for (var _b = 0, groupNoteModels_1 = groupNoteModels; _b < groupNoteModels_1.length; _b++) {
                var groupNote = groupNoteModels_1[_b];
                if (groupNote.notes.includes(note)) {
                    return { groupNote: groupNote, stave: stave, bar: bar };
                }
            }
        }
    }
    return { groupNote: functions_2["default"].groupNotes(staves[0])[0], stave: staves[0], bar: functions_2["default"].bars(staves[0])[0] };
}
function currentNoteModels() {
    var bars = functions_1["default"].bars(global_1.score);
    return all_1.flatten(bars.map(function (b) { return functions_3["default"].unGroupNotes(b.notes); }));
}
function selectionToNotes(selection, noteModels) {
    if (selection === null)
        return [];
    var startInd = noteModels.indexOf(selection.start);
    var endInd = noteModels.indexOf(selection.end);
    if (startInd !== -1 && endInd !== -1) {
        return noteModels.slice(startInd, endInd + 1);
    }
    else {
        return [];
    }
}
function setTimeSignatureFrom(timeSignature, newTimeSignature) {
    var bars = functions_1["default"].bars(global_1.score);
    var atTimeSignature = false;
    for (var _i = 0, bars_2 = bars; _i < bars_2.length; _i++) {
        var bar = bars_2[_i];
        if (bar.timeSignature === timeSignature) {
            atTimeSignature = true;
        }
        if (atTimeSignature) {
            bar.timeSignature = newTimeSignature;
        }
    }
}
var updateView = function (score) {
    var scoreRoot = document.getElementById("score");
    var uiRoot = document.getElementById("ui");
    if (!scoreRoot || !uiRoot)
        return;
    var scoreProps = {
        svgRef: global_1.currentSvg,
        zoomLevel: global_1.zoomLevel,
        selection: global_1.selection,
        updateView: function () { return null; },
        dispatch: dispatch
    };
    uhtml_1.render(scoreRoot, view_1["default"](score, scoreProps));
    uhtml_1.render(uiRoot, view_2["default"](dispatch));
};
function startController() {
    window.addEventListener('mousemove', dragText);
    // initially set the notes to be the right groupings
    makeCorrectGroupings();
    updateView(global_1.score);
}
exports["default"] = startController;
