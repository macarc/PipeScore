"use strict";
exports.__esModule = true;
var all_1 = require("../all");
var functions_1 = require("../Bar/functions");
function groupNotes(stave) {
    return all_1.flatten(stave.bars.map(function (b) { return functions_1["default"].groupNotes(b); }));
}
function bars(stave) {
    return stave.bars;
}
function addBar(stave, bar) {
    var ind = stave.bars.indexOf(bar);
    if (ind !== -1)
        stave.bars.splice(ind + 1, 0, functions_1["default"].init());
}
function deleteBar(stave, bar) {
    var ind = stave.bars.indexOf(bar);
    if (ind !== -1)
        stave.bars.splice(ind, 1);
}
var init = function () { return ({
    bars: [functions_1["default"].init(), functions_1["default"].init(), functions_1["default"].init(), functions_1["default"].init()]
}); };
exports["default"] = {
    init: init,
    groupNotes: groupNotes,
    bars: bars,
    addBar: addBar,
    deleteBar: deleteBar
};
