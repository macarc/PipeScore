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

import type { Documentation, TextItems } from '.';

export const EnglishDocumentation: Documentation = {
  home: 'Go back to the scores page.',
  help: 'View the help page.',
  save: 'Save the score. PipeScore also automatically saves the score every minute.',
  sb: "Click to start inputting semibreve notes. You can also select a note that's already on the score and press this to change it to a semibreve.",
  m: "Click to start inputting minim notes. You can also select a note that's already on the score and press this to change it to a minim.",
  c: "Click to start inputting crotchet notes. You can also select a note that's already on the score and press this to change it to a crotchet.",
  q: "Click to start inputting quaver notes. You can also select a note that's already on the score and press this to change it to a quaver.",
  sq: "Click to start inputting semiquaver notes. You can also select a note that's already on the score and press this to change it to a semiquaver.",
  ssq: "Click to start inputting demisemiquaver notes. You can also select a note that's already on the score and press this to change it to a demisemiquaver.",
  hdsq: "Click to start inputting hemidemisemiquaver notes. You can also select a note that's already on the score and press this to change it to a hemidemisemiquaver.",
  dot: "Add a dot to the selected note, or to the length of the note that you're currently inputting. If there is already a dot, this removes it.",
  tie: 'Tie the selected note to the note before it.',
  'second-timing':
    'Add a 1st/2nd timing. Select the start of where the first timing should go and press this, then drag to change the position.',
  'single-timing':
    'Add a 2nd timing. Select the start of where the timing should go and press this, then drag to change the position.',
  'edit-second-timing': 'Edit the text of a timing.',
  triplet: 'Make the three selected notes into a triplet.',
  natural:
    'Add/remove a natural mark to a note. This only applies to C and F notes.',
  delete:
    'Delete the current selected note, gracenote, text or bar. For gracenotes, clicking the beam at the top will select the entire gracenote, or clicking the head will select a single note from the gracenote. To delete a stave, delete all the bars in it.',
  copy: 'Copy the current selected notes (or bars). To select notes, click on the first note to select then hold shift and click the last note you want to select.',
  paste: "Paste any notes that you've copied.",
  undo: 'Undo the last action that changed the score.',
  redo: 'Redo the last action that you undid.',
  single:
    'Add a single gracenote to the selected note. Alternatively, you can press this button, and then use the mouse to place the gracenote where you want on the score.',
  doubling:
    'Add a doubling to the selected note. Alternatively, you can click this button then click all the notes that you want to add a doubling to.',
  'half-doubling':
    'Add a half-doubling to the selected note. Alternatively, you can click this button then click all the notes that you want to add a half-doubling to.',
  'throw-d':
    'Add a throw on D to the selected note. Alternatively, you can click this button then click all the notes that you want to add a throw on D to.',
  grip: 'Add a grip to the selected note. Alternatively, you can click this button then click all the notes that you want to add a grip to.',
  birl: 'Add a birl to the selected note. Alternatively, you can click this button then click all the notes that you want to add a birl to.',
  'g-gracenote-birl':
    'Add a G gracenote birl to the selected note. Alternatively, you can click this button then click all the notes that you want to add a G gracenote birl to.',
  'g-strike':
    'Add a gracenote strike to the selected note. Alternatively, you can click this button then click all the notes that you want to add a gracenote strike to.',
  shake:
    'Add a shake to the selected note. Alternatively, you can click this button then click all the notes that you want to add a shake to.',
  'c-shake':
    'Add a light shake to the selected note. Alternatively, you can click this button then click all the notes that you want to add a light shake to.',
  taorluath:
    'Add a taorluath to the selected note. Alternatively, you can click this button then click all the notes that you want to add a taorluath to.',
  crunluath:
    'Add a crunluath to the selected note. Alternatively, you can click this button then click all the notes that you want to add a crunluath to.',
  edre: 'Add a edre to the selected note. Alternatively, you can click this button then click all the notes that you want to add a edre to.',
  bubbly:
    'Add a bubbly to the selected note. Alternatively, you can click this button then click all the notes that you want to add a bubbly to.',
  'add-bar-before': 'Add a new bar before the currently selected bar.',
  'add-bar-after': 'Add a new bar after the currently selected bar.',
  'edit-bar-time-signature':
    'Edit the time signature of the bar. If the time signature is displayed at the start of the bar, you can also edit it by clicking it.',
  'reset-bar-length':
    "Reset the bar length to the automatic size. If you've changed the bar length by dragging the barlines around, this resets on the current selected bar(s).",
  'normal-barline':
    'Set the barline of the currently selected bar to the default single line.',
  'repeat-barline':
    'Set the barline of the currently selected bar to a repeat sign.',
  'part-barline':
    'Set the barline of the currently selected bar to a non-repeating start/end of part (two thick lines).',
  'add-lead-in-before': 'Add a new lead in before the currently selected bar.',
  'add-lead-in-after': 'Add a new lead in after the currently selected bar.',
  'add-stave-before':
    'Add a new blank stave on the line before the currently selected stave. Select a stave by selecting any note or bar in that stave.',
  'add-stave-after':
    'Add a new blank stave on the next line after the currently currently selected stave. Select a stave by selecting any note or bar in that stave.',
  'delete-stave':
    'Delete the currently selected stave. Select a stave by selecting any note or bar in that stave.',
  'add-harmony':
    'Add a harmony part to the currently selected stave. Select a stave by selecting any note or bar in that stave.',
  'add-harmony-to-all': 'Add a harmony part to all staves.',
  'remove-harmony':
    'Delete the harmony part on the selected staves. Select a stave by selecting any note or bar in that stave. If there are multiple harmonies on the stave, remove the last one.',
  'set-stave-gap': 'Adjust the default gap between all staves.',
  'reset-stave-gap': 'Reset the gap between staves to its default value.',
  'add-tune-before':
    'Add a new tune before the currently selected tune. Select a tune by selecting any note or bar in that tune.',
  'add-tune-after':
    'Add a new tune after the currently selected tune. Select a tune by selecting any note or bar in that tune.',
  'set-tune-gap':
    'Adjust the gap before the currently selected tune. Select a tune by selecting any note or bar in that tune.',
  'reset-tune-gap':
    'Reset the gap before the currently selected tune. Select a tune by selecting any note or bar in that tune.',
  'delete-tune':
    'Delete the currently selected tune. Select a tune by selecting any note or bar in that tune.',
  'add-text': 'Add a new text box.',
  'centre-text': 'Horizontally centre the currently selected text box.',
  'edit-text': 'Edit the currently selected text box.',
  'set-text-coords':
    'Set the coordinates of the text box. This may be used for precise control. Most of the time, you can just drag the text box. Positions the text box X% from the left and Y% from the top of the page.',
  play: 'Play a preview of the score back from the start. This will only work once the samples are downloaded (if the samples need to download, you will see a notice).',
  'play-from-selection':
    'Play a preview of the score, starting at the currently selected note/bar. This will only work once the samples are downloaded (if the samples need to download, you will see a notice).',
  'play-looping-selection':
    'Play the currently selected part of the score, repeating forever.',
  stop: 'Stop the playback.',
  'playback-speed': 'Control the playback speed (further right is faster).',
  'harmony-volume': 'Control how loud the harmony plays (further right is louder).',
  export: 'Export the score to a PDF file, that may then be shared or printed.',
  'export-bww':
    "Export the score to a BWW file, that may be opened in other applications. This is currently very new, and won't work for most scores.",
  download:
    'Download the score as a .pipescore file. This allows you to save your scores on your computer, and to upload them again to another account. The downloaded file cannot be opened in anything other than PipeScore.',
  landscape: 'Make the page(s) landscape.',
  portrait: 'Make the page(s) portrait.',
  'page-numbers':
    'Show page numbers at the bottom of each page, if there is more than one page.',
  'disable-help': 'Control whether the help pane is shown in the bottom right.',
  zoom: 'Zoom: Control how large the score appears on your screen. Drag to the right to zoom in, the left to zoom out.',
  'number-of-pages': 'Add or remove pages.',
  'move-bar-to-previous-line':
    'Move the currently selected bar to the end of the previous stave. This only applies if you are currently selecting the first bar of a stave.',
  'move-bar-to-next-line':
    'Move the currently selected bar to the start of the next stave. This only applies if you are currently selecting the last bar of a stave.',
  'nothing-hovered': 'Hover over different icons to view Help here.',
};

export const EnglishTextItems: TextItems = {
  homeMenu: 'Home',
  noteMenu: 'Note',
  gracenoteMenu: 'Gracenote',
  barMenu: 'Bar',
  secondTimingMenu: 'Second Timing',
  staveMenu: 'Stave',
  tuneMenu: 'Tune',
  textMenu: 'Text',
  playbackMenu: 'Playback',
  documentMenu: 'Document',
  settingsMenu: 'Settings',
  helpMenu: 'Help',
  addNote: 'Add Note',
  modifyNote: 'Modify Note',
  addGracenote: 'Add Gracenote',
  addBar: 'Add Bar',
  addBarBefore: 'Add bar before',
  addBarAfter: 'Add bar after',
  addLeadIn: 'Add Lead-in',
  addLeadInBefore: 'Add lead-in before',
  addLeadInAfter: 'Add lead-in after',
  modifyBar: 'Modify Bar',
  editTimeSignature: 'Edit time signature',
  resetBarLength: 'Reset bar length',
  start: 'Start',
  end: 'End',
  modifyBarlines: 'Modify Bar Lines',
  normalBarline: 'Normal',
  repeatBarline: 'Repeat',
  partBarline: 'Part',
  moveBar: 'Move Bar',
  moveToPreviousStave: 'Move to previous stave',
  moveToNextStave: 'Move to next stave',
  addTiming: 'Add Timing',
  addSecondTiming: '1st/ 2nd', // TODO
  addSingleTiming: '2nd', // TODO
  modifyTiming: 'Modify Timing',
  editTimingText: 'Edit timing text',
  addStave: 'Add Stave',
  before: 'before',
  after: 'after',
  modifyStave: 'Modify Stave',
  adjustStaveGap: 'Adjust stave gap',
  reset: 'Reset',
  deleteStave: 'Delete Stave',
  delete: 'Delete',
  harmonyStave: 'Add Harmony',
  addHarmony: 'Add harmony to selected staves',
  addHarmonyToAll: 'Add harmony to all staves',
  deleteHarmony: 'Delete Harmony',
  addTune: 'Add Tune',
  modifyTune: 'Modify Tune',
  adjustGapBeforeTune: 'Adjust gap before tune',
  deleteTune: 'Delete Tune',
  addTextBox: 'Add Text Box', // TODO textbox vs text
  modifyTextBox: 'Modify Text Box',
  centreText: 'Centre text',
  editText: 'Edit text',
  setTextBoxPosition: 'Set Text Box Position',
  x: 'X',
  y: 'Y',
  controls: 'Controls',
  playFromBeginning: 'Play from Beginning',
  playFromSelection: 'Play from Selection',
  playLoopedSelection: 'Play looped Selection',
  stop: 'Stop',
  playbackOptions: 'Playback Options',
  beatsPerMinute: 'beats per minute',
  harmonyVolume: 'harmony volume',
  orientation: 'Orientation',
  landscape: 'Landscape',
  portrait: 'Portrait',
  pageNumbers: 'Page Numbers',
  showPageNumbers: 'Show page numbers',
  export: 'Export',
  exportPDF: 'Export to PDF',
  exportBWW: 'Export to BWW',
  download: 'Download PipeScore file',
  staveLayout: 'Stave layout', // TODO move to stave menu? or vice versa
  gapBetweenLines: 'Gap between lines',
  harmonyGap: 'Gap between harmony staves',
  gracenoteLayout: 'Gracenote layout',
  gapAfterGracenote: 'Gap after gracenote',
  margins: 'Margins',
  margin: 'Margin',
  view: 'View',
  disableHelp: 'Disable Help',
  save: 'Save',
  allChangesSaved: 'All changes saved!',
  unsavedChanges: 'Unsaved changes',
  instrumentPC: 'Practice Chanter',
  instrumentPipes: 'Bagpipe',
  instrument: 'Instrument',
};
