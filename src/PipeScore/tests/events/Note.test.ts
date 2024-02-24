import { describe, expect, it } from 'bun:test';
import { addNoteAfterSelection, addNoteBefore } from '../../Events/Note';
import { Note } from '../../Note';
import { Duration, NoteLength } from '../../Note/notelength';
import { NotePreview } from '../../Preview';
import { Score } from '../../Score';
import { ScoreSelection } from '../../Selection';
import { State } from '../../State';
import { Pitch } from '../../global/pitch';
import { nfirst, nlast } from '../../global/utils';

const emptyState = (score: Score): State => ({
  store: null,
  isLoggedIn: false,
  justClickedNote: false,
  preview: null,
  menu: 'note',
  doc: { current: 'doubling', show: false },
  clipboard: null,
  selection: null,
  history: { past: [], future: [] },
  view: { ui: null, score: null },
  playback: {
    playing: false,
    loading: false,
    userPressedStop: false,
    cursor: null,
  },
  score,
});

const note = () => new Note(Pitch.A, new NoteLength(Duration.Crotchet));

describe('addNoteBefore', () => {
  it("doesn't do anything if there is no preview note", () => {
    const state = emptyState(new Score());
    const firstNote = note();
    state.score.bars()[0].insertNote(null, firstNote);
    expect(state.score.notes()).toHaveLength(1);
    addNoteBefore(Pitch.D, firstNote)(state);
    expect(state.score.notes()).toHaveLength(1);
  });

  it("doesn't do anything if score is empty", () => {
    const state = emptyState(new Score());
    state.preview = new NotePreview(new NoteLength(Duration.Crotchet));
    addNoteBefore(Pitch.D, note())(state);
    expect(state.score.notes()).toHaveLength(0);
  });

  it("doesn't do anything if an invalid note is passed", () => {
    const state = emptyState(new Score());
    state.preview = new NotePreview(new NoteLength(Duration.Crotchet));
    state.score.staves()[0].firstBar()?.insertNote(null, note());
    expect(state.score.notes()).toHaveLength(1);
    addNoteBefore(Pitch.D, note())(state);
    expect(state.score.notes()).toHaveLength(1);
  });

  it('adds note before using preview length', () => {
    const state = emptyState(new Score());
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

  // TODO : triplets
});

describe('addNoteAfterSelection', () => {
  it("doesn't do anything if there is no selection", () => {
    const state = emptyState(new Score());
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
    const state = emptyState(new Score());
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
    const state = emptyState(new Score());
    const selectionStart = note();
    const selectionEnd = note();
    selectionEnd.setLength(new NoteLength(Duration.SemiQuaver));
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
    const state = emptyState(new Score());
    const firstNote = note();
    firstNote.setLength(new NoteLength(Duration.SemiQuaver));
    nfirst(state.score.bars()).insertNote(null, firstNote);
    const selectionStart = nfirst(state.score.bars());
    const selectionEnd = nlast(state.score.bars());
    state.selection = new ScoreSelection(selectionStart.id, selectionEnd.id, false);
    expect(state.score.notes()).toHaveLength(1);
    addNoteAfterSelection(Pitch.D)(state);
    expect(state.score.notes()).toHaveLength(2);
    expect(nlast(state.score.notes()).pitch()).toBe(Pitch.D);
    expect(nlast(state.score.notes()).length().duration()).toBe(Duration.SemiQuaver);
  });

  // TODO : it uses length of previously selected note if (bar) selection is empty

  // TODO : bar selections, triplets
});

describe('addNoteAfterSelection', () => {});

describe('addNoteToBarEnd', () => {});

describe('moveNoteUp', () => {});

describe('moveNoteDown', () => {});

describe('tieSelectedNotes', () => {});

describe('toggleNatural', () => {});

describe('addTriplet', () => {});

describe('toggleDot', () => {});

describe('stopInput', () => {});

describe('clickTripletLine', () => {});

describe('clickNote', () => {});

describe('setInputLength', () => {});
