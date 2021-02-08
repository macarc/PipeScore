"use strict";
exports.__esModule = true;
var all_1 = require("../all");
var functions_1 = require("../Stave/functions");
function groupNotes(score) {
    return all_1.flatten(score.staves.map(function (stave) { return functions_1["default"].groupNotes(stave); }));
}
function bars(score) {
    return all_1.flatten(score.staves.map(function (stave) { return functions_1["default"].bars(stave); }));
}
function staves(score) {
    return score.staves;
}
function addStave(score, afterStave) {
    var ind = score.staves.indexOf(afterStave);
    if (ind !== -1)
        score.staves.splice(ind + 1, 0, functions_1["default"].init());
}
function deleteStave(score, stave) {
    var ind = score.staves.indexOf(stave);
    if (ind !== -1)
        score.staves.splice(ind, 1);
}
var init = function () { return ({
    staves: [functions_1["default"].init(), functions_1["default"].init()],
    textBoxes: [],
    secondTimings: []
}); };
exports["default"] = {
    init: init,
    bars: bars,
    staves: staves,
    addStave: addStave,
    deleteStave: deleteStave,
    groupNotes: groupNotes
};
