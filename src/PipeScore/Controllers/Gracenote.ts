/*
  Controller for gracenote-related events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, noChange, viewChanged, shouldSave } from './Controller';
import { State } from '../State';
import {
  changeNotes,
  currentNoteModels,
  selectionToNotes,
  noteMap,
  replaceNote,
} from './Note';

import { Pitch } from '../global/pitch';

import DemoNote from '../DemoNote/functions';
import { Gracenote, SingleGracenote } from '../Gracenote/model';
import { TripletModel } from '../Note/model';
import { ScoreModel } from '../Score/model';

export function changeGracenoteFrom(
  oldGracenote: Gracenote,
  newGracenote: Gracenote,
  score: ScoreModel
): ScoreModel {
  // Replaces oldGracenote with newGracenote

  return noteMap(
    (n, replace) => {
      if (n.gracenote === oldGracenote) {
        replace({ ...n, gracenote: newGracenote });
        return true;
      }
      return false;
    },
    score,
    false
  );
}
export function clickGracenote(gracenote: Gracenote): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...state,
      justClickedNote: true,
      note: { ...state.note, demo: null },
      gracenote: {
        ...state.gracenote,
        selected: gracenote,
        dragged: gracenote instanceof SingleGracenote ? gracenote : null,
      },
    });
}

export function setGracenoteOnSelectedNotes(value: string | null): ScoreEvent {
  return async (state: State) => {
    const newGracenote = Gracenote.from(value);
    return state.selection
      ? shouldSave({
          ...state,
          score: changeNotes(
            selectionToNotes(
              state.selection,
              state.score,
              currentNoteModels(state.score)
            ),
            (note) => ({ ...note, gracenote: newGracenote }),
            state.score
          ),
        })
      : viewChanged({
          ...state,
          gracenote: { ...state.gracenote, input: newGracenote },
          note: {
            ...state.note,
            demo:
              newGracenote instanceof SingleGracenote
                ? DemoNote.initDemoGracenote()
                : null,
          },
        });
  };
}

export function addGracenoteToTriplet(
  which: 'second' | 'third', // first is dealt with by AddNoteAfter the note before
  triplet: TripletModel,
  pitch: Pitch
): ScoreEvent {
  return async (state: State) => {
    let gracenote = state.gracenote.input;
    if (state.note.demo && state.note.demo.type === 'gracenote') {
      const previousPitch =
        which === 'second' ? triplet.first.pitch : triplet.second.pitch;
      gracenote = triplet[which].gracenote.addSingle(
        pitch,
        triplet[which].pitch,
        previousPitch
      );
    }

    if (gracenote)
      return replaceNote(
        triplet[which],
        {
          ...triplet[which],
          gracenote,
        },
        state
      );
    return noChange(state);
  };
}
