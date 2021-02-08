"use strict";
exports.__esModule = true;
exports.keyHandler = void 0;
var Controller_1 = require("./Controller");
function keyHandler(e) {
    switch (e.key) {
        case "Escape":
            Controller_1.dispatch({ name: 'stop inputting notes' });
            break;
        case "c":
            if (e.ctrlKey)
                Controller_1.dispatch({ name: 'copy' });
            break;
        case "v":
            if (e.ctrlKey)
                Controller_1.dispatch({ name: 'paste' });
            break;
        case "Delete":
            Controller_1.dispatch({ name: 'delete selected notes' });
            break;
        case ".":
            Controller_1.dispatch({ name: 'toggle dotted' });
            break;
        case "t":
            Controller_1.dispatch({ name: 'tie selected notes' });
            break;
        case "1":
            Controller_1.dispatch({ name: 'set note input length', length: "hdsq" /* HemiDemiSemiQuaver */ });
            break;
        case "2":
            Controller_1.dispatch({ name: 'set note input length', length: "ssq" /* DemiSemiQuaver */ });
            break;
        case "3":
            Controller_1.dispatch({ name: 'set note input length', length: "sq" /* SemiQuaver */ });
            break;
        case "4":
            Controller_1.dispatch({ name: 'set note input length', length: "q" /* Quaver */ });
            break;
        case "5":
            Controller_1.dispatch({ name: 'set note input length', length: "c" /* Crotchet */ });
            break;
        case "6":
            Controller_1.dispatch({ name: 'set note input length', length: "m" /* Minim */ });
            break;
        case "7":
            Controller_1.dispatch({ name: 'set note input length', length: "sb" /* Semibreve */ });
            break;
    }
}
exports.keyHandler = keyHandler;
