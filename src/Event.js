"use strict";
exports.__esModule = true;
exports.isEditTimeSignatureDenominator = exports.isEditTimeSignatureNumerator = exports.isAddSecondTiming = exports.isDeleteText = exports.isCentreText = exports.isTextMouseUp = exports.isTextDragged = exports.isAddTriplet = exports.isTieSelectedNotes = exports.isDeleteStave = exports.isAddStave = exports.isDeleteBar = exports.isAddBar = exports.isAddText = exports.isEditText = exports.isTextClicked = exports.isChangeZoomLevel = exports.isToggleDotted = exports.isNoteAdded = exports.isStopInputtingNotes = exports.isSetInputLength = exports.isSetGracenoteOnSelected = exports.isDeleteSelectedNotes = exports.isMouseUp = exports.isBackgroundClicked = exports.isNoteClicked = exports.isSingleGracenoteClicked = exports.isMouseMovedOver = exports.isPaste = exports.isCopy = void 0;
function isCopy(e) {
    return e.name === 'copy';
}
exports.isCopy = isCopy;
function isPaste(e) {
    return e.name === 'paste';
}
exports.isPaste = isPaste;
function isMouseMovedOver(e) {
    return e.name === 'mouse over pitch';
}
exports.isMouseMovedOver = isMouseMovedOver;
function isSingleGracenoteClicked(e) {
    return e.name === 'gracenote clicked';
}
exports.isSingleGracenoteClicked = isSingleGracenoteClicked;
function isNoteClicked(e) {
    return e.name === 'note clicked';
}
exports.isNoteClicked = isNoteClicked;
function isBackgroundClicked(e) {
    return e.name === 'background clicked';
}
exports.isBackgroundClicked = isBackgroundClicked;
function isMouseUp(e) {
    return e.name === 'mouse up';
}
exports.isMouseUp = isMouseUp;
function isDeleteSelectedNotes(e) {
    return e.name === 'delete selected notes';
}
exports.isDeleteSelectedNotes = isDeleteSelectedNotes;
function isSetGracenoteOnSelected(e) {
    return e.name === 'set gracenote';
}
exports.isSetGracenoteOnSelected = isSetGracenoteOnSelected;
function isSetInputLength(e) {
    return e.name === 'set note input length';
}
exports.isSetInputLength = isSetInputLength;
function isStopInputtingNotes(e) {
    return e.name === 'stop inputting notes';
}
exports.isStopInputtingNotes = isStopInputtingNotes;
function isNoteAdded(e) {
    return e.name === 'note added';
}
exports.isNoteAdded = isNoteAdded;
function isToggleDotted(e) {
    return e.name === 'toggle dotted';
}
exports.isToggleDotted = isToggleDotted;
function isChangeZoomLevel(e) {
    return e.name === 'change zoom level';
}
exports.isChangeZoomLevel = isChangeZoomLevel;
function isTextClicked(e) {
    return e.name === 'text clicked';
}
exports.isTextClicked = isTextClicked;
function isEditText(e) {
    return e.name === 'edit text';
}
exports.isEditText = isEditText;
function isAddText(e) {
    return e.name === 'add text';
}
exports.isAddText = isAddText;
function isAddBar(e) {
    return e.name === 'add bar';
}
exports.isAddBar = isAddBar;
function isDeleteBar(e) {
    return e.name === 'delete bar';
}
exports.isDeleteBar = isDeleteBar;
function isAddStave(e) {
    return e.name === 'add stave';
}
exports.isAddStave = isAddStave;
function isDeleteStave(e) {
    return e.name === 'delete stave';
}
exports.isDeleteStave = isDeleteStave;
function isTieSelectedNotes(e) {
    return e.name === 'tie selected notes';
}
exports.isTieSelectedNotes = isTieSelectedNotes;
function isAddTriplet(e) {
    return e.name === 'add triplet';
}
exports.isAddTriplet = isAddTriplet;
function isTextDragged(e) {
    return e.name === 'text dragged';
}
exports.isTextDragged = isTextDragged;
function isTextMouseUp(e) {
    return e.name === 'text mouse up';
}
exports.isTextMouseUp = isTextMouseUp;
function isCentreText(e) {
    return e.name === 'centre text';
}
exports.isCentreText = isCentreText;
function isDeleteText(e) {
    return e.name === 'delete text';
}
exports.isDeleteText = isDeleteText;
function isAddSecondTiming(e) {
    return e.name === 'add second timing';
}
exports.isAddSecondTiming = isAddSecondTiming;
function isEditTimeSignatureNumerator(e) {
    return e.name === 'edit time signature numerator';
}
exports.isEditTimeSignatureNumerator = isEditTimeSignatureNumerator;
function isEditTimeSignatureDenominator(e) {
    return e.name === 'edit time signature denominator';
}
exports.isEditTimeSignatureDenominator = isEditTimeSignatureDenominator;
