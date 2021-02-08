"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var global_1 = require("../global");
function render(tx, props) {
    return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    <text x=", " y=", " text-anchor=\"middle\" ondblclick=", " onmousedown=", " onmouseup=", " fill=", ">", "</text>\n  "], ["\n    <text x=", " y=", " text-anchor=\"middle\" ondblclick=", " onmousedown=", " onmouseup=", " fill=", ">", "</text>\n  "])), tx.x, tx.y, function () { return props.dispatch({ name: 'edit text', text: tx }); }, function () { return props.dispatch({ name: 'text clicked', text: tx }); }, function () { return props.dispatch({ name: 'text mouse up' }); }, tx === global_1.selectedText ? 'orange' : null, tx.text);
}
exports["default"] = render;
var templateObject_1;
