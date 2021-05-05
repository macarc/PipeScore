const noteDoc = (name: string) => `Click to start inputting ${name} notes

You can also select a note that's already on the score and press this to change it to a ${name}`;
const gracenoteDoc = (name: string) => `Add a ${name} to the selected note\n\nAlternatively, you can click this button then click all the notes that you want to add a ${name} to.`

export default new Map(Object.entries({
  'home': 'Go back to the scores page',
  'sb': noteDoc('semibreve'),
  'm': noteDoc('minim'),
  'c': noteDoc('crotchet'),
  'q': noteDoc('quaver'),
  'sq': noteDoc('semiquaver'),
  'ssq': noteDoc('demisemiquaver'),
  'hdsq': noteDoc('hemidemisemiquaver'),
  'dot': "Add a dot to the selected note, or to the length of the note that you're currently inputting\n\nIf there is already a dot, this removes it",
  'tie': 'Tie the selected note to the note before it',
  'second timing': 'Add a 1st/2nd timing. Select the start of where the first timing should go and press this, then drag to change the second timing',
  'triplet': 'Make the three selected notes into a triplet',
  'delete': "Delete the current selected note, text or bar\n\nTo delete a gracenote, press the 'Remove Gracenote' button under the gracenote menu\n\nTo delete a stave, delete all the bars in it",
  'copy': 'Copy the current selected notes (or bars)\n\nTo select notes, click on the first note to select then hold shift and click the last note you want to select',
  'paste': "Paste any notes that you've copied",
  'undo': 'Undo the last action that changed the score',
  'redo': 'Redo the last action that you undid',
  'single': 'Add a single gracenote to the selected note\n\nAlternatively, you can press this button, and then use the mouse to place the gracenote where you want on the score',
  'doubling': gracenoteDoc('doubling'),
  'throw-d': gracenoteDoc('throw on D'),
  'grip': gracenoteDoc('grip'),
  'birl': gracenoteDoc('birl'),
  'g-gracenote-birl': gracenoteDoc('G gracenote birl'),
  'shake': gracenoteDoc('shake'),
  'toarluath': gracenoteDoc('toarluath'),
  'crunluath': gracenoteDoc('crunluath'),
  'edre': gracenoteDoc('edre'),
  'remove gracenote': 'Delete the gracenote from the current selected note'
}));
