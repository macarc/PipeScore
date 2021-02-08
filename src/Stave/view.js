"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
/*
  Stave.ts - Stave implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var uhtml_1 = require("uhtml");
var all_1 = require("../all");
var view_1 = require("../Bar/view");
var trebleClef = function (x, y) { return uhtml_1.svg(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  <g transform=", ">\n      <g class=\"Layer 1\" transform=\"matrix(.21599 0 0 .21546 -250.44 -1202.6)\">\n        <path class=\"path9\" d=\"m2002 7851c-61 17-116 55-167 113-51 59-76 124-76 194 0 44 15 94 44 147 29 54 73 93 130 118 19 4 28 14 28 28 0 5-7 10-24 14-91-23-166-72-224-145-58-74-88-158-90-254 3-103 34-199 93-287 60-89 137-152 231-189l-69-355c-154 128-279 261-376 401-97 139-147 290-151 453 2 73 17 144 45 212 28 69 70 131 126 188 113 113 260 172 439 178 61-4 126-15 196-33l-155-783zm72-10l156 769c154-62 231-197 231-403-9-69-29-131-63-186-33-56-77-100-133-132s-119-48-191-48zm-205-1040c33-20 71-55 112-104 41-48 81-105 119-169 39-65 70-131 93-198 23-66 34-129 34-187 0-25-2-50-7-72-4-36-15-64-34-83-19-18-43-28-73-28-60 0-114 37-162 111-37 64-68 140-90 226-23 87-36 173-38 260 5 99 21 180 46 244zm-63 58c-45-162-70-327-75-495 1-108 12-209 33-303 20-94 49-175 87-245 37-70 80-123 128-159 43-32 74-49 91-49 13 0 24 5 34 14s23 24 39 44c119 169 179 373 179 611 0 113-15 223-45 333-29 109-72 213-129 310-58 98-126 183-205 256l81 394c44-5 74-9 91-9 76 0 144 16 207 48s117 75 161 130c44 54 78 116 102 186 23 70 36 143 36 219 0 118-31 226-93 323s-155 168-280 214c8 49 22 120 43 211 20 92 35 165 45 219s14 106 14 157c0 79-19 149-57 211-39 62-91 110-157 144-65 34-137 51-215 51-110 0-206-31-288-92-82-62-126-145-130-251 3-47 14-91 34-133s47-76 82-102c34-27 75-41 122-44 39 0 76 11 111 32 34 22 62 51 83 88 20 37 31 78 31 122 0 59-20 109-60 150s-91 62-152 62h-23c39 60 103 91 192 91 45 0 91-10 137-28 47-19 86-44 119-76s55-66 64-102c17-41 25-98 25-169 0-48-5-96-14-144-9-47-23-110-42-188-19-77-33-137-41-178-60 15-122 23-187 23-109 0-212-22-309-67s-182-107-256-187c-73-80-130-170-171-272-40-101-61-207-62-317 4-102 23-200 59-292 36-93 82-181 139-263s116-157 177-224c62-66 143-151 245-254z\" stroke=\"black\" stroke-width=\"53.022\" class=\"fil0 str0\" fill=\"black\"/>\n      </g>\n    </g>\n  "], ["\n  <g transform=", ">\n      <g class=\"Layer 1\" transform=\"matrix(.21599 0 0 .21546 -250.44 -1202.6)\">\n        <path class=\"path9\" d=\"m2002 7851c-61 17-116 55-167 113-51 59-76 124-76 194 0 44 15 94 44 147 29 54 73 93 130 118 19 4 28 14 28 28 0 5-7 10-24 14-91-23-166-72-224-145-58-74-88-158-90-254 3-103 34-199 93-287 60-89 137-152 231-189l-69-355c-154 128-279 261-376 401-97 139-147 290-151 453 2 73 17 144 45 212 28 69 70 131 126 188 113 113 260 172 439 178 61-4 126-15 196-33l-155-783zm72-10l156 769c154-62 231-197 231-403-9-69-29-131-63-186-33-56-77-100-133-132s-119-48-191-48zm-205-1040c33-20 71-55 112-104 41-48 81-105 119-169 39-65 70-131 93-198 23-66 34-129 34-187 0-25-2-50-7-72-4-36-15-64-34-83-19-18-43-28-73-28-60 0-114 37-162 111-37 64-68 140-90 226-23 87-36 173-38 260 5 99 21 180 46 244zm-63 58c-45-162-70-327-75-495 1-108 12-209 33-303 20-94 49-175 87-245 37-70 80-123 128-159 43-32 74-49 91-49 13 0 24 5 34 14s23 24 39 44c119 169 179 373 179 611 0 113-15 223-45 333-29 109-72 213-129 310-58 98-126 183-205 256l81 394c44-5 74-9 91-9 76 0 144 16 207 48s117 75 161 130c44 54 78 116 102 186 23 70 36 143 36 219 0 118-31 226-93 323s-155 168-280 214c8 49 22 120 43 211 20 92 35 165 45 219s14 106 14 157c0 79-19 149-57 211-39 62-91 110-157 144-65 34-137 51-215 51-110 0-206-31-288-92-82-62-126-145-130-251 3-47 14-91 34-133s47-76 82-102c34-27 75-41 122-44 39 0 76 11 111 32 34 22 62 51 83 88 20 37 31 78 31 122 0 59-20 109-60 150s-91 62-152 62h-23c39 60 103 91 192 91 45 0 91-10 137-28 47-19 86-44 119-76s55-66 64-102c17-41 25-98 25-169 0-48-5-96-14-144-9-47-23-110-42-188-19-77-33-137-41-178-60 15-122 23-187 23-109 0-212-22-309-67s-182-107-256-187c-73-80-130-170-171-272-40-101-61-207-62-317 4-102 23-200 59-292 36-93 82-181 139-263s116-157 177-224c62-66 143-151 245-254z\" stroke=\"black\" stroke-width=\"53.022\" class=\"fil0 str0\" fill=\"black\"/>\n      </g>\n    </g>\n  "])), "translate(" + (x + 5) + " " + (y - 25) + ") scale(0.08)"); };
var trebleClefWidth = 40;
function render(stave, props) {
    var staveHeight = props.y;
    var staveLines = __spreadArrays(Array(5).keys()).map(function (idx) { return all_1.lineHeightOf(idx) + staveHeight; });
    var totalAnacrusisWidth = stave.bars.reduce(function (i, bar) { return i + (bar.isAnacrusis ? view_1.widthOfAnacrusis(bar, null) : 0); }, 0);
    var barWidth = (props.width - trebleClefWidth - totalAnacrusisWidth) / stave.bars.length;
    var getX = function (barIdx) { return stave.bars.slice().splice(0, barIdx).reduce(function (soFar, bar) {
        if (bar.isAnacrusis) {
            return soFar + view_1.widthOfAnacrusis(bar, null);
        }
        else {
            return soFar + barWidth;
        }
    }, props.x + trebleClefWidth); };
    var previousBar = function (barIdx) { return barIdx === 0
        ? (props.previousStave ? props.previousStave.bars[props.previousStave.bars.length - 1] : null)
        : stave.bars[barIdx - 1]; };
    var barProps = function (bar, index) { return ({
        x: getX(index),
        y: staveHeight,
        width: bar.isAnacrusis ? view_1.widthOfAnacrusis(bar, null) : barWidth,
        lastNoteX: index === 0 ? null : getX(index - 1) + view_1.xOffsetOfLastNote(stave.bars[index - 1], barWidth, stave.bars[index - 2] || null),
        previousBar: previousBar(index),
        shouldRenderLastBarline: index === (stave.bars.length - 1),
        dispatch: props.dispatch
    }); };
    return uhtml_1.svg(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n    <g class=\"stave\">\n      ", "\n      <g class=\"notes\">\n        ", "\n      </g>\n      <g class=\"stave-lines\">\n        ", "\n      </g>\n    </g>\n  "], ["\n    <g class=\"stave\">\n      ", "\n      <g class=\"notes\">\n        ",
        "\n      </g>\n      <g class=\"stave-lines\">\n        ",
        "\n      </g>\n    </g>\n  "])), trebleClef(props.x, props.y), stave.bars.map(function (bar, idx) { return uhtml_1.svg["for"](bar)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", ""], ["", ""])), view_1["default"](bar, barProps(bar, idx))); }), staveLines.map(function (y) { return uhtml_1.svg(templateObject_3 || (templateObject_3 = __makeTemplateObject(["<g>\n            <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" pointer-events=\"none\" />\n          </g>"], ["<g>\n            <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" pointer-events=\"none\" />\n          </g>"])), props.x, props.x + props.width, y, y); }));
}
exports["default"] = render;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
