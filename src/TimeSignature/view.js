"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
function render(timeSignature, props) {
    var y = props.y + 15;
    return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<g class=\"time-signature\">\n    <text text-anchor=\"middle\" x=", " y=", " font-size=\"25\" onclick=", ">", "</text>\n    <text text-anchor=\"middle\" x=", " y=", " font-size=\"25\" onclick=", ">", "</text>\n  </g>"], ["<g class=\"time-signature\">\n    <text text-anchor=\"middle\" x=", " y=", " font-size=\"25\" onclick=", ">", "</text>\n    <text text-anchor=\"middle\" x=", " y=", " font-size=\"25\" onclick=", ">", "</text>\n  </g>"])), props.x, y, function () { return props.dispatch({ name: 'edit time signature numerator', timeSignature: timeSignature }); }, timeSignature[0], props.x, y + 15, function () { return props.dispatch({ name: 'edit time signature denominator', timeSignature: timeSignature }); }, timeSignature[1]);
}
exports["default"] = render;
var templateObject_1;
