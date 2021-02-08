"use strict";
exports.__esModule = true;
var all_1 = require("../all");
function centre(tx, pageWidth) {
    tx.x = pageWidth / 2;
}
function setCoords(tx, x, y) {
    tx.x = x;
    tx.y = y;
}
var init = function () { return ({
    x: all_1.scoreWidth / 2,
    y: 100,
    text: "<Double Click to edit>"
}); };
exports["default"] = {
    init: init,
    setCoords: setCoords,
    centre: centre
};
