"use strict";
exports.__esModule = true;
/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
var Controller_1 = require("./Controller");
var global_1 = require("./global");
var KeyHandler_1 = require("./KeyHandler");
var functions_1 = require("./Score/functions");
document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('keydown', KeyHandler_1.keyHandler);
    global_1.setScore(functions_1["default"].init());
    Controller_1["default"]();
});
