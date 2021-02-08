"use strict";
exports.__esModule = true;
exports.init = exports.timeSignatureWidth = void 0;
exports.timeSignatureWidth = 30;
function numberOfBeats(ts) {
    switch (ts[1]) {
        case 4:
            return ts[0];
        case 8:
            return Math.ceil(ts[0] / 3);
    }
}
function beatDivision(ts) {
    switch (ts[1]) {
        case 4:
            return 1;
        case 8:
            return 1.5;
    }
}
function parseDenominator(text) {
    switch (text) {
        case '4': return 4;
        case '8': return 8;
        default: return null;
    }
}
function equal(ts0, ts1) {
    return ts0[0] === ts1[0] && ts0[1] === ts1[1];
}
var init = function () { return [2, 4]; };
exports.init = init;
exports["default"] = {
    init: exports.init,
    numberOfBeats: numberOfBeats,
    beatDivision: beatDivision,
    parseDenominator: parseDenominator,
    equal: equal
};
