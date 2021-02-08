"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
var uhtml_1 = require("uhtml");
var all_1 = require("../all");
var global_1 = require("../global");
function render(selection) {
    var start = global_1.getXY(selection.start.id);
    var end = global_1.getXY(selection.end.id);
    if (!start || !end) {
        return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""])));
    }
    var width = end.afterX - start.beforeX;
    var height = 6 * all_1.lineGap;
    return uhtml_1.svg(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<g class=\"selection\">\n    <rect x=", " y=", " width=", " height=", " fill=\"orange\" opacity=\"0.4\" pointer-events=\"none\" />\n  </g>"], ["<g class=\"selection\">\n    <rect x=", " y=", " width=", " height=", " fill=\"orange\" opacity=\"0.4\" pointer-events=\"none\" />\n  </g>"])), start.beforeX, start.y - all_1.lineGap, width, height);
}
exports["default"] = render;
var templateObject_1, templateObject_2;
