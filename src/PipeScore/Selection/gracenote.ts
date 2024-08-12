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

import type { IGracenote } from '../Gracenote';
import type { GracenoteState } from '../Gracenote/state';
import type { IScore } from '../Score';
import type { Pitch } from '../global/pitch';
import { DraggableSelection } from './dragging';

export class GracenoteSelection extends DraggableSelection {
  private selected: IGracenote;
  private note: number | 'all';

  constructor(
    gracenote: IGracenote,
    note: number | 'all',
    createdByMouseDown: boolean
  ) {
    super(createdByMouseDown);
    this.selected = gracenote;
    this.note = note;
  }

  override delete(score: IScore) {
    if (this.note === 'all') {
      for (const note of score.flatNotes()) {
        note.replaceGracenote(this.selected, null);
      }
      return null;
    }
    const updated = this.selected.removeSingle(this.note);
    this.changeGracenote(updated, score);
    if (this.note > 0) {
      this.note--;
    }
    if (updated.numberOfNotes() === 0) return null;
    return this;
  }

  override dragOverPitch(pitch: Pitch, score: IScore) {
    if (this.note !== 'all') {
      const dragged = this.selected.drag(pitch, this.note);
      this.changeGracenote(dragged, score);
    }
  }

  changeGracenote(newGracenote: IGracenote, score: IScore) {
    for (const note of score.flatNotes()) {
      note.replaceGracenote(this.selected, newGracenote);
    }
    this.selected = newGracenote;
  }

  moveUp(score: IScore) {
    if (this.note !== 'all') {
      const changed = this.selected.moveUp(this.note);
      if (changed) this.changeGracenote(changed, score);
    }
  }

  moveDown(score: IScore) {
    if (this.note !== 'all') {
      const changed = this.selected.moveDown(this.note);
      if (changed) this.changeGracenote(changed, score);
    }
  }

  nextNote() {
    if (this.note !== 'all' && this.note < this.selected.notes().length - 1)
      this.note++;
  }

  previousNote() {
    if (this.note !== 'all' && this.note > 0) this.note--;
  }

  gracenote() {
    return this.selected;
  }

  state(): GracenoteState {
    return {
      dragged:
        this.dragging() && this.note !== 'all'
          ? { gracenote: this.selected, note: this.note }
          : null,
      selected: { gracenote: this.selected, note: this.note },
    };
  }
}
