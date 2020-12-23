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
})({"sinuous.js":[function(require,module,exports) {
var define;
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

!function (n, r) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? r(exports) : "function" == typeof define && define.amd ? define(["exports"], r) : r((n = n || self).window = n.window || {});
}(this, function (n) {
  function r() {
    return (r = Object.assign || function (n) {
      for (var r = 1; r < arguments.length; r++) {
        var t = arguments[r];

        for (var e in t) {
          Object.prototype.hasOwnProperty.call(t, e) && (n[e] = t[e]);
        }
      }

      return n;
    }).apply(this, arguments);
  }

  var t = function n(t, e, u, o) {
    for (var f = {}, i = function i(_i) {
      var a = e[_i],
          l = "number" == typeof a ? u[a] : a,
          s = e[++_i];
      if (1 === s) o[0] = l;else if (3 === s) o[1] = r(o[1] || {}, l);else if (5 === s) (o[1] = o[1] || {})[e[++_i]] = l;else if (6 === s) {
        var v = e[++_i],
            p = (o[1] = o[1] || {})[v],
            y = f[v];
        y || "function" != typeof l && "function" != typeof p || (y = p && [p] || [], o[1][v] = function () {
          for (var n = "", r = 0; r < y.length; r++) {
            n += "function" == typeof y[r] ? y[r].call(this) : y[r];
          }

          return c = _i, n;
        }), y ? y.push(l) : o[1][v] += l + "";
      } else if (s) {
        var d = function d() {
          return t.apply(null, n(t, l, u, ["", null]));
        };

        o.push("function" == typeof o[0] ? d : d());
      } else o.push(l);
      c = _i;
    }, c = 1; c < e.length; c++) {
      i(c);
    }

    return o;
  },
      e = function e(n) {
    for (var r, t, e = 1, u = "", o = "", f = [0], i = function i(n) {
      1 === e && (n || (u = u.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? f.push(n || u, 0) : 3 === e && (n || u) ? (f.push(n || u, 1), e = 2) : 2 === e && "..." === u && n ? f.push(n, 3) : 2 === e && u && !n ? f.push(!0, 5, u) : e >= 5 && ((u || !n && 5 === e) && (f.push(u, e, t), e = 6), n && (f.push(n, e, t), e = 6)), u = "";
    }, c = 0; c < n.length; c++) {
      c && (1 === e && i(), i(c));

      for (var a = 0; a < n[c].length; a++) {
        r = n[c][a], 1 === e ? "<" === r ? (i(), f = [f], e = 3) : u += r : 4 === e ? "--" === u && ">" === r ? (e = 1, u = "") : u = r + u[0] : o ? r === o ? o = "" : u += r : '"' === r || "'" === r ? o = r : ">" === r ? (i(), e = 1) : e && ("=" === r ? (e = 5, t = u, u = "") : "/" === r && (e < 5 || ">" === n[c][a + 1]) ? (i(), 3 === e && (f = f[0]), e = f, (f = f[0]).push(e, 2), e = 0) : " " === r || "\t" === r || "\n" === r || "\r" === r ? (i(), e = 2) : u += r), 3 === e && "!--" === u && (e = 4, f = f[0]);
      }
    }

    return i(), f;
  },
      u = new Map(),
      o = function o(n) {
    var r = u.get(this);
    return r || (r = new Map(), u.set(this, r)), (r = t(this, r.get(n) || (r.set(n, r = e(n)), r), arguments, [])).length > 1 ? r : r[0];
  },
      f = function f() {
    var n = o.apply(this, arguments);
    if (n) return Array.isArray(n) ? this(n) : "object" == _typeof(n) ? n : this([n]);
  };

  function i() {
    var n = f.bind(this);
    return (this.wrap || n).apply(n, arguments);
  }

  var c,
      a,
      l = [];

  function s(n) {
    var r = c,
        t = function t() {};

    c = t, b(t);
    var e = n(function () {
      w(t), c = void 0;
    });
    return c = r, e;
  }

  function v(n) {
    var r = c;
    c = void 0;
    var t = n();
    return c = r, t;
  }

  function p(n) {
    function r(t) {
      if (0 === arguments.length) return c && !r.__o.has(c) && (r.__o.add(c), c.u.push(r)), n;
      if (a) return r.t === l && a.push(r), r.t = t, t;
      n = t;
      var e = c;
      return c = void 0, r.o = new Set(r.__o), r.o.forEach(function (n) {
        return n.i = !1;
      }), r.o.forEach(function (n) {
        n.i || n();
      }), c = e, n;
    }

    return r.$o = 1, r.__o = new Set(), r.t = l, r;
  }

  function y(n, r) {
    function t() {
      var e = c;
      return c && c.__c.push(t), w(t), t.i = !0, c = t, r = n(r), c = e, r;
    }

    function e() {
      return t.i ? c && t.u.forEach(function (n) {
        return n();
      }) : r = t(), r;
    }

    return n.s = t, b(t), t(), e.$o = 1, e;
  }

  function d(n) {
    return c && c.l.push(n), n;
  }

  function h(n) {
    return y(n), function () {
      return w(n.s);
    };
  }

  function w(n) {
    n.__c.forEach(w), n.u.forEach(function (r) {
      r.__o.delete(n), r.o && r.o.delete(n);
    }), n.l.forEach(function (n) {
      return n();
    }), b(n);
  }

  function b(n) {
    n.u = [], n.__c = [], n.l = [];
  }

  var _ = {},
      m = [];

  function A(n) {
    return this.t && this.t[n.type](n);
  }

  _.h = function () {
    var r = Array.from(arguments);

    var e,
        u = function n(t) {
      if (null == t) ;else if ("string" == typeof t) e ? _.add(e, t) : e = _.s ? document.createElementNS("http://www.w3.org/2000/svg", t) : document.createElement(t);else if (Array.isArray(t)) e || (e = document.createDocumentFragment()), t.forEach(n);else if (t instanceof Node) e ? _.add(e, t) : e = t;else if ("object" == _typeof(t)) _.property(e, t, null, _.s);else if ("function" == typeof t) {
        if (e) {
          var u = _.add(e, "");

          _.insert(e, t, u);
        } else e = t.apply(null, r.splice(1));
      } else _.add(e, "" + t);
    };

    return r.forEach(u), e;
  }, _.insert = function (n, r, t, e, u) {
    return n = t && t.parentNode || n, u = u || e instanceof Node && e, r === e || (e && "string" != typeof e || !("string" == typeof r || "number" == typeof r && (r += "")) ? "function" == typeof r ? _.subscribe(function () {
      e = _.insert(n, r.call({
        el: n,
        endMark: t
      }), t, e, u);
    }) : (t ? e && (u || (u = e.o && e.o.nextSibling || t.previousSibling), _.rm(n, u, t)) : n.textContent = "", e = null, r && !0 !== r && (e = _.add(n, r, t))) : (null != e && n.firstChild ? t ? (t.previousSibling || n.lastChild).data = r : n.firstChild.data = r : t ? _.add(n, r, t) : n.textContent = r, e = r)), e;
  }, _.property = function (n, r, t, e, u) {
    if (null != r) if (!t || "attrs" === t && (e = !0)) for (t in r) {
      _.property(n, r[t], t, e, u);
    } else "o" !== t[0] || "n" !== t[1] || r.$o ? "function" == typeof r ? _.subscribe(function () {
      _.property(n, r.call({
        el: n,
        name: t
      }), t, e, u);
    }) : u ? n.style.setProperty(t, r) : e || "data-" === t.slice(0, 5) || "aria-" === t.slice(0, 5) ? n.setAttribute(t, r) : "style" === t ? "string" == typeof r ? n.style.cssText = r : _.property(n, r, null, e, !0) : ("class" === t && (t += "Name"), n[t] = r) : function (n, r, t) {
      r = r.slice(2).toLowerCase(), t ? n.addEventListener(r, A) : n.removeEventListener(r, A), (n.t || (n.t = {}))[r] = t;
    }(n, t, r);
  }, _.add = function (n, r, t) {
    var e = function (n) {
      var r = n.childNodes;
      if (r && 11 === n.nodeType) return r.length < 2 ? r[0] : {
        o: _.add(n, "", r[0])
      };
    }(r = function (n) {
      return "string" == typeof n ? document.createTextNode(n) : n instanceof Node ? n : _.h(m, n);
    }(r)) || r;

    return n.insertBefore(r, t && t.parentNode && t), e;
  }, _.rm = function (n, r, t) {
    for (; r && r !== t;) {
      var e = r.nextSibling;
      n === r.parentNode && n.removeChild(r), r = e;
    }
  }, _.subscribe = h, _.cleanup = d, _.root = s, _.sample = v, _.hs = function () {
    var n = _.s;
    _.s = !0;
    var r = j.apply(void 0, arguments);
    return _.s = n, r;
  };

  var g,
      j = function j() {
    var r = Array.from(arguments);
    return _.h.apply(_.h, r);
  },
      M = function M() {
    var r = Array.from(arguments);
    return _.hs.apply(_.hs, r);
  },
      N = {};

  function x(n) {
    return function () {
      if (g) return (n ? M : j).apply(null, arguments);
      var r;

      function t(u) {
        null == u || (u === N || "function" == typeof u ? r ? e(r, u) : r = {
          type: u,
          __c: []
        } : Array.isArray(u) ? (r = r || {
          __c: []
        }, u.forEach(t)) : "object" == _typeof(u) ? u.__c ? e(r, u) : r.__p = u : r ? e(r, {
          type: null,
          __p: u
        }) : r = {
          type: u,
          __c: []
        }), n && (r.t = n);
      }

      function e(n, r) {
        n.__c.push(r), r.o = n;
      }

      return Array.from(arguments).forEach(t), r;
    };
  }

  function F(n) {
    return Array.from(n.childNodes).filter(function (n) {
      return 3 !== n.nodeType || n.data.trim() || n.i;
    });
  }

  var S = x(),
      O = x(!0),
      $ = {
    __proto__: null,
    v: N,
    d: S,
    dhtml: function dhtml() {
      return i.apply(S, arguments);
    },
    ds: O,
    dsvg: function dsvg() {
      return i.apply(O, arguments);
    },
    hydrate: function n(r, t) {
      if (r) {
        "function" == typeof r.type && (r = r.type.apply(null, [r.__p].concat(r.__c.map(function (n) {
          return n();
        }))));
        var e,
            u,
            o = void 0 === r.type;
        return t || (t = document.querySelector(function n(r) {
          var t,
              u = "";
          if (r.__p && (t = r.__p.id)) u = "#";else if (r.__p && (t = r.__p.class)) u = ".";else if (!(t = r.type)) return e = !0, r.__c && n(r.__c[0]());
          return u + ("function" == typeof t ? t() : t).split(" ").map(function (n) {
            return n.replace(/([^\x80-\uFFFF\w-])/g, "\\$1");
          }).join(".");
        }(r))), [t, r.__p, r.__c || r].forEach(function t(f) {
          if (f instanceof Node) (u = f).u = u.u || 0;else if (Array.isArray(f)) f.forEach(t);else if (u) {
            var i,
                c,
                a,
                l,
                s,
                v = F(u)[u.u],
                p = function p(n) {
              u.u++, v.data.trim() !== n.trim() && (f.o.__c.length !== F(u).length && (v.splitText(v.data.indexOf(n) + n.length), i && (c = i.match(/^\s*/)[0])), v.data.trim() !== n.trim() && (v.data = n));
            };

            v && (f === N ? u.u++ : "object" == _typeof(f) && (null === f.type && 3 === v.nodeType ? (v.i = !0, p(f.__p)) : f.type && (n(f, v), u.u++))), "function" == typeof f ? (i = v ? v.data : void 0, c = "", _.subscribe(function () {
              g = a;
              var r = f();
              r && r.__c && (r = r.type ? r : r.__c);
              var t = "string" == typeof r || "number" == typeof r;
              r = t ? c + r : r, a || !v && !o ? i = _.insert(u, r, l, i, s) : (t ? p(r) : (Array.isArray(r) && (s = v, v = u), e && (v = u), n(r, v), i = []), l = !e && v ? _.add(u, "", F(u)[u.u]) : _.add(u.parentNode, "", u.nextSibling)), g = !1, a = !0;
            })) : "object" == _typeof(f) && (f.__c || _.property(u, f, null, r.t));
          }
        }), u;
      }
    }
  },
      k = self.S,
      C = {
    __proto__: null,
    hydrate: $,
    noConflict: function noConflict() {
      return self.S = k, self.sinuous;
    },
    html: function html() {
      return i.apply(j, arguments);
    },
    svg: function svg() {
      return i.apply(M, arguments);
    },
    h: j,
    hs: M,
    api: _,
    map: function map(n, r, t) {
      var e = _.root,
          u = _.subscribe,
          o = _.sample,
          f = _.cleanup;
      null == t && (t = !r.$t);

      var i = _.h([]),
          c = _.add(i, ""),
          a = new Map(),
          l = new Map(),
          s = new Set();

      function v(n, u) {
        if (null != n) {
          var o = l.get(n);
          return 1 === u ? (s.delete(n), o || (11 === (o = t ? e(function (t) {
            return a.set(n, t), r(n.$v || n);
          }) : r(n.$v || n)).nodeType && (o = function (n) {
            var r = n.childNodes,
                t = r.length;
            if (t < 2) return r[0];
            var e = Array.from(r);
            return {
              nodeType: 111,
              t: e[0],
              o: e[t - 1],
              l: function l() {
                if (r.length !== t) for (var u = 0; u < t;) {
                  n.appendChild(e[u++]);
                }
                return n;
              }
            };
          }(o) || o), l.set(n, o))) : -1 === u && s.add(n), function (n, r) {
            return 111 === n.nodeType ? 1 / r < 0 ? r ? _.rm(n.t.parentNode, n.t.nextSibling, n.o.nextSibling) || n.t : n.o : r ? n.l() : n.t : n;
          }(o, u);
        }
      }

      function p(n) {
        var r = a.get(n);
        r && (r(), a.delete(n)), l.delete(n);
      }

      return f(u(function (r) {
        var t = n();
        return o(function () {
          s.clear();
          var n = Array.from(function (n, r, t, e, u) {
            var o,
                f,
                i = new Map(),
                c = new Map();

            for (o = 0; o < r.length; o++) {
              i.set(r[o], o);
            }

            for (o = 0; o < t.length; o++) {
              c.set(t[o], o);
            }

            for (o = f = 0; o !== r.length || f !== t.length;) {
              var a = r[o],
                  l = t[f];
              if (null === a) o++;else if (t.length <= f) n.removeChild(e(r[o], -1)), o++;else if (r.length <= o) n.insertBefore(e(l, 1), e(r[o], 0) || u), f++;else if (a === l) o++, f++;else {
                var s = c.get(a),
                    v = i.get(l);
                void 0 === s ? (n.removeChild(e(r[o], -1)), o++) : void 0 === v ? (n.insertBefore(e(l, 1), e(r[o], 0) || u), f++) : (n.insertBefore(e(r[v], 1), e(r[o], 0) || u), r[v] = null, v > o + 1 && o++, f++);
              }
            }

            return t;
          }(c.parentNode, r || [], t, v, c));
          return s.forEach(p), n;
        });
      })), f(function () {
        a.forEach(function (n) {
          return n();
        }), a.clear(), l.clear(), s.clear();
      }), i;
    },
    S: y,
    cleanup: d,
    computed: y,
    isListening: function isListening() {
      return !!c;
    },
    o: p,
    observable: p,
    on: function on(n, r, t, e) {
      return n = [].concat(n), y(function (t) {
        n.forEach(function (n) {
          return n();
        });
        var u = t;
        return e || (u = v(function () {
          return r(t);
        })), e = !1, u;
      }, t);
    },
    root: s,
    sample: v,
    subscribe: h,
    transaction: function transaction(n) {
      var r = a;
      a = [];
      var t = n(),
          e = a;
      return a = r, e.forEach(function (n) {
        if (n.t !== l) {
          var r = n.t;
          n.t = l, n(r);
        }
      }), t;
    },
    unsubscribe: function unsubscribe(n) {
      w(n.s);
    }
  };
  n.S = C, n.sinuous = C;
});
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","sinuous.js"], null)
//# sourceMappingURL=/sinuous.eeeceb1b.js.map