"use strict";
exports.__esModule = true;
exports.setScore = exports.score = exports.setSelectedText = exports.selectedText = exports.setDraggedText = exports.draggedText = exports.setSelection = exports.selection = exports.setClipboard = exports.clipboard = exports.currentSvg = exports.setZoomLevel = exports.zoomLevel = exports.setInputLength = exports.inputLength = exports.isBeingDragged = exports.setDraggedGracenote = exports.draggedGracenote = exports.unDragNote = exports.setDraggedNote = exports.draggedNote = exports.deleteXY = exports.getXY = exports.setXY = void 0;
/*
  global.ts - Defines global mutable state variables for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var all_1 = require("./all");
var itemCoords = new Map();
// the y value will be the stave's y rather than the actual y value of the note
var setXY = function (item, beforeX, afterX, y) {
    itemCoords.set(item, { beforeX: beforeX, afterX: afterX, y: y });
};
exports.setXY = setXY;
var getXY = function (item) { return itemCoords.get(item) || null; };
exports.getXY = getXY;
var deleteXY = function (item) {
    itemCoords["delete"](item);
};
exports.deleteXY = deleteXY;
exports.draggedNote = null;
var setDraggedNote = function (note) {
    exports.draggedNote = note;
};
exports.setDraggedNote = setDraggedNote;
var unDragNote = function () {
    exports.draggedNote = null;
};
exports.unDragNote = unDragNote;
exports.draggedGracenote = null;
var setDraggedGracenote = function (g) {
    exports.draggedGracenote = g;
};
exports.setDraggedGracenote = setDraggedGracenote;
var isBeingDragged = function (note) { return note === exports.draggedNote; };
exports.isBeingDragged = isBeingDragged;
exports.inputLength = null;
var setInputLength = function (l) {
    exports.inputLength = l;
};
exports.setInputLength = setInputLength;
exports.zoomLevel = (0.75 * window.outerWidth) / all_1.scoreWidth * 100;
var setZoomLevel = function (z) {
    exports.zoomLevel = z;
};
exports.setZoomLevel = setZoomLevel;
exports.currentSvg = { current: null };
exports.clipboard = null;
var setClipboard = function (c) {
    exports.clipboard = c;
};
exports.setClipboard = setClipboard;
exports.selection = null;
var setSelection = function (s) {
    exports.selection = s;
};
exports.setSelection = setSelection;
exports.draggedText = null;
var setDraggedText = function (t) {
    exports.draggedText = t;
};
exports.setDraggedText = setDraggedText;
exports.selectedText = null;
var setSelectedText = function (t) {
    exports.selectedText = t;
};
exports.setSelectedText = setSelectedText;
var setScore = function (s) {
    exports.score = s;
};
exports.setScore = setScore;
