//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  Documentation - explanations for the UI that are shown on hover.

export type Documentation = {
  home: string;
  help: string;
  save: string;
  sb: string;
  m: string;
  c: string;
  q: string;
  sq: string;
  ssq: string;
  hdsq: string;
  dot: string;
  tie: string;
  'second-timing': string;
  'single-timing': string;
  'edit-second-timing': string;
  triplet: string;
  natural: string;
  delete: string;
  copy: string;
  paste: string;
  undo: string;
  redo: string;
  single: string;
  doubling: string;
  'half-doubling': string;
  'throw-d': string;
  grip: string;
  birl: string;
  'g-gracenote-birl': string;
  'g-strike': string;
  shake: string;
  'c-shake': string;
  taorluath: string;
  crunluath: string;
  edre: string;
  bubbly: string;
  'add-bar-before': string;
  'add-bar-after': string;
  'edit-bar-time-signature': string;
  'reset-bar-length': string;
  'normal-barline': string;
  'repeat-barline': string;
  'part-barline': string;
  'add-lead-in-before': string;
  'add-lead-in-after': string;
  'add-stave-before': string;
  'add-stave-after': string;
  'delete-stave': string;
  'add-harmony': string;
  'add-harmony-to-all': string;
  'remove-harmony': string;
  'set-stave-gap': string;
  'reset-stave-gap': string;
  'add-tune-before': string;
  'add-tune-after': string;
  'set-tune-gap': string;
  'reset-tune-gap': string;
  'delete-tune': string;
  'add-text': string;
  'centre-text': string;
  'edit-text': string;
  'set-text-coords': string;
  play: string;
  'play-from-selection': string;
  'play-looping-selection': string;
  stop: string;
  'playback-speed': string;
  'harmony-volume': string;
  export: string;
  'export-bww': string;
  download: string;
  landscape: string;
  portrait: string;
  'page-numbers': string;
  'disable-help': string;
  zoom: string;
  'number-of-pages': string;
  'move-bar-to-previous-line': string;
  'move-bar-to-next-line': string;
  'nothing-hovered': string;
};

export type TextItems = {
  homeMenu: string;
  noteMenu: string;
  gracenoteMenu: string;
  barMenu: string;
  secondTimingMenu: string;
  staveMenu: string;
  tuneMenu: string;
  textMenu: string;
  playbackMenu: string;
  documentMenu: string;
  settingsMenu: string;
  helpMenu: string;
  addNote: string;
  modifyNote: string;
  addGracenote: string;
  addBar: string;
  addBarBefore: string;
  addBarAfter: string;
  addLeadIn: string;
  addLeadInBefore: string;
  addLeadInAfter: string;
  modifyBar: string;
  editTimeSignature: string;
  resetBarLength: string;
  modifyBarlines: string;
  start: string;
  end: string;
  normalBarline: string;
  repeatBarline: string;
  partBarline: string;
  moveBar: string;
  moveToPreviousStave: string;
  moveToNextStave: string;
  addTiming: string;
  addSecondTiming: string;
  addSingleTiming: string;
  modifyTiming: string;
  editTimingText: string;
  addStave: string;
  before: string;
  after: string;
  modifyStave: string;
  adjustStaveGap: string;
  reset: string;
  deleteStave: string;
  delete: string;
  harmonyStave: string;
  addHarmony: string;
  addHarmonyToAll: string;
  deleteHarmony: string;
  addTune: string;
  modifyTune: string;
  adjustGapBeforeTune: string;
  deleteTune: string;
  addTextBox: string;
  modifyTextBox: string;
  centreText: string;
  editText: string;
  setTextBoxPosition: string;
  x: string;
  y: string;
  controls: string;
  playFromBeginning: string;
  playFromSelection: string;
  playLoopedSelection: string;
  stop: string;
  playbackOptions: string;
  beatsPerMinute: string;
  harmonyVolume: string;
  orientation: string;
  landscape: string;
  portrait: string;
  pageNumbers: string;
  showPageNumbers: string;
  export: string;
  exportPDF: string;
  exportBWW: string;
  download: string;
  staveLayout: string;
  gapBetweenLines: string;
  harmonyGap: string;
  gracenoteLayout: string;
  gapAfterGracenote: string;
  margins: string;
  margin: string;
  view: string;
  disableHelp: string;
  save: string;
  allChangesSaved: string;
  unsavedChanges: string;
  instrumentPC: string;
  instrumentPipes: string;
  instrument: string;
};
