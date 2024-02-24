import { describe, expect, it } from 'bun:test';
import { addNoteAfterSelection, addNoteBefore, moveNoteDown, moveNoteUp } from '../../Events/Note';
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
const noteP = (p: Pitch) => new Note(p, new NoteLength(Duration.Crotchet));
const noteD = (d: Duration) => new Note(Pitch.A, new NoteLength(d));

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
    const state = emptyState(new Score());
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
    const state = emptyState(new Score());
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

describe('addNoteToBarEnd', () => {});

describe('moveNoteUp', () => {
    it('moves up a single note', () => {
        const state = emptyState(new Score());
        const n = note();
        nfirst(state.score.bars()).insertNote(null, n);
        state.selection = new ScoreSelection(n.id, n.id, false);
        expect(state.score.notes()).toHaveLength(1);
        moveNoteUp()(state);
        expect(state.score.notes()).toHaveLength(1);
        expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.B);
    });

    it("doesn't move up a high A", () => {
        const state = emptyState(new Score());
        const n = noteP(Pitch.HA);
        nfirst(state.score.bars()).insertNote(null, n);
        state.selection = new ScoreSelection(n.id, n.id, false);
        moveNoteUp()(state);
        expect(state.score.notes()).toHaveLength(1);
        expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.HA);
    });

    it('moves up multiple notes', () => {
        const state = emptyState(new Score());
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
});

describe('moveNoteDown', () => {
    it('moves down a single note', () => {
        const state = emptyState(new Score());
        const n = note();
        nfirst(state.score.bars()).insertNote(null, n);
        state.selection = new ScoreSelection(n.id, n.id, false);
        expect(state.score.notes()).toHaveLength(1);
        moveNoteDown()(state);
        expect(state.score.notes()).toHaveLength(1);
        expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.G);
    });

    it("doesn't move down a low G", () => {
        const state = emptyState(new Score());
        const n = noteP(Pitch.G);
        nfirst(state.score.bars()).insertNote(null, n);
        state.selection = new ScoreSelection(n.id, n.id, false);
        moveNoteDown()(state);
        expect(state.score.notes()).toHaveLength(1);
        expect(nfirst(state.score.notes()).pitch()).toBe(Pitch.G);
    });

    it('moves down multiple notes', () => {
        const state = emptyState(new Score());
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
});

describe('tieSelectedNotes', () => {});

describe('toggleNatural', () => {});

describe('addTriplet', () => {});

describe('toggleDot', () => {});

describe('stopInput', () => {});

describe('clickTripletLine', () => {});

describe('clickNote', () => {});

describe('setInputLength', () => {});
