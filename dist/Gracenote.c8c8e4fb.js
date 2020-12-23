// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"all.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noteY = exports.noteOffset = exports.pitchToHeight = exports.PitchOrRest = exports.Pitch = exports.gracenoteToNoteWidthRatio = exports.lineHeightOf = exports.lineGap = exports.unlog2 = exports.unlogf = exports.unlog = exports.logf = exports.log2 = exports.log = void 0;

var log = function log(a) {
  console.log(a);
  return a;
};

exports.log = log;

var log2 = function log2(a, b) {
  console.log(a);
  return b;
};

exports.log2 = log2;

var logf = function logf(a) {
  console.log(a());
  return a;
};

exports.logf = logf;

var unlog = function unlog(a) {
  return a;
};

exports.unlog = unlog;

var unlogf = function unlogf(a) {
  return a;
};

exports.unlogf = unlogf;

var unlog2 = function unlog2(a, b) {
  return b;
};

exports.unlog2 = unlog2;
exports.lineGap = 7;

var lineHeightOf = function lineHeightOf(n) {
  return n * exports.lineGap;
};

exports.lineHeightOf = lineHeightOf;
exports.gracenoteToNoteWidthRatio = 0.4;
var Pitch;

(function (Pitch) {
  Pitch[Pitch["HA"] = 0] = "HA";
  Pitch[Pitch["HG"] = 1] = "HG";
  Pitch[Pitch["F"] = 2] = "F";
  Pitch[Pitch["E"] = 3] = "E";
  Pitch[Pitch["D"] = 4] = "D";
  Pitch[Pitch["C"] = 5] = "C";
  Pitch[Pitch["B"] = 6] = "B";
  Pitch[Pitch["A"] = 7] = "A";
  Pitch[Pitch["G"] = 8] = "G";
})(Pitch = exports.Pitch || (exports.Pitch = {}));

var PitchOrRest;

(function (PitchOrRest) {
  PitchOrRest[PitchOrRest["HA"] = 0] = "HA";
  PitchOrRest[PitchOrRest["HG"] = 1] = "HG";
  PitchOrRest[PitchOrRest["F"] = 2] = "F";
  PitchOrRest[PitchOrRest["E"] = 3] = "E";
  PitchOrRest[PitchOrRest["D"] = 4] = "D";
  PitchOrRest[PitchOrRest["C"] = 5] = "C";
  PitchOrRest[PitchOrRest["B"] = 6] = "B";
  PitchOrRest[PitchOrRest["A"] = 7] = "A";
  PitchOrRest[PitchOrRest["G"] = 8] = "G";
  PitchOrRest[PitchOrRest["R"] = 9] = "R";
})(PitchOrRest = exports.PitchOrRest || (exports.PitchOrRest = {}));

var pitchToHeight = function pitchToHeight(pitch) {
  switch (pitch) {
    case Pitch.HA:
      return -1;

    case Pitch.HG:
      return -0.5;

    case Pitch.F:
      return 0;

    case Pitch.E:
      return 0.5;

    case Pitch.D:
      return 1;

    case Pitch.C:
      return 1.5;

    case Pitch.B:
      return 2;

    case Pitch.A:
      return 2.5;

    case Pitch.G:
      return 3;
  }
};

exports.pitchToHeight = pitchToHeight;

var noteOffset = function noteOffset(note) {
  // Return the difference from the top of the stave
  // to the note
  return exports.lineHeightOf(exports.pitchToHeight(note));
};

exports.noteOffset = noteOffset;

var noteY = function noteY(staveY, note) {
  // return the y value of given note
  return staveY + exports.noteOffset(note);
};

exports.noteY = noteY;
},{}],"Gracenote.ts":[function(require,module,exports) {
"use strict";

function _templateObject7() {
  var data = _taggedTemplateLiteral(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = _taggedTemplateLiteral(["<g class=\"gracenote\">\n      ", "\n  \n      <line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />\n  \n      ", "\n    </g>"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = _taggedTemplateLiteral(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = _taggedTemplateLiteral(["<g class=\"reactive-gracenote\">\n              ", "\n              ", "\n            </g>"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = _taggedTemplateLiteral(["<g class=\"gracenote\">\n      ", "\n    </g>"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["<g class=\"gracenote-head\">\n      ", "\n      <ellipse cx=", " cy=", " rx=\"3.5\" ry=\"2.5\" transform=\"rotate(-30 ", " ", ")\" fill=\"black\" pointer-events=\"none\" />\n\n      <line x1=", " y1=", " x2=", " y2=", " stroke=\"black\" /> \n    </g>"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var all_1 = require("./all");

var gracenotes = new Map();
gracenotes.set('throw-d', function (note, _) {
  return note === all_1.Pitch.D ? [all_1.Pitch.G, all_1.Pitch.D, all_1.Pitch.C] : -1;
});
gracenotes.set('doubling', function (note, prev) {
  var init = [];

  if (note === all_1.Pitch.G || note === all_1.Pitch.A || note === all_1.Pitch.B || note === all_1.Pitch.C) {
    init = [all_1.Pitch.HG, note, all_1.Pitch.D];
  } else if (note === all_1.Pitch.D) {
    init = [all_1.Pitch.HG, note, all_1.Pitch.E];
  } else if (note === all_1.Pitch.E) {
    init = [all_1.Pitch.HG, note, all_1.Pitch.F];
  } else if (note === all_1.Pitch.F) {
    init = [all_1.Pitch.HG, note, all_1.Pitch.HG];
  } else if (note === all_1.Pitch.HG) {
    // ['HA', note, 'HA'] or ['HG','F'] ?
    init = [all_1.Pitch.HA, note, all_1.Pitch.HA];
  } else if (note === all_1.Pitch.HA) {
    init = [all_1.Pitch.HA, all_1.Pitch.HG];
  } else {
    return -1;
  }

  if (prev === all_1.Pitch.HG && note !== all_1.Pitch.HA && note !== all_1.Pitch.HG) {
    init[0] = all_1.Pitch.HA;
  } else if (prev === all_1.Pitch.HA) {
    init = init.splice(1);
    if (note === all_1.Pitch.HG) init = [all_1.Pitch.HG, all_1.Pitch.F];
  }

  return init;
});

var Gracenote = /*#__PURE__*/function () {
  function Gracenote() {
    var _this = this;

    _classCallCheck(this, Gracenote);

    // this is a pure component - should probably be in a function but it isn't so well
    //self = o({ type: 'single', note: 'HG' });
    this.self = o({
      type: 'reactive',
      gracenote: 'doubling'
    });
    this.tailXOffset = 3;

    this.numberOfNotes = function (thisNote, previousNote) {
      return computed(function () {
        if (_this.self().type === 'single') {
          return 1;
        } else if (_this.self().type === 'reactive') {
          return _this.notes(thisNote, previousNote).length;
        }
      });
    };

    this.notes = function (thisNote, previousNote) {
      if (thisNote === 'R') return [];

      if (_this.self().type === 'single') {
        return _this.self().note;
      } else if (_this.self().type === 'reactive') {
        return gracenotes.get(_this.self().gracenote)(thisNote, previousNote);
      }
    };

    this.head = function (x, y, note, beamY) {
      var ledgerLeft = 5;
      var ledgerRight = 5.2; // todo: make ledger line the correct length

      return svg(_templateObject(), note === 'HA' ? svg(_templateObject2(), x - ledgerLeft, x + ledgerRight, y, y) : null, x, y, x, y, x + _this.tailXOffset, y, x + _this.tailXOffset, beamY);
    };

    this.render = function (props) {
      var rad = function rad(n) {
        return n * Math.PI / 180;
      };

      var stemXOf = function stemXOf(x) {
        return x + 3;
      };

      var stemYOf = function stemYOf(y) {
        return y - 2;
      };

      return svg(_templateObject3(), computed(function () {
        var self = _this.self();

        if (self.type === 'single') {
          _this.single(self.note, props);
        } else if (self.type === 'reactive') {
          // notes must be mapped to objects so that .indexOf will give
          // the right answer (so it will compare by reference
          // rather than by value)
          // TYPE ERROR
          var notes = computed(function () {
            return _this.notes(props.thisNote, props.previousNote).map(function (note) {
              return {
                note: note
              };
            });
          });

          if (notes().length === 1) {
            return _this.single(notes()[0].note, props);
          } else {
            var xOf = function xOf(noteObj) {
              return props.x() + notes().indexOf(noteObj) * props.gracenoteWidth() * 0.6 - props.gracenoteWidth() * 0.3;
            };

            var y = function y(note) {
              return computed(function () {
                return noteY(props.y(), note);
              });
            };

            return svg(_templateObject4(), [0, 2, 4].map(function (i) {
              return svg(_templateObject5(), xOf(notes()[0]) + _this.tailXOffset, xOf(notes()[notes().length - 1]) + _this.tailXOffset, props.y() - 3.5 * lineGap + i, props.y() - 3.5 * lineGap + i);
            }), map(notes, function (noteObj) {
              return _this.head(xOf(noteObj), y(noteObj.note)(), noteObj.note, props.y() - 3.5 * lineGap);
            }));
          }
        }
      }));
    };
  }

  _createClass(Gracenote, [{
    key: "single",
    value: function single(note, props) {
      var _this2 = this;

      var rad = function rad(n) {
        return n * Math.PI / 180;
      };

      var stemXOf = function stemXOf(x) {
        return x + 3;
      };

      var stemYOf = function stemYOf(y) {
        return y - 2;
      };

      var y = computed(function () {
        return noteY(props.y(), note);
      });
      return svg(_templateObject6(), computed(function () {
        return _this2.head(props.x(), y(), note, props.y() - 3 * lineGap);
      }), computed(function () {
        return stemXOf(props.x());
      }), computed(function () {
        return stemXOf(props.x());
      }), computed(function () {
        return stemYOf(y());
      }), computed(function () {
        return stemYOf(y()) - 20;
      }), [0, 1, 2].map(function (n) {
        return svg(_templateObject7(), computed(function () {
          return stemXOf(props.x());
        }), computed(function () {
          return stemXOf(props.x()) + 5;
        }), computed(function () {
          return stemYOf(y()) - 20 + 3 * n;
        }), computed(function () {
          return stemYOf(y()) - 16 + 3 * n;
        }));
      }));
    }
  }]);

  return Gracenote;
}();
},{"./all":"all.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "32947" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","Gracenote.ts"], null)
//# sourceMappingURL=/Gracenote.c8c8e4fb.js.map