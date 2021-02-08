"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
/*
  Score.ts - Score implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var all_1 = require("../all");
var view_1 = require("../TextBox/view");
var view_2 = require("../SecondTiming/view");
var view_3 = require("../ScoreSelection/view");
var view_4 = require("../Stave/view");
function render(score, props) {
    var margin = 30;
    var topOffset = 150;
    var staveProps = function (stave, index) { return ({
        x: margin,
        y: index * all_1.staveGap + topOffset,
        width: all_1.scoreWidth - 2 * margin,
        // || null so it is not 'undefined' but 'null'
        previousStave: score.staves[index - 1] || null,
        dispatch: props.dispatch
    }); };
    return uhtml_1.svg(templateObject_4 || (templateObject_4 = __makeTemplateObject(["<svg ref=", " width=", " height=", " viewBox=", " onmouseup=", ">\n    <rect x=\"0\" y=\"0\" width=\"100%\" onmousedown=", " height=\"100%\" fill=\"white\" />\n\n    ", "\n\n    ", "\n\n\n    ", "\n\n    ", "\n  </svg>"], ["<svg ref=", " width=", " height=", " viewBox=", " onmouseup=", ">\n    <rect x=\"0\" y=\"0\" width=\"100%\" onmousedown=", " height=\"100%\" fill=\"white\" />\n\n    ",
        "\n\n    ", "\n\n\n    ", "\n\n    ", "\n  </svg>"])), props.svgRef, all_1.scoreWidth * props.zoomLevel / 100, all_1.scoreHeight * props.zoomLevel / 100, "0 0 " + all_1.scoreWidth + " " + all_1.scoreHeight, function () { return props.dispatch({ name: 'mouse up' }); }, function () { return props.dispatch({ name: 'background clicked' }); }, score.staves.map(function (stave, idx) { return uhtml_1.svg["for"](stave)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      ", "\n    "], ["\n      ", "\n    "])), view_4["default"](stave, staveProps(stave, idx))); }), score.textBoxes.map(function (textBox) { return uhtml_1.svg["for"](textBox)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", ""], ["", ""])), view_1["default"](textBox, { dispatch: props.dispatch })); }), score.secondTimings.map(function (secondTiming) { return uhtml_1.svg["for"](secondTiming)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", ""], ["", ""])), view_2["default"](secondTiming)); }), props.selection ? view_3["default"](props.selection) : null);
}
exports["default"] = render;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
