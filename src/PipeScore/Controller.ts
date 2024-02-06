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
import { ScoreEvent, Update } from './Events/common';
import { mouseUp, mouseDrag } from './Events/Mouse';
import { clearXY } from './global/xy';
import { State } from './State';
import { Score } from './Score';
import {
  GracenoteSelection,
  ScoreSelection,
  TextSelection,
  TimingSelection,
  TripletLineSelection,
} from './Selection';
import { emptyGracenoteState } from './Gracenote/state';
import renderUI from './UI/view';
import Documentation from './Documentation';
import { svgCoords } from './global/utils';
import { startLoadingSamples } from './Playback';
import { loadedAudio } from './Events/Misc';
import { Firestore } from './Firestore';
import quickStart from './QuickStart';

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
  score: new Score(),
  history: { past: [], future: [] },
  view: { score: null, ui: null },
};

export async function dispatch(event: ScoreEvent): Promise<void> {
  const res = await event(state);
  if (res !== Update.NoChange) {
    updateView();
    if (res === Update.MovedThroughHistory || res === Update.ShouldSave) {
      state.score.updateName();
      if (
        res === Update.ShouldSave &&
        state.store &&
        !state.store.isReadOnly()
      ) {
        const json = state.score.toJSON();
        const jsonString = JSON.stringify(json);
        if (state.history.past[state.history.past.length - 1] !== jsonString) {
          state.history.past.push(jsonString);
          if (state.history.past.length > 30) state.history.past.shift();
          state.history.future = [];
          state.store.save(json);
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
      m(
        'div',
        { class: 'ui-topbar' },
        state.score.render({
          justAddedNote: state.preview?.justAdded() || false,
          noteState: {
            dragged:
              (state.selection instanceof ScoreSelection &&
                state.selection.dragging &&
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
        })
      )
    );
  }
  if (state.view.ui) {
    m.render(
      state.view.ui,
      renderUI({
        saved: state.store ? state.store.isSaved() : false,
        canEdit: !state.store?.isReadOnly(),
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
          state.selection instanceof TextSelection
            ? state.selection.text
            : null,
        selectedTiming:
          state.selection instanceof TimingSelection
            ? state.selection.timing
            : null,
        isLandscape: state.score.landscape,
        selectedStaves:
          (state.selection instanceof ScoreSelection &&
            state.selection.staves(state.score)) ||
          [],
        selectedBar:
          (state.selection instanceof ScoreSelection &&
            state.selection.bar(state.score)) ||
          null,
        docs: state.doc.show
          ? state.doc.current
            ? Documentation[state.doc.current]
            : 'Hover over different icons to view Help here.'
          : null,
        currentMenu: state.menu,
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

  startLoadingSamples(() => dispatch(loadedAudio()));
  state.history.past = [JSON.stringify(state.score.toJSON())];
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch(mouseUp()));
  state.view.score = document.getElementById('score');
  state.view.ui = document.getElementById('interface');
  updateView();
}
