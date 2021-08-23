import { ScoreEvent, noChange, viewChanged, shouldSave } from './Event';
import { State } from '../State';
import {
  changeNoteFrom,
  changeNotes,
  currentNoteModels,
  selectionToNotes,
  noteMap,
} from './NoteEvents';

import { Pitch } from '../global/pitch';

import DemoNote from '../DemoNote/functions';
import { GracenoteModel } from '../Gracenote/model';
import { TripletModel } from '../Note/model';
import { ScoreModel } from '../Score/model';

import Gracenote from '../Gracenote/functions';

export function changeGracenoteFrom(
  oldGracenote: GracenoteModel,
  newGracenote: GracenoteModel,
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
export function clickGracenote(gracenote: GracenoteModel): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...state,
      justClickedNote: true,
      demoNote: null,
      gracenoteState: {
        ...state.gracenoteState,
        selected: gracenote,
        dragged: gracenote.type === 'single' ? gracenote : null,
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
          inputGracenote: newGracenote,
          demoNote:
            newGracenote.type === 'single'
              ? DemoNote.initDemoGracenote()
              : null,
        });
  };
}

export function addGracenoteToTriplet(
  which: 'second' | 'third', // first is dealt with by AddNoteAfter the note before
  triplet: TripletModel,
  pitch: Pitch
): ScoreEvent {
  return async (state: State) => {
    if (state.demoNote && state.demoNote.type === 'gracenote') {
      const previousPitch =
        which === 'second' ? triplet.first.pitch : triplet.second.pitch;
      return shouldSave({
        ...state,
        score: changeNoteFrom(
          triplet[which].id,
          {
            ...triplet[which],
            gracenote: Gracenote.addSingle(
              triplet[which].gracenote,
              pitch,
              triplet[which].pitch,
              previousPitch
            ),
          },
          state.score
        ),
      });
    } else if (state.inputGracenote) {
      return shouldSave({
        ...state,
        score: changeNoteFrom(
          triplet[which].id,
          { ...triplet[which], gracenote: state.inputGracenote },
          state.score
        ),
      });
    }
    return noChange(state);
  };
}
