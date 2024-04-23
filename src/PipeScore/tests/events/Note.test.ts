import { Bar } from '../../Bar/impl';
import {
  addNoteAfterSelection,
  addNoteBefore,
  addNoteToBarEnd,
  moveNoteDown,
  moveNoteUp,
  tieSelectedNotes,
  toggleDot,
  toggleNatural,
  toggleTriplet,
} from '../../Events/Note';
import { INote, ITriplet } from '../../Note';
import { Note, Triplet } from '../../Note/impl';
import { Duration, NoteLength } from '../../Note/notelength';
import { NotePreview } from '../../Preview/impl';
import { ScoreSelection } from '../../Selection/score';
import { TimeSignature } from '../../TimeSignature/impl';
import { Pitch } from '../../global/pitch';
import { nfirst, nlast } from '../../global/utils';
import { emptyState } from './common';

const note = () => new Note(Pitch.A, new NoteLength(Duration.Crotchet));
const noteP = (p: Pitch) => new Note(p, new NoteLength(Duration.Crotchet));
const noteD = (d: Duration) => new Note(Pitch.A, new NoteLength(d));

describe('addNoteBefore', () => {
  it("doesn't do anything if there is no preview note", () => {
    const state = emptyState();
    const firstNote = note();
    state.score.bars()[0].insertNote(null, firstNote);
    expect(state.score.notes()).toHaveLength(1);
    addNoteBefore(Pitch.D, firstNote)(state);
    expect(state.score.notes()).toHaveLength(1);
  });

  it("doesn't do anything if score is empty", () => {
    const state = emptyState();
    state.preview = new NotePreview(new NoteLength(Duration.Crotchet));
    addNoteBefore(Pitch.D, note())(state);
    expect(state.score.notes()).toHaveLength(0);
  });

  it("doesn't do anything if an invalid note is passed", () => {
    const state = emptyState();
    state.preview = new NotePreview(new NoteLength(Duration.Crotchet));
    state.score.staves()[0].firstBar()?.insertNote(null, note());
    expect(state.score.notes()).toHaveLength(1);
    addNoteBefore(Pitch.D, note())(state);
    expect(state.score.notes()).toHaveLength(1);
  });

  it('adds note before using preview length', () => {
    const state = emptyState();
    const firstNote = note();
    const bar = state.score.bars()[2];
    bar.insertNote(null, firstNote);
    state.preview = new NotePreview(new NoteLength(Duration.SemiQuaver));
    expect(bar.notes()).toHaveLength(1);
    expect(state.score.notes()).toHaveLength(1);
    addNoteBefore(Pitch.D, firstNote)(state);
    expect(state.score.notes()).toHaveLength(2);
    expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.D);
    expect(nfirst(state.score.notes()).length().duration()).toBe(
      Duration.SemiQuaver
    );
    expect(bar.notes()).toHaveLength(2);
  });

  it('adds a note before a triplet', () => {
    const state = emptyState();
    const n1 = note();
    const n2 = note();
    const n3 = note();
    const bar = state.score.bars()[2];
    bar.insertNote(null, n1);
    bar.insertNote(n1, n2);
    bar.insertNote(n2, n3);
    bar.makeTriplet(n1, n2, n3);
    const triplet = bar.notesAndTriplets()[0] as Triplet;
    state.preview = new NotePreview(new NoteLength(Duration.SemiQuaver));
    expect(bar.notesAndTriplets()).toHaveLength(1);
    expect(bar.notes()).toHaveLength(3);
    addNoteBefore(Pitch.D, triplet.firstSingle())(state);
    expect(bar.notesAndTriplets()).toHaveLength(2);
    expect(bar.notes()).toHaveLength(4);
    expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.D);
    expect(nfirst(state.score.notes()).length().duration()).toBe(
      Duration.SemiQuaver
    );
  });

  // TODO : adding notes inside triplets
});

describe('addNoteAfterSelection', () => {
  it("doesn't do anything if there is no selection", () => {
    const state = emptyState();
    const selectionStart = note();
    const selectionEnd = note();
    nfirst(state.score.bars()).insertNote(null, selectionStart);
    nlast(state.score.bars()).insertNote(null, selectionEnd);
    state.preview = new NotePreview(new NoteLength(Duration.Crotchet));
    expect(state.score.notes()).toHaveLength(2);
    addNoteAfterSelection(Pitch.D)(state);
    expect(state.score.notes()).toHaveLength(2);
  });

  it('adds note after selection of notes using preview length', () => {
    const state = emptyState();
    const selectionStart = note();
    const selectionEnd = note();
    nfirst(state.score.bars()).insertNote(null, selectionStart);
    nlast(state.score.bars()).insertNote(null, selectionEnd);
    state.selection = new ScoreSelection(selectionStart.id, selectionEnd.id, false);
    state.preview = new NotePreview(new NoteLength(Duration.SemiQuaver));
    expect(state.score.notes()).toHaveLength(2);
    expect((state.selection as ScoreSelection).notes(state.score)).toHaveLength(2);
    addNoteAfterSelection(Pitch.D)(state);
    expect((state.selection as ScoreSelection).notes(state.score)).toHaveLength(1);
    expect(state.score.notes()).toHaveLength(3);
    expect(nlast(state.score.notes()).pitch()).toBe(Pitch.D);
    expect(nlast(state.score.notes()).length().duration()).toBe(Duration.SemiQuaver);
  });

  it('uses length of last note in (note) selection if there is no preview', () => {
    const state = emptyState();
    const selectionStart = note();
    const selectionEnd = noteD(Duration.SemiQuaver);
    nfirst(state.score.bars()).insertNote(null, selectionStart);
    nlast(state.score.bars()).insertNote(null, selectionEnd);
    state.selection = new ScoreSelection(selectionStart.id, selectionEnd.id, false);
    expect(state.score.notes()).toHaveLength(2);
    addNoteAfterSelection(Pitch.D)(state);
    expect(state.score.notes()).toHaveLength(3);
    expect(nlast(state.score.notes()).pitch()).toBe(Pitch.D);
    expect(nlast(state.score.notes()).length().duration()).toBe(Duration.SemiQuaver);
  });

  it('uses length of last note in (bar) selection if there is no preview', () => {
    const state = emptyState();
    nfirst(state.score.bars()).insertNote(null, noteD(Duration.SemiQuaver));
    const selectionStart = nfirst(state.score.bars());
    const selectionEnd = nlast(state.score.bars());
    state.selection = new ScoreSelection(selectionStart.id, selectionEnd.id, false);
    expect(state.score.notes()).toHaveLength(1);
    addNoteAfterSelection(Pitch.D)(state);
    expect(state.score.notes()).toHaveLength(2);
    expect(nlast(state.score.notes()).pitch()).toBe(Pitch.D);
    expect(nlast(state.score.notes()).length().duration()).toBe(Duration.SemiQuaver);
  });

  it('uses length of previously selected note if (bar) selection is empty', () => {
    const state = emptyState();
    nfirst(state.score.bars()).insertNote(null, noteD(Duration.SemiQuaver));
    const selectionStart = state.score.bars()[1];
    const selectionEnd = nlast(state.score.bars());
    state.selection = new ScoreSelection(selectionStart.id, selectionEnd.id, false);
    expect(state.score.notes()).toHaveLength(1);
    addNoteAfterSelection(Pitch.D)(state);
    expect(state.score.notes()).toHaveLength(2);
    expect(nlast(state.score.notes()).pitch()).toBe(Pitch.D);
    expect(nlast(state.score.notes()).length().duration()).toBe(Duration.SemiQuaver);
  });

  // TODO : triplets
});

describe('addNoteToBarEnd', () => {
  it("doesn't do anything if an invalid bar is passed", () => {
    const state = emptyState();
    state.preview = new NotePreview(new NoteLength(Duration.SemiQuaver));
    addNoteToBarEnd(Pitch.A, new Bar(new TimeSignature()))(state);
    expect(state.score.notes()).toHaveLength(0);
  });
});

describe('moveNoteUp', () => {
  it('moves up a single note', () => {
    const state = emptyState();
    const n = note();
    nfirst(state.score.bars()).insertNote(null, n);
    state.selection = new ScoreSelection(n.id, n.id, false);
    expect(state.score.notes()).toHaveLength(1);
    moveNoteUp()(state);
    expect(state.score.notes()).toHaveLength(1);
    expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.B);
  });

  it('moves up a note in a triplet', () => {
    const state = emptyState();
    const n1 = note();
    const n2 = note();
    const n3 = note();
    nfirst(state.score.bars()).insertNote(null, n1);
    nfirst(state.score.bars()).insertNote(n1, n2);
    nfirst(state.score.bars()).insertNote(n2, n3);
    nfirst(state.score.bars()).makeTriplet(n1, n2, n3);
    state.selection = new ScoreSelection(n2.id, n2.id, false);
    moveNoteUp()(state);
    expect(state.score.notes()).toHaveLength(3);
    expect(state.score.notesAndTriplets()).toHaveLength(1);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.B);
  });

  it("doesn't move up a high A", () => {
    const state = emptyState();
    const n = noteP(Pitch.HA);
    nfirst(state.score.bars()).insertNote(null, n);
    state.selection = new ScoreSelection(n.id, n.id, false);
    moveNoteUp()(state);
    expect(state.score.notes()).toHaveLength(1);
    expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.HA);
  });

  it('moves up multiple notes', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.C);
    const n2 = noteP(Pitch.E);
    const n3 = noteP(Pitch.HA);
    const n4 = noteP(Pitch.D);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[1].insertNote(null, n2);
    state.score.bars()[2].insertNote(null, n3);
    state.score.bars()[3].insertNote(null, n4);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    moveNoteUp()(state);
    expect(state.score.notes()).toHaveLength(4);
    expect(state.score.notes()[0].pitch()).toBe(Pitch.D);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.F);
    expect(state.score.notes()[2].pitch()).toBe(Pitch.HA);
    expect(state.score.notes()[3].pitch()).toBe(Pitch.D);
  });

  it('moves up multiple notes including notes in triplets', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.C);
    const n2 = noteP(Pitch.G);
    const n3 = noteP(Pitch.E);
    const n4 = noteP(Pitch.D);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].insertNote(n3, n4);
    state.score.bars()[0].makeTriplet(n2, n3, n4);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    moveNoteUp()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(2);
    expect(state.score.notes()).toHaveLength(4);
    expect(state.score.notes()[0].pitch()).toBe(Pitch.D);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.A);
    expect(state.score.notes()[2].pitch()).toBe(Pitch.F);
    expect(state.score.notes()[3].pitch()).toBe(Pitch.D);
  });
});

describe('moveNoteDown', () => {
  it('moves down a single note', () => {
    const state = emptyState();
    const n = note();
    nfirst(state.score.bars()).insertNote(null, n);
    state.selection = new ScoreSelection(n.id, n.id, false);
    moveNoteDown()(state);
    expect(state.score.notes()).toHaveLength(1);
    expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.G);
  });

  it('moves down a note in a triplet', () => {
    const state = emptyState();
    const n1 = note();
    const n2 = note();
    const n3 = note();
    nfirst(state.score.bars()).insertNote(null, n1);
    nfirst(state.score.bars()).insertNote(n1, n2);
    nfirst(state.score.bars()).insertNote(n2, n3);
    nfirst(state.score.bars()).makeTriplet(n1, n2, n3);
    state.selection = new ScoreSelection(n2.id, n2.id, false);
    moveNoteDown()(state);
    expect(state.score.notes()).toHaveLength(3);
    expect(state.score.notesAndTriplets()).toHaveLength(1);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.G);
  });

  it("doesn't move down a low G", () => {
    const state = emptyState();
    const n = noteP(Pitch.G);
    nfirst(state.score.bars()).insertNote(null, n);
    state.selection = new ScoreSelection(n.id, n.id, false);
    moveNoteDown()(state);
    expect(state.score.notes()).toHaveLength(1);
    expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.G);
  });

  it('moves down multiple notes', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.C);
    const n2 = noteP(Pitch.G);
    const n3 = noteP(Pitch.E);
    const n4 = noteP(Pitch.D);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[1].insertNote(null, n2);
    state.score.bars()[2].insertNote(null, n3);
    state.score.bars()[3].insertNote(null, n4);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    moveNoteDown()(state);
    expect(state.score.notes()).toHaveLength(4);
    expect(state.score.notes()[0].pitch()).toBe(Pitch.B);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.G);
    expect(state.score.notes()[2].pitch()).toBe(Pitch.D);
    expect(state.score.notes()[3].pitch()).toBe(Pitch.D);
  });

  it('moves down multiple notes including notes in triplets', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.C);
    const n2 = noteP(Pitch.G);
    const n3 = noteP(Pitch.E);
    const n4 = noteP(Pitch.D);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].insertNote(n3, n4);
    state.score.bars()[0].makeTriplet(n2, n3, n4);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    moveNoteDown()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(2);
    expect(state.score.notes()).toHaveLength(4);
    expect(state.score.notes()[0].pitch()).toBe(Pitch.B);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.G);
    expect(state.score.notes()[2].pitch()).toBe(Pitch.D);
    expect(state.score.notes()[3].pitch()).toBe(Pitch.D);
  });
});

describe('tieSelectedNotes', () => {
  it('ties two notes with the same pitch', () => {
    const state = emptyState();
    const n1 = note();
    const n2 = note();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.selection = new ScoreSelection(n1.id, n2.id, false);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(false);
    tieSelectedNotes()(state);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(true);
  });

  it('ties two notes with different pitches', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.A);
    const n2 = noteP(Pitch.B);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.selection = new ScoreSelection(n1.id, n2.id, false);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(false);
    tieSelectedNotes()(state);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(true);
    expect(state.score.notes()[0].pitch()).toBe(Pitch.B);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.B);
  });

  it('ties two notes across bars', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.A);
    const n2 = noteP(Pitch.B);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[3].insertNote(null, n2);
    state.selection = new ScoreSelection(n1.id, n2.id, false);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(false);
    tieSelectedNotes()(state);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(true);
    expect(state.score.notes()[0].pitch()).toBe(Pitch.B);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.B);
  });

  it('ties multiple notes across bars', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.A);
    const n2 = noteP(Pitch.B);
    const n3 = noteP(Pitch.C);
    const n4 = noteP(Pitch.D);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[2].insertNote(null, n2);
    state.score.bars()[3].insertNote(null, n3);
    state.score.bars()[4].insertNote(null, n4);
    state.selection = new ScoreSelection(n2.id, n4.id, false);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(false);
    expect(state.score.notes()[2].isTied()).toBe(false);
    expect(state.score.notes()[3].isTied()).toBe(false);
    tieSelectedNotes()(state);
    expect(state.score.notes()[0].isTied()).toBe(false);
    expect(state.score.notes()[1].isTied()).toBe(false);
    expect(state.score.notes()[2].isTied()).toBe(true);
    expect(state.score.notes()[3].isTied()).toBe(true);
    expect(state.score.notes()[0].pitch()).toBe(Pitch.A);
    expect(state.score.notes()[1].pitch()).toBe(Pitch.D);
    expect(state.score.notes()[2].pitch()).toBe(Pitch.D);
    expect(state.score.notes()[3].pitch()).toBe(Pitch.D);
  });

  // TODO : triplets
});

describe('toggleNatural', () => {
  it('changes C#s and F#s', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.C);
    const n2 = noteP(Pitch.G);
    const n3 = noteP(Pitch.F);
    const n4 = noteP(Pitch.D);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].insertNote(n3, n4);
    state.score.bars()[0].makeTriplet(n2, n3, n4);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    expect(state.score.notes()[0].natural()).toBe(false);
    expect(state.score.notes()[1].natural()).toBe(false);
    expect(state.score.notes()[2].natural()).toBe(false);
    expect(state.score.notes()[3].natural()).toBe(false);
    toggleNatural()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(2);
    expect(state.score.notes()).toHaveLength(4);
    expect(state.score.notes()[0].natural()).toBe(true);
    expect(state.score.notes()[1].natural()).toBe(false);
    expect(state.score.notes()[2].natural()).toBe(true);
    expect(state.score.notes()[3].natural()).toBe(false);
  });

  it('changes Cs and Fs', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.C);
    const n2 = noteP(Pitch.G);
    const n3 = noteP(Pitch.F);
    const n4 = noteP(Pitch.D);
    n1.toggleNatural();
    n3.toggleNatural();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].insertNote(n3, n4);
    state.score.bars()[0].makeTriplet(n2, n3, n4);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    expect(state.score.notes()[0].natural()).toBe(true);
    expect(state.score.notes()[1].natural()).toBe(false);
    expect(state.score.notes()[2].natural()).toBe(true);
    expect(state.score.notes()[3].natural()).toBe(false);
    toggleNatural()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(2);
    expect(state.score.notes()).toHaveLength(4);
    expect(state.score.notes()[0].natural()).toBe(false);
    expect(state.score.notes()[1].natural()).toBe(false);
    expect(state.score.notes()[2].natural()).toBe(false);
    expect(state.score.notes()[3].natural()).toBe(false);
  });

  it('toggles naturals in triplets', () => {
    const state = emptyState();
    const n1 = noteP(Pitch.C);
    const n2 = noteP(Pitch.F);
    const n3 = noteP(Pitch.D);
    n2.toggleNatural();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].makeTriplet(n1, n2, n3);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    expect(state.score.notesAndTriplets()).toHaveLength(1);
    expect(state.score.notes()).toHaveLength(3);
    expect(state.score.notes()[0].natural()).toBe(false);
    expect(state.score.notes()[1].natural()).toBe(true);
    expect(state.score.notes()[2].natural()).toBe(false);
    toggleNatural()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(1);
    expect(state.score.notes()).toHaveLength(3);
    expect(state.score.notes()[0].natural()).toBe(true);
    expect(state.score.notes()[1].natural()).toBe(false);
    expect(state.score.notes()[2].natural()).toBe(false);
  });
});

describe('toggleTriplet', () => {
  it("doesn't add a triplet if nothing is selected", () => {
    const state = emptyState();
    state.score.bars()[0].insertNote(null, note());
    state.score.bars()[0].insertNote(null, note());
    state.score.bars()[0].insertNote(null, note());
    expect(state.score.notesAndTriplets()).toHaveLength(3);
    toggleTriplet()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(3);
  });

  it('creates a triplet if three notes are selected', () => {
    const state = emptyState();
    const n1 = note();
    const n2 = noteD(Duration.SemiQuaver);
    const n3 = note();
    const n4 = note();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].insertNote(n3, n4);
    state.selection = new ScoreSelection(n2.id, n4.id, false);
    expect(state.score.notesAndTriplets()).toHaveLength(4);
    toggleTriplet()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(2);
    expect(state.score.notesAndTriplets()[0]).toBeInstanceOf(INote);
    expect(state.score.notesAndTriplets()[1]).toBeInstanceOf(ITriplet);
    expect(state.score.notesAndTriplets()[1].length().duration()).toBe(
      Duration.SemiQuaver
    );
  });

  it('creates a triplet from first three notes if many notes are selected', () => {
    const state = emptyState();
    const n1 = noteD(Duration.SemiQuaver);
    const n2 = note();
    const n3 = note();
    const n4 = note();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].insertNote(n3, n4);
    state.selection = new ScoreSelection(n1.id, n4.id, false);
    expect(state.score.notesAndTriplets()).toHaveLength(4);
    toggleTriplet()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(2);
    expect(state.score.notesAndTriplets()[0]).toBeInstanceOf(ITriplet);
    expect(state.score.notesAndTriplets()[0].length().duration()).toBe(
      Duration.SemiQuaver
    );
    expect(state.score.notesAndTriplets()[1]).toBeInstanceOf(INote);
  });

  it("doesn't create a triplet across barlines", () => {
    const state = emptyState();
    const n1 = note();
    const n2 = note();
    const n3 = note();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[1].insertNote(null, n2);
    state.score.bars()[1].insertNote(n2, n3);
    state.selection = new ScoreSelection(n1.id, n3.id, false);
    expect(state.score.notesAndTriplets()).toHaveLength(3);
    toggleTriplet()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(3);
  });

  it('unmakes a triplet if it is in the first three selected notes', () => {
    const state = emptyState();
    const n1 = note();
    const n2 = note();
    const n3 = note();
    const n4 = note();
    const n5 = note();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].insertNote(n2, n3);
    state.score.bars()[0].insertNote(n3, n4);
    state.score.bars()[0].insertNote(n4, n5);
    state.score.bars()[0].makeTriplet(n1, n2, n3);
    state.selection = new ScoreSelection(n1.id, n5.id, false);
    expect(state.score.notesAndTriplets()).toHaveLength(3);
    toggleTriplet()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(3);
  });
});

describe('toggleDot', () => {
  it('toggles dot on selected notes', () => {
    const state = emptyState();
    const n1 = noteD(Duration.Crotchet);
    const n2 = noteD(Duration.DottedQuaver);
    const n3 = noteD(Duration.Minim);
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[1].insertNote(n2, n3);
    state.selection = new ScoreSelection(n2.id, n3.id, false);
    toggleDot()(state);
    expect(state.score.notes()).toHaveLength(3);
    expect(state.score.notes()[0].length().duration()).toBe(Duration.Crotchet);
    expect(state.score.notes()[1].length().duration()).toBe(Duration.Quaver);
    expect(state.score.notes()[2].length().duration()).toBe(Duration.DottedMinim);
  });

  it('toggles dot on all triplet notes if any note in triplet is selected', () => {
    const state = emptyState();
    const n1 = noteD(Duration.Quaver);
    const n2 = note();
    const n3 = note();
    state.score.bars()[0].insertNote(null, n1);
    state.score.bars()[0].insertNote(n1, n1);
    state.score.bars()[0].insertNote(n1, n2);
    state.score.bars()[0].makeTriplet(n1, n2, n3);
    state.selection = new ScoreSelection(n2.id, n2.id, false);
    expect(state.score.notesAndTriplets()).toHaveLength(1);
    toggleDot()(state);
    expect(state.score.notesAndTriplets()).toHaveLength(1);
    expect(state.score.notesAndTriplets()[0].length().duration()).toBe(
      Duration.DottedQuaver
    );
  });
});

describe('stopInput', () => {});

describe('clickTripletLine', () => {});

describe('clickNote', () => {});

describe('setInputLength', () => {});
