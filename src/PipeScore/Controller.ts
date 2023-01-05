//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
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
import { clearXY } from './global/xy'
import { State } from './State';
import { Score } from './Score';
import {
  GracenoteSelection,
  ScoreSelection,
  TripletLineSelection,
} from './Selection';
import { emptyGracenoteState } from './Gracenote/state';
import renderUI from './UI/view';
import Documentation from './Documentation';
import { svgCoords } from './global/utils';
import { loadSamples } from './Playback';

const state: State = {
  canEdit: true,
  isLoggedIn: false,
  justClickedNote: false,
  preview: null,
  playback: { bpm: 80 },
  menu: 'note',
  doc: { show: true, current: null },
  clipboard: null,
  selection: null,
  score: new Score(),
  history: { past: [], future: [] },
  view: { score: null, ui: null },
};

let save: (score: Score) => void = () => null;

export async function dispatch(event: ScoreEvent): Promise<void> {
  if (!state.canEdit) return;

  const res = await event(state);
  if (res !== Update.NoChange) {
    updateView();
    if (res === Update.MovedThroughHistory || res === Update.ShouldSave) {
      state.score.updateName();
      if (res === Update.ShouldSave) {
        const asJSON = JSON.stringify(state.score.toJSON());
        if (state.history.past[state.history.past.length - 1] !== asJSON) {
          state.history.past.push(asJSON);
          if (state.history.past.length > 30) state.history.past.shift();
          state.history.future = [];
        }
        save(state.score);
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
        { class: state.canEdit ? 'big-top-margin' : '' },
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
        })
      )
    );
  }
  if (state.view.ui && state.canEdit)
    m.render(
      state.view.ui,
      renderUI({
        loggedIn: state.isLoggedIn,
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
        isLandscape: state.score.landscape,
        selectedBar:
          (state.selection instanceof ScoreSelection &&
            state.selection.bar(state.score)) ||
          null,
        docs: state.doc.show
          ? Documentation.get(state.doc.current || '') ||
            'Hover over different icons to view Help here.'
          : null,
        currentMenu: state.menu,
        playbackBpm: state.playback.bpm,
      })
    );
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
export default function startController(
  score: Score,
  saveFn: (score: Score) => void,
  isLoggedIn: boolean,
  canEdit = true
): void {
  save = saveFn;
  state.isLoggedIn = isLoggedIn;
  state.canEdit = canEdit;
  state.score = score;
  loadSamples();
  state.history.past = [JSON.stringify(score.toJSON())];
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch(mouseUp()));
  // initially set the notes to be the right groupings
  state.view.score = document.getElementById('score');
  state.view.ui = document.getElementById('interface');
  save(state.score);
  updateView();
}
