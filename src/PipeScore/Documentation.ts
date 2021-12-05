/*
  Documentation - explanations for the UI that are shown on hover
  Copyright (C) 2021 macarc
*/
const noteDoc = (name: string) => `Click to start inputting ${name} notes

You can also select a note that's already on the score and press this to change it to a ${name}`;
const gracenoteDoc = (name: string) =>
  `Add a ${name} to the selected note.\n\nAlternatively, you can click this button then click all the notes that you want to add a ${name} to.`;

export default new Map(
  Object.entries({
    home: 'Go back to the scores page',
    help: 'View the help page',
    sb: noteDoc('semibreve'),
    m: noteDoc('minim'),
    c: noteDoc('crotchet'),
    q: noteDoc('quaver'),
    sq: noteDoc('semiquaver'),
    ssq: noteDoc('demisemiquaver'),
    hdsq: noteDoc('hemidemisemiquaver'),
    dot: "Add a dot to the selected note, or to the length of the note that you're currently inputting.\n\nIf there is already a dot, this removes it",
    tie: 'Tie the selected note to the note before it',
    'second timing':
      'Add a 1st/2nd timing. Select the start of where the first timing should go and press this, then drag to change the position',
    'single timing':
      'Add a 2nd timing. Select the start of where the timing should go and press this, then drag to change the position',
    triplet: 'Make the three selected notes into a triplet',
    delete:
      'Delete the current selected note, gracenote, text or bar.\n\nFor gracenotes, clicking the beam at the top will select the entire gracenote, or clicking the head will select a single note from the gracenote.\n\nTo delete a stave, delete all the bars in it.',
    copy: 'Copy the current selected notes (or bars).\n\nTo select notes, click on the first note to select then hold shift and click the last note you want to select',
    paste: "Paste any notes that you've copied",
    undo: 'Undo the last action that changed the score',
    redo: 'Redo the last action that you undid',
    single:
      'Add a single gracenote to the selected note.\n\nAlternatively, you can press this button, and then use the mouse to place the gracenote where you want on the score',
    doubling: gracenoteDoc('doubling'),
    'half-doubling': gracenoteDoc('half-doubling'),
    'throw-d': gracenoteDoc('throw on D'),
    grip: gracenoteDoc('grip'),
    birl: gracenoteDoc('birl'),
    'g-gracenote-birl': gracenoteDoc('G gracenote birl'),
    'g-strike': gracenoteDoc('gracenote strike'),
    shake: gracenoteDoc('shake'),
    'c-shake': gracenoteDoc('C shake'),
    toarluath: gracenoteDoc('toarluath'),
    crunluath: gracenoteDoc('crunluath'),
    edre: gracenoteDoc('edre'),
    'add bar':
      'Add a new bar. Choose whether to add it before or after the currently selected bar.',
    'edit bar time signature':
      'Edit the time signature of the bar.\n\nIf the time signature is displayed at the start of the bar, you can also edit it by clicking it',
    'normal barline':
      'Set the barline of the currently selected bar to the default single line',
    'repeat barline':
      'Set the barline of the currently selected bar to a repeat sign',
    'part barline':
      'Set the barline of the currently selected bar to a non-repeating start/end of part (two thick lines)',
    'add anacrusis':
      'Add a new lead in. Choose whether to add it before or after the currently selected bar.',
    'add stave before':
      'Add a new blank stave on the next line after the currently currently selected bar',
    'add stave after':
      'Add a new blank stave on the line before the currently selected bar',
    'add text': 'Add a new text box',
    'centre text': 'Horizontally centre the currently selected text box',
    play: 'Play a preview of the score back from the start.\n\nThe first time you click this, it may take a short while to download all the audio samples',
    stop: 'Stop the playback',
    'playback speed': 'Control the playback speed (further right is faster)',
    print: 'Print the score to a physical printer or PDF file',
    landscape: 'Make the page(s) landscape.',
    portrait: 'Make the page(s) portrait.',
    'page numbers':
      'Show page numbers at the bottom of each page, if there is more than one page.',
    'add-page': 'Add a new page at the end.',
    'remove-page': 'Delete the last page and everything on it.',
    zoom: 'Zoom: Control how large the score appears on your screen.\n\nDrag to the right to zoom in, the left to zoom out',
    'number of pages': 'Add or remove pages',
  })
);
