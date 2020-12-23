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
})({"Note.ts":[function(require,module,exports) {
"use strict";
/*

class Note {
  // TODO gaps between notes still not right (e.g. set all to doublings in a bar, or have two high As after each other)
  // todo rests - by using a note of the form { note: 'R', ... }
  // type NoteObj = { note: Pitch, length: number, gracenote: Gracenote | null }
  // notes: []NoteObj
  notes = o([]);

  tailGap = 5;
  shortTailLength = 10;

  draggedNote = o(null);
  selectedNotes = o([]);
  eventListener = null;

  numberOfNotes = computed(() => this.notes().length);

  // prevNote: Pitch
  noteAndGracenoteWidth = (notes, gracenoteRatio, prevNote = null) => notes.map((n,i) => 1 + ((n.note === 'R' || n.gracenote === null)
    ? 0
    : gracenoteRatio * n.gracenote.numberOfNotes(n.note, i === 0 ? prevNote : notes[i - 1].note)())
    ).reduce((a,b) => a + b,0);

  totalBeatWidth = previousNote => computed(() => this.noteAndGracenoteWidth(this.notes(), gracenoteToNoteWidthRatio, previousNote));

  subscribeToMouse = () => null;
  unsubscribeToMouse = () => null;
  mouseSubFn = null;

  constructor(sub,unsub) {
    this.subscribeToMouse = sub;
    this.unsubscribeToMouse = unsub;
    this.notes([{ note: 'G', length: 1, gracenote: new Gracenote() }])
    //this.notes([{ note: 'G', length: 0.375, gracenote: new Gracenote() }, { note: 'R', length: 0.5, gracenote: new Gracenote(sub, unsub) }, { note: 'A', length: 0.125, gracenote: new Gracenote()}]);
    //this.notes([{ note: 'R', length: 1, gracenote: null }]);


    on('delete-selected-note', () => {
      let notes = this.notes();
      // has to be replaced with null then removed all at the // same way so that the later indices in selectedNotes
      // are still valid
      this.selectedNotes().forEach(n => notes[n] = null);
      notes = notes.filter(n => n !== null);
      this.notes(notes);
      this.deselect();
    })
  }


  beamFrom = (x1,y1, x2,y2, length1,length2) => {
    // draw beams from note1 at x1,y1 to note2 x2,y2
    // where note1 is length1 long and note2 is length2
    const leftIs1 = computed(() => x1() < x2());
    const leftLength = computed(() => leftIs1() ? length1 : length2);
    const rightLength = computed(() => leftIs1() ? length2 : length1);
    const xL = computed(() => leftIs1() ? x1() : x2());
    const xR = computed(() => leftIs1() ? x2() : x1());
    const yL = computed(() => leftIs1() ? y1() : y2());
    const yR = computed(() => leftIs1() ? y2() : y1());
    // log laws! :)
    const leftTails = computed(() => Math.ceil(Math.log(1 / leftLength()) / Math.log(2)));
    const rightTails = computed(() => Math.ceil(Math.log(1 / rightLength()) / Math.log(2)));


    const diffIsL = computed(() => leftTails() > rightTails());

    // tails shared by both notes
    const sharedTails = computed(() => diffIsL() ? [...Array(rightTails()).keys()] : [...Array(leftTails()).keys()]);
    // tails extra tails for one note
    const diffTails = computed(() => diffIsL() ? [...Array(leftTails()).keys()].splice(rightTails()) : [...Array(rightTails()).keys()].splice(leftTails()));

    const tailEndY = computed(() =>
      diffIsL()
      // because similar triangles
        ? yL() + this.shortTailLength / (xR() - xL()) * (yR() - yL())
        : yR() - this.shortTailLength / (xR() - xL()) * (yR() - yL()));
    

    return svg`<g class="tails">
      ${map(sharedTails,
        i =>
          svg`<line
            x1=${xL}
            x2=${xR}
            y1=${computed(() => yL() - i * this.tailGap)}
            y2=${computed(() => yR() - i * this.tailGap)}
            stroke="black"
            stroke-width="2" />`
            )}
      ${map(diffTails,
        i =>
          svg`<line
            x1=${computed(() => diffIsL() ? xL() : xR())}
            x2=${computed(() => diffIsL() ? xL() + this.shortTailLength : xR() - this.shortTailLength)}
            y1=${computed(() => (diffIsL() ? yL() : yR()) - i * this.tailGap)}
            y2=${computed(() => tailEndY() - i * this.tailGap)}
            stroke="black"
            stroke-width="2" />`
            )}
    </g>`;
  }
  setNote = (i, note) => {
    // params: i int, note G | A | B | ...
    // set a note to the note given
    const newNotes = this.notes().slice();
    if (i != null) newNotes[i] = { ...newNotes[i], note: note };
    (i != null) ? this.notes(newNotes) : this.notes([{ note: note, length: 1, gracenote: new Gracenote() }]);
  }
  validNoteLengths = (notes) =>
    notes.reduce((a,b) => { length: a.length + b.length },{ length: 0 }) === this.length;
  
  changeNoteLength = (i,newLength) => {
    const newNotes = this.notes().slice();
    const oldNote = newNotes[i];
    newNotes[i] = { ...oldNote, length: newLength };

    this.notes(newNotes);
  }

  select = (i) => {
    if (!this.selectedNotes().includes(i)) this.selectedNotes([...this.selectedNotes(), i])
    on('deselect-all-notes', this.deselect);
  }
  deselect = () => {
    this.selectedNotes([]);
    removeEvent('deselect-all-notes', this.deselect);
  }

  click = (i, event) => {
    // drag note at index i in this.notes()
    // and add event listener for dragging
    if (!event.shiftKey) {
      dispatchEvent('deselect-all-notes');
      this.draggedNote(i);
      this.mouseSubFn = n => this.setNote(i,n)
      this.subscribeToMouse(this.mouseSubFn);
    }
    this.select(i);
    document.addEventListener('mouseup', this.unclick);
  }
  unclick = () => {
    // deselect note and remove event listener started
    // by this.select(i)
    this.draggedNote(null);
    document.removeEventListener('mouseup', this.unclick);
    this.unsubscribeToMouse(this.mouseSubFn);
  }
  noteHead = (x,y, note,selected, mousedown,mouseup) => {
    // Draw note head, ledger line and dot
    const noteWidth = 5;
    const noteHeight = 4;
    const rotation = 30;

    const clickableWidth = 14;
    const clickableHeight = 12;

    const hasDot = (Math.log(note.length) / Math.log(2)) % 1 !== 0;
    const dotYOffset = (['G','B','D','F','HA'].includes(note.note)) ? -3 : 0;
    const dotXOffset = 10;
    const dragged = computed(() => this.draggedNote() === this.notes().indexOf(note));


    // pointer events must be set so that if it is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)
    const pointerEvents = computed(() => dragged() ? 'none' : 'visiblePainted');

    const filled = note.length < 1.5; // shorter than a dotted crotchet

    const rotateText = computed(() => "30deg " + Math.round(x()) + " " + Math.round(y()));

    const colour = computed(() => selected() ? "orange" : "black");

    return svg`<g class="note-head">
      <ellipse cx=${x} cy=${y} rx="5" ry="4" stroke=${colour} fill=${computed(() => filled ? colour : "white")} transform=${computed(() => `rotate(30 ${x()} ${y()})`)} pointer-events=${pointerEvents} />

      ${hasDot ? svg`<circle cx=${computed(() => x() + dotXOffset)} cy=${computed(() => y() + dotYOffset)} r="1.5" fill=${colour} pointer-events="none" />` : null}

      ${(note.note === 'HA') ? svg`<line class="ledger" x1=${computed(() => x() - 8)} x2=${computed(() => x() + 8)} y1=${y} y2=${y} stroke=${colour} pointer-events="none" />` : null}


      <rect x=${computed(() => x() - clickableWidth / 2)} y=${computed(() => y() - clickableHeight / 2)} width=${clickableWidth} height=${clickableHeight} onmousedown=${mousedown} onmouseup=${mouseup} pointer-events=${pointerEvents} opacity="0"/>
    </g>`;
  }


  singleton = (note,lastNote, x,y, noteWidth,numberOfTails) => {
    const stemX = computed(() => x() - 5);
    const stemY = computed(() => noteOffset(y) + 30);

    return svg`
      ${note.gracenote === null ? null : svg`<${note.gracenote.render} x=${x} y=${y} gracenoteWidth=${computed(() => noteWidth * 0.6)} thisNote=${note.note} previousNote=${lastNote} />`}

      ${this.noteHead(x, computed(() => noteY(y(), note.note)), note,computed(() => this.selectedNotes().includes(this.notes().indexOf(note))), e => this.click(0, e), this.unclick)}
      ${(note.length > 3) ? null : svg`<line
        x1=${stemX}
        x2=${stemX}
        y1=${y}
        y2=${stemY}
        stroke="black"
        />`}
      ${numberOfTails > 0 ? svg`<g class="tails">
        ${[...Array(numberOfTails).keys()].map(t => svg`<line x1=${stemX} x2=${computed(() => stemX() + 10)} y1=${computed(() => stemY() - 5 * t)} y2=${computed(() => stemY() - 5 * t - 10)} stroke="black" />`)}
      </g>` : null}
    `;
  }

  render = (props) => {
    // render self

    // takes a note and returns not the actual index, but the index including
    // gracenoteToNoteWidthRatio * all the gracenotes up to it
    // useful for x calculations

    const lastNote = computed(() => props.previousNote() ? props.previousNote() : null);
    const relativeIndexOfGracenote = note => computed(() => this.noteAndGracenoteWidth(this.notes().slice().splice(0,this.notes().indexOf(note)), gracenoteToNoteWidthRatio, lastNote()));
    const relativeIndexOf = note => computed(() => relativeIndexOfGracenote(note)() + gracenoteToNoteWidthRatio * (note.gracenote === null ? 0 : note.gracenote.numberOfNotes(note.note, this.notes().indexOf(note) === 0 ? lastNote() : this.notes()[this.notes().indexOf(note) - 1].note)()));
    const xOf = note => computed(() => props.x() + relativeIndexOf(note)() * props.noteWidth());
    const yOf = note => computed(() => noteY(props.y(), note.note));

    const stemXOf = note => computed(() => xOf(note)() - 5);

    return svg`<g class="note">
      ${computed(() => {
        if (this.numberOfNotes() === 1 && this.notes()[0].note === 'R') {
          return svg`<g class="rest">
            <circle cx=${props.x} cy=${props.y} r="10" fill="red" />
          </g>`

        } else if (this.numberOfNotes() === 1) {
          const note = this.notes()[0];
          const numberOfTails = Math.ceil(-1 * Math.log(note.length) / Math.log(2));
          return this.singleton(note,lastNote(),props.x,props.y,props.noteWidth(),numberOfTails);

/*
      return svg`
        ${note.gracenote === null ? null : svg`<${note.gracenote.render} x=${computed(() => props.x() + props.noteWidth() * relativeIndexOfGracenote(note)())} y=${props.y} gracenoteWidth=${computed(() => props.noteWidth() * 0.6)} thisNote=${computed(() => this.notes()[0].note)} previousNote=${lastNote} />`}

        ${this.noteHead(xOf(note), computed(() => noteY(props.y(), note.note)), note,computed(() => this.selectedNotes().includes(this.notes().indexOf(note))), e => this.click(0, e), this.unclick)}
        ${(note.length > 3) ? null : svg`<line
          x1=${stemXOf(note)}
          x2=${stemXOf(note)}
          y1=${yOf(note)}
          y2=${stemYOf(note)}
          stroke="black"
          />`}
        ${numberOfTails > 0 ? svg`<g class="tails">
          ${[...Array(numberOfTails).keys()].map(t => svg`<line x1=${stemXOf(note)} x2=${computed(() => stemXOf(note)() + 10)} y1=${computed(() => stemYOf(note)() - 5 * t)} y2=${computed(() => stemYOf(note)() - 5 * t - 10)} stroke="black" />`)}
        </g>` : null}
      `;
      * /

        } else {
          const cap = (n, cap) =>
            (n > cap) ? cap :
            (n < -cap) ? -cap :
            n;

          const diff = computed(() => cap(
            // todo cap should be dependent on how many notes are in the group
            // difference between first and last notes in a group
            noteOffset(this.notes()[this.notes().length - 1].note)
            - noteOffset(this.notes()[0].note
            ), 10));
          
          const multipleLowest = o(false);

          const lowestNote = computed(() => {
            let multiple = false;
            let lowestNote = this.notes().reduce((last,next) => {
              if (noteOffset(next.note) === noteOffset(last.note)) {
                multiple = true;
                return last;
              } else if (noteOffset(next.note) > noteOffset(last.note)) {
                multiple = false;
                return next;
              } else {
                return last;
              }
            });
            if (multiple) {
              multipleLowest(true);
            }
            return lowestNote;
          });

          const stemOffset = note => computed(() => {
            return (noteOffset(lowestNote().note) - noteOffset(note.note));
          });

          const diffForLowest = computed(() => 30 + noteOffset(lowestNote().note) - (multipleLowest ? 0 : diff() * relativeIndexOf(lowestNote())() / this.totalBeatWidth(props.previousNote())()));

          const stemYOf = note => computed(() => {
            return props.y()
              + (multipleLowest()
                // straight line if there is more than one lowest note
                ? 0
                // otherwise use a slant
                : diff() * relativeIndexOf(note)() / this.totalBeatWidth(props.previousNote())())
              // offset so that the lowest note is always a constant height
              + diffForLowest();
          });
          // Intentional double equals (array out of bounds)
          const notANote = note => note == null || note.note === 'R';

          const isSingleton = note => computed(() => !(notANote(this.notes()[this.notes().indexOf(note) - 1]) || notANote(this.notes()[this.notes().indexOf(note) + 1])));


          return svg`
            <g class="grouped-notes">
              ${map(
                this.notes,
                note => {
                  let previousNote = computed(() => this.notes()[this.notes().indexOf(note) - 1]);

                  return svg`<g class="grouped-note">
                      ${note.gracenote === null ? null : svg`<${note.gracenote.render} x=${computed(() => props.x() + props.noteWidth() * relativeIndexOfGracenote(note)())} y=${props.y} gracenoteWidth=${computed(() => props.noteWidth() * 0.6)} thisNote=${computed(() => this.notes()[this.notes().indexOf(note)].note)} previousNote=${this.notes()[this.notes().indexOf(note) - 1] ? o(this.notes()[this.notes().indexOf(note) - 1].note) : lastNote} />`}

                      ${computed(() => this.noteHead(xOf(note), yOf(note), note,computed(() => this.selectedNotes().includes(this.notes().indexOf(note))), e => this.click(this.notes().indexOf(note),  e), this.unclick))}

                      ${
                        computed(() => previousNote() ? this.beamFrom(stemXOf(note),stemYOf(note), stemXOf(previousNote()),stemYOf(previousNote()), note.length, previousNote().length) : null)
                      }

                      <line
                        x1=${stemXOf(note)}
                        x2=${stemXOf(note)}
                        y1=${yOf(note)}
                        y2=${stemYOf(note)}
                        stroke="black"
                        />
                    </g>`
                }
              )}
            </g>`;
        }
      })}
    </g>`;

  }
}
*/

var _this = this;

function _templateObject13() {
  var data = _taggedTemplateLiteral(["<g class=\"grouped-note\">\n                  ", "\n\n                  ", "\n\n                  ", "\n\n                  <line\n                    x1=", "\n                    x2=", "\n                    y1=", "\n                    y2=", "\n                    stroke=\"black\"\n                    />\n                </g>"]);

  _templateObject13 = function _templateObject13() {
    return data;
  };

  return data;
}

function _templateObject12() {
  var data = _taggedTemplateLiteral(["\n        <g class=\"grouped-notes\">\n          ", "\n        </g>"]);

  _templateObject12 = function _templateObject12() {
    return data;
  };

  return data;
}

function _templateObject11() {
  var data = _taggedTemplateLiteral(["<g class=\"rest\">\n        <circle cx=", " cy=", " r=\"10\" fill=\"red\" />\n      </g>"]);

  _templateObject11 = function _templateObject11() {
    return data;
  };

  return data;
}

function _templateObject10() {
  var data = _taggedTemplateLiteral(["<line x1=", " x2=", " y1=", " y2=", " stroke=\"black\" />"]);

  _templateObject10 = function _templateObject10() {
    return data;
  };

  return data;
}

function _templateObject9() {
  var data = _taggedTemplateLiteral(["<g class=\"tails\">\n        ", "\n      </g>"]);

  _templateObject9 = function _templateObject9() {
    return data;
  };

  return data;
}

function _templateObject8() {
  var data = _taggedTemplateLiteral(["<line\n        x1=", "\n        x2=", "\n        y1=", "\n        y2=", "\n        stroke=\"black\"\n        />"]);

  _templateObject8 = function _templateObject8() {
    return data;
  };

  return data;
}

function _templateObject7() {
  var data = _taggedTemplateLiteral(["\n      ", "\n\n      ", "\n      ", "\n      ", "\n    "]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = _taggedTemplateLiteral(["<line class=\"ledger\" x1=", " x2=", " y1=", " y2=", " stroke=", " pointer-events=\"none\" />"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = _taggedTemplateLiteral(["<circle cx=", " cy=", " r=\"1.5\" fill=", " pointer-events=\"none\" />"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = _taggedTemplateLiteral(["<g class=\"note-head\">\n      <ellipse cx=", " cy=", " rx=\"5\" ry=\"4\" stroke=", " fill=", " transform=", " pointer-events=", " />\n\n      ", "\n\n      ", "\n\n\n      <rect x=", " y=", " width=", " height=", " onmousedown=", " onmouseup=", " pointer-events=", " opacity=\"0\"/>\n    </g>"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = _taggedTemplateLiteral(["<line\n            x1=", "\n            x2=", "\n            y1=", "\n            y2=", "\n            stroke=\"black\"\n            stroke-width=\"2\" />"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["<line\n            x1=", "\n            x2=", "\n            y1=", "\n            y2=", "\n            stroke=\"black\"\n            stroke-width=\"2\" />"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["<g class=\"tails\">\n      ", "\n      ", "\n    </g>"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Note = {
  noteAndGracenoteWidth: function noteAndGracenoteWidth(notes, gracenoteRatio) {
    var prevNote = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    return notes.map(function (n, i) {
      return 1 + (n.note === 'R' || n.gracenote === null) ? 0 : gracenoteRatio * Gracenote.numberOfNotes(n.gracenote, n.note, i === 0 ? prevNote : notes[i - 1].note);
    }).reduce(function (a, b) {
      return a + b;
    });
  },
  totalBeatWidth: function totalBeatWidth(note, previousNote) {
    return Note.noteAndGracenoteWidth(note.notes, gracenoteToNoteWidthRatio, previousNote);
  },
  lastNoteOfWholeNote: function lastNoteOfWholeNote(wholeNote) {
    return wholeNote ? wholeNote.notes[wholeNote.notes.length - 1].note : null;
  },
  numberOfNotes: function numberOfNotes(note) {
    return note.notes.length;
  },
  beamFrom: function beamFrom(x1, y1, x2, y2, length1, length2) {
    // draw beams from note1 at x1,y1 to note2 x2,y2
    // where note1 is length1 long and note2 is length2
    var leftIs1 = x1 < x2;
    var leftLength = leftIs1 ? length1 : length2;
    var rightLength = leftIs1 ? length2 : length1;
    var xL = leftIs1 ? x1 : x2;
    var xR = leftIs1 ? x2 : x1;
    var yL = leftIs1 ? y1 : y2;
    var yR = leftIs1 ? y2 : y1; // log laws! :)

    var leftTails = Math.ceil(Math.log(1 / leftLength) / Math.log(2));
    var rightTails = Math.ceil(Math.log(1 / rightLength) / Math.log(2));
    var diffIsL = leftTails > rightTails; // tails shared by both notes

    var sharedTails = diffIsL ? _toConsumableArray(Array(rightTails).keys()) : _toConsumableArray(Array(leftTails).keys()); // tails extra tails for one note

    var diffTails = diffIsL ? _toConsumableArray(Array(leftTails).keys()).splice(rightTails) : _toConsumableArray(Array(rightTails).keys()).splice(leftTails);
    var tailEndY = diffIsL // because similar triangles
    ? yL + _this.shortTailLength / (xR - xL) * (yR - yL) : yR - _this.shortTailLength / (xR - xL) * (yR - yL);
    return svg(_templateObject(), sharedTails.map(function (i) {
      return svg(_templateObject2(), xL, xR, yL - i * _this.tailGap, yR - i * _this.tailGap);
    }), diffTails.map(function (i) {
      return svg(_templateObject3(), diffIsL ? xL : xR, diffIsL ? xL + _this.shortTailLength : xR - _this.shortTailLength, (diffIsL ? yL : yR) - i * _this.tailGap, tailEndY - i * _this.tailGap);
    }));
  },
  noteHead: function noteHead(x, y, note, noteIndex, selected, mousedown, mouseup) {
    // Draw note head, ledger line and dot
    var noteWidth = 5;
    var noteHeight = 4;
    var rotation = 30;
    var clickableWidth = 14;
    var clickableHeight = 12;
    var hasDot = Math.log(note.length) / Math.log(2) % 1 !== 0;
    var dotYOffset = ['G', 'B', 'D', 'F', 'HA'].includes(note.note) ? -3 : 0;
    var dotXOffset = 10;
    var dragged = _this.draggedNote === noteIndex; // pointer events must be set so that if it is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)

    var pointerEvents = dragged ? 'none' : 'visiblePainted';
    var filled = note.length < 1.5; // shorter than a dotted crotchet

    var rotateText = "30deg " + Math.round(x) + " " + Math.round(y);
    var colour = selected ? "orange" : "black";
    return svg(_templateObject4(), x, y, colour, filled ? colour : "white", "rotate(30 ".concat(x, " ").concat(y, ")"), pointerEvents, hasDot ? svg(_templateObject5(), x + dotXOffset, y + dotYOffset, colour) : null, note.note === 'HA' ? svg(_templateObject6(), x - 8, x + 8, y, y, colour) : null, x - clickableWidth / 2, y - clickableHeight / 2, clickableWidth, clickableHeight, mousedown, mouseup, pointerEvents);
  },
  singleton: function singleton(note, noteIndex, lastNote, x, y, noteWidth, numberOfTails) {
    var stemX = x - 5;
    var stemY = noteOffset(y) + 30;
    var gracenoteProps = {
      x: x,
      y: y,
      gracenoteWidth: noteWidth * 0.6,
      thisNote: note.note,
      previousNote: lastNote
    };
    return svg(_templateObject7(), note.gracenote === null ? null : Gracenote.render(note.gracenote, gracenoteProps), _this.noteHead(x, noteY(y, note.note), note, _this.selectedNotes.includes(noteIndex), function (e) {
      return _this.click(0, e);
    }, _this.unclick), note.length > 3 ? null : svg(_templateObject8(), stemX, stemX, y, stemY), numberOfTails > 0 ? svg(_templateObject9(), _toConsumableArray(Array(numberOfTails).keys()).map(function (t) {
      return svg(_templateObject10(), stemX, stemX + 10, stemY - 5 * t, stemY - 5 * t - 10);
    })) : null);
  },
  render: function render(note, props) {
    // takes a note and returns not the actual index, but the index including
    // gracenoteToNoteWidthRatio * all the gracenotes up to it
    // useful for x calculations
    var lastNote = props.previousNote || null;

    var relativeIndexOfGracenote = function relativeIndexOfGracenote(note, index) {
      return Note.noteAndGracenoteWidth(note.notes.slice().splice(0, index), gracenoteToNoteWidthRatio, lastNote);
    };

    var relativeIndexOf = function relativeIndexOf(note, index) {
      return relativeIndexOfGracenote(note, index) + gracenoteToNoteWidthRatio * (note.gracenote === null ? 0 : note.gracenote.numberOfNotes(note.note, index === 0 ? lastNote : note.notes[index - 1].note));
    };

    var xOf = function xOf(note, noteIndex) {
      return props.x + relativeIndexOf(note, noteIndex) * props.noteWidth;
    };

    var yOf = function yOf(note) {
      return noteY(props.y, note.note);
    };

    var stemXOf = function stemXOf(note) {
      return xOf(note) - 5;
    };

    if (Note.numberOfNotes(note) === 1 && note.notes[0].note === 'R') {
      return svg(_templateObject11(), props.x, props.y);
    } else if (_this.numberOfNotes === 1) {
      var _note = _note.notes[0];
      var numberOfTails = Math.ceil(-1 * Math.log(_note.length) / Math.log(2));
      return Note.singleton(_note, 0, lastNote, props.x, props.y, props.noteWidth, numberOfTails);
    } else {
      var cap = function cap(n, _cap) {
        return n > _cap ? _cap : n < -_cap ? -_cap : n;
      };

      var diff = cap( // todo cap should be dependent on how many notes are in the group
      // difference between first and last notes in a group
      noteOffset(note.notes[note.notes.length - 1].note) - noteOffset(note.notes[0].note), 10);
      var multiple = false;
      var lowestNote = note.notes.reduce(function (last, next) {
        if (noteOffset(next.note) === noteOffset(last.note)) {
          multiple = true;
          return last;
        } else if (noteOffset(next.note) > noteOffset(last.note)) {
          multiple = false;
          return next;
        } else {
          return last;
        }
      });
      var multipleLowest = multiple;

      var stemOffset = function stemOffset(note) {
        return noteOffset(lowestNote.note) - noteOffset(note.note);
      };

      var diffForLowest = 30 + noteOffset(lowestNote.note) - (multipleLowest ? 0 : diff * relativeIndexOf(lowestNote) / Note.totalBeatWidth(note, props.previousNote));

      var stemYOf = function stemYOf(note) {
        return props.y() + (multipleLowest() // straight line if there is more than one lowest note
        ? 0 // otherwise use a slant
        : diff * relativeIndexOf(note) / Note.totalBeatWidth(note, props.previousNote)) // offset so that the lowest note is always a constant height
        + diffForLowest;
      }; // Intentional double equals (array out of bounds)


      var notANote = function notANote(note) {
        return note == null || note.note === 'R';
      };

      var isSingleton = function isSingleton(note, index) {
        return !(notANote(note.notes[index - 1]) || notANote(note.notes[index + 1]));
      };

      return svg(_templateObject12(), note.notes.map( // todo replace all note with shortNote
      function (shortNote, index) {
        var previousNote = note.notes[index - 1];
        var gracenoteProps = {
          x: props.x + props.noteWidth * relativeIndexOfGracenote(shortNote),
          y: props.y,
          gracenoteWidth: props.noteWidth * 0.6,
          thisNote: shortNote.note,
          previousNote: previousNote ? previousNote.note : lastNote
        };
        return svg(_templateObject13(), shortNote.gracenote === null ? null : Gracenote.render(shortNote.gracenote, gracenoteProps),
        /*todo*/
        Note.noteHead(xOf(shortNote), yOf(shortNote), shortNote, props.selectedNotes.includes(index), function (e) {
          return Note.click(index, e);
        }, Note.unclick), computed(function () {
          return previousNote() ? _this.beamFrom(stemXOf(shortNote), stemYOf(shortNote), stemXOf(previousNote()), stemYOf(previousNote()), shortNote.length, previousNote().length) : null;
        }), stemXOf(shortNote), stemXOf(shortNote), yOf(shortNote), stemYOf(shortNote));
      }));
    }
  },
  init: function init() {
    return {
      notes: [{
        note: 'A'
      }]
    };
  }
};
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
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","Note.ts"], null)
//# sourceMappingURL=/Note.55a0e3b2.js.map