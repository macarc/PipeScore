"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
var uhtml_1 = require("uhtml");
var global_1 = require("../global");
function render(secondTiming) {
    var start = global_1.getXY(secondTiming.start);
    var middle = global_1.getXY(secondTiming.middle);
    var end = global_1.getXY(secondTiming.end);
    var height = 35;
    var mid = 20;
    if (start && middle && end) {
        return uhtml_1.svg(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<g class=\"second-timing\">\n      <line x1=", " y1=", " x2=", " y2=", " stroke=\"black\" />\n      <line x1=", " y1=", " x2=", " y2=", " stroke=\"black\" />\n\n      ", "\n    </g>"], ["<g class=\"second-timing\">\n      <line x1=", " y1=", " x2=", " y2=", " stroke=\"black\" />\n      <line x1=", " y1=", " x2=", " y2=", " stroke=\"black\" />\n\n      ", "\n    </g>"])), start.beforeX, start.y - height, middle.afterX, middle.y - height, middle.afterX, middle.y - height, end.afterX, middle.y - height, [[start.beforeX, start.y], [middle.afterX, middle.y], [end.afterX, end.y]].map(function (_a) {
            var x = _a[0], y = _a[1];
            return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"], ["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"])), x, x, y - height, y - mid);
        }));
    }
    else {
        console.error('invalid second timing!');
        return uhtml_1.svg(templateObject_3 || (templateObject_3 = __makeTemplateObject(["<g></g>"], ["<g></g>"])));
    }
}
exports["default"] = render;
var templateObject_1, templateObject_2, templateObject_3;
