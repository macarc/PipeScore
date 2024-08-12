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

import m from 'mithril'
import { IBar } from ".";
import { Dispatch } from "../Dispatch";
import { GracenoteState } from "../Gracenote/state";
import { NoteState } from "../Note/state";
import { groupNotes, INote, ITriplet, lastNote, NoteOrTriplet } from '../Note';
import width, { Width } from '../global/width';
import { drawNoteGroup, drawTriplet, noteHeadWidth, noteOrTripletWidth, NoteProps, spacerWidth } from '../Note/view';
import { nlast } from '../global/utils';
import { Pitch } from '../global/pitch';

interface BarProps {
  x: number;
  y: number;
  width: number;
  previousBar: IBar | null;
  justAddedNote: boolean;
  endOfLastStave: number;
  noteState: NoteState;
  gracenoteState: GracenoteState;
  dispatch: Dispatch;
}

// Returns an array where the nth item is the offset of the nth note
// from the start of the bar.
function noteOffsets(previousPitch: Pitch | null, notes: NoteOrTriplet[]) {
  const widths = [width.zero()];
  for (let i = 0; i < notes.length; i++) {
    widths.push(
      width.add(
        nlast(widths),
        noteOrTripletWidth(
          notes[i],
          i === 0 ? previousPitch : lastNote(notes[i - 1]).pitch()
        )
      )
    );
  }

  // In bars with single notes, we want to display the note forward of the middle,
  // so add a bit on the end.
  const extraWidth =
    notes.length === 1 && notes[0] instanceof INote
      ? width.init(noteHeadWidth, 1)
      : width.zero();

  return {
    widths,
    total: width.addAll(nlast(widths), spacerWidth(), extraWidth),
  };
}

export function barWidth(bar: IBar, previousPitch: Pitch | null): Width {
  return noteOffsets(previousPitch, bar.nonPreviewNotes()).total;
}

export function drawBar(bar: IBar, props: BarProps): m.Children {
  const partNotes = bar.notes();
  const actualNotes = bar.nonPreviewNotes();
  const groupedNotes = groupNotes(
    actualNotes,
    bar.measure().timeSignature().beatDivision()
  );

  const previousNote = props.previousBar?.lastNote() || null;
  const previousPitch = props.previousBar?.lastPitch() || null;

  const beats = noteOffsets(previousPitch, actualNotes);
  const numberOfBeats = beats.total.extend;
  const beatWidth = (props.width - beats.total.min) / numberOfBeats;

  const xOf = (i: number) => props.x + width.reify(beats.widths[i], beatWidth);

  const preview = bar.preview();

  // There are a few special cases to deal with single notes being further
  // forward than they should be.
  const previewX = preview
    ? partNotes.length === 1
      ? props.x - props.width / 5
      : partNotes.length === 2
        ? partNotes[0] === preview
          ? bar.measure().isAnacrusis()
            ? props.x - 10
            : props.x
          : xOf(bar.notesAndTriplets().indexOf(preview)) + beatWidth / 2
        : xOf(bar.notesAndTriplets().indexOf(preview)) - noteHeadWidth
    : 0;

  const noteProps = (notes: INote[] | ITriplet): NoteProps => {
    const firstNote = notes instanceof ITriplet ? notes : notes[0];
    const index = actualNotes.indexOf(firstNote);
    return {
      x: xOf(index),
      y: props.y,
      harmonyIndex: bar.harmonyIndex(),
      justAddedNote: props.justAddedNote,
      boxToLast: index === 0 ? props.x : 'lastnote',
      noteWidth: beatWidth,
      previousNote: index === 0 ? previousNote : lastNote(actualNotes[index - 1]),
      endOfLastStave: props.endOfLastStave,
      state: props.noteState,
      gracenoteState: props.gracenoteState,
      dispatch: props.dispatch,
    };
  };

  return [
    ...groupedNotes.map((notes) =>
      notes instanceof ITriplet
        ? drawTriplet(notes, noteProps(notes))
        : drawNoteGroup(notes, noteProps(notes))
    ),
    preview
      ? drawNoteGroup([preview], {
          x: previewX,
          y: props.y,
          harmonyIndex: bar.harmonyIndex(),
          justAddedNote: props.justAddedNote,
          boxToLast: 'lastnote',
          noteWidth: beatWidth / 2,
          previousNote: null,
          endOfLastStave: props.endOfLastStave,
          state: props.noteState,
          gracenoteState: props.gracenoteState,
          dispatch: props.dispatch,
        }) || null
      : null,
  ];
}