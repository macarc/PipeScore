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

//  The main event loop of PipeScore. See ./README.md for an explanation.

import m from 'mithril';
import { loadedAudio } from './Events/Misc';
import { mouseDrag, mouseUp } from './Events/Mouse';
import { type ScoreEvent, Update } from './Events/types';
import type { Firestore } from './Firestore';
import { emptyGracenoteState } from './Gracenote/state';
import { loadAudioResources } from './Playback/resources';
import quickStart from './QuickStart';
import { Score } from './Score/impl';
import { drawScore } from './Score/view';
import { GracenoteSelection } from './Selection/gracenote';
import { ScoreSelection } from './Selection/score';
import { TextSelection } from './Selection/text';
import { TimingSelection } from './Selection/timing';
import { TripletLineSelection } from './Selection/tripletline';
import type { State } from './State';
import { helpText } from './Translations/current';
import renderUI from './UI/view';
import { svgCoords } from './global/utils';
import { clearXY } from './global/xy';

const state: State = {
  store: null,
  isLoggedIn: false,
  justClickedNote: false,
  preview: null,
  playback: {
    userPressedStop: false,
    playing: false,
    loading: true,
    cursor: null,
  },
  menu: 'note',
  doc: { show: true, current: null },
  clipboard: null,
  selection: null,
  score: Score.blank(),
  history: { past: [], future: [] },
  view: { score: null, ui: null },
};

export async function dispatch(event: ScoreEvent): Promise<void> {
  const res = await event(state);
  if (res !== Update.NoChange) {
    updateView();
    if (res === Update.MovedThroughHistory || res === Update.ShouldSave) {
      if (res === Update.ShouldSave) {
        const json = state.score.toJSON();
        const jsonString = JSON.stringify(json);
        if (state.history.past[state.history.past.length - 1] !== jsonString) {
          state.history.past.push(jsonString);
          if (state.history.past.length > 30) state.history.past.shift();
          state.history.future = [];

          if (state.store && !state.store.isReadOnly()) {
            state.store.save(json);
          }
        }
      }
    }
  }
}

let needsRedrawn = false;

const updateView = () => {
  if (!needsRedrawn) {
    needsRedrawn = true;
    requestAnimationFrame(redraw);
  }
};

function redraw() {
  needsRedrawn = false;

  const scoreRoot = document.getElementById('score');
  const uiRoot = document.getElementById('interface');
  if (!scoreRoot || !uiRoot) return;

  if (state.view.score) {
    clearXY();
    m.render(
      state.view.score,
      drawScore(state.score, {
        justAddedNote: state.preview?.justAdded() || false,
        noteState: {
          dragged:
            (state.selection instanceof ScoreSelection &&
              state.selection.dragging() &&
              state.selection.note(state.score)) ||
            null,
          selectedTripletLine:
            (state.selection instanceof TripletLineSelection &&
              state.selection.selected) ||
            null,
          inputtingNotes: state.preview !== null,
        },
        gracenoteState:
          state.selection instanceof GracenoteSelection
            ? state.selection.state()
            : emptyGracenoteState,
        selection: state.selection,
        preview: state.preview,
        playbackState: state.playback,
        dispatch,
      })
    );
  }
  if (state.view.ui) {
    m.render(
      state.view.ui,
      renderUI({
        saved: state.store ? state.store.isSaved() : false,
        canEdit: !state.store?.isReadOnly(),
        canSave: state.store !== null,
        canUndo: state.history.past.length > 1,
        canRedo: state.history.future.length > 0,
        loggedIn: state.isLoggedIn,
        loadingAudio: state.playback.loading,
        isPlaying: state.playback.playing,
        zoomLevel: state.score.zoom,
        preview: state.preview,
        showingPageNumbers: state.score.showNumberOfPages,
        selectedNotes:
          state.selection instanceof ScoreSelection
            ? state.selection.notes(state.score)
            : [],
        selectedGracenote:
          (state.selection instanceof GracenoteSelection &&
            state.selection.gracenote()) ||
          (state.selection instanceof ScoreSelection &&
            state.selection.gracenote(state.score)) ||
          null,
        selectedText:
          state.selection instanceof TextSelection ? state.selection.text : null,
        selectedTiming:
          state.selection instanceof TimingSelection ? state.selection.timing : null,
        isLandscape: state.score.landscape,
        selectedStaves:
          (state.selection instanceof ScoreSelection &&
            state.selection.staves(state.score)) ||
          [],
        selectedMeasures:
          state.selection instanceof ScoreSelection
            ? state.selection.measures(state.score)
            : [],
        selectedTune:
          state.selection instanceof ScoreSelection
            ? state.selection.tune(state.score)
            : null,
        firstTune: state.score.tunes()[0] || null,
        docs: state.doc.show
          ? helpText(state.doc.current || 'nothing-hovered')
          : null,
        currentMenu: state.menu,
        dispatch,
      })
    );
  }
}

// The callback that occurs on mouse move
// - registers a mouse dragged event if the mouse button is held down
// - moves preview note (if necessary)
function mouseMove(event: MouseEvent) {
  const mouseButtonIsDown = event.buttons === 1;
  if (mouseButtonIsDown) {
    const pt = svgCoords(event);
    // If the left mouse button is held down
    if (pt && event.buttons === 1) dispatch(mouseDrag(pt.x, pt.y, pt.page));
  }
}

// Initial render, hooks event listeners
export default async function startController(
  store: Firestore | null,
  isLoggedIn: boolean
) {
  state.isLoggedIn = isLoggedIn;
  state.store = store;

  if (state.store) {
    state.store.onCommit(() => updateView());

    if (state.store.isReadOnly()) {
      state.menu = 'playback';
    }

    const score = state.store.getSavedScore();
    if (score) {
      state.score = score;
    } else {
      throw new Error("Couldn't get starting score from Firestore.");
    }
  } else {
    const opts = await quickStart();
    state.score = opts.toScore();
  }

  loadAudioResources().then(() => dispatch(loadedAudio()));
  state.history.past = [JSON.stringify(state.score.toJSON())];
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch(mouseUp()));
  state.view.score = document.getElementById('score');
  state.view.ui = document.getElementById('interface');
  updateView();
}
