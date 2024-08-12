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

import m from 'mithril';
import type { IMeasure } from '.';
import { barlineWidth, drawBarline } from '../Barline/view';
import type { Dispatch } from '../Dispatch';
import { clickBar } from '../Events/Bar';
import { addNoteToBarEnd } from '../Events/Note';
import { mouseOverPitch } from '../Events/PitchBoxes';
import type { GracenoteState } from '../Gracenote/state';
import { INote, ITriplet, type NoteOrTriplet, groupNotes, lastNote } from '../Note';
import type { NoteState } from '../Note/state';
import {
  type NoteProps,
  drawNoteGroup,
  drawTriplet,
  noteHeadWidth,
  noteOrTripletWidth,
  spacerWidth,
} from '../Note/view';
import { pitchBoxes } from '../PitchBoxes';
import { drawTimeSignature } from '../TimeSignature/view';
import type { Pitch } from '../global/pitch';
import { settings } from '../global/settings';
import { nlast } from '../global/utils';
import width from '../global/width';
import { setXY } from '../global/xy';

interface BarProps {
  x: number;
  y: number;
  width: number;
  justAddedNote: boolean;
  previousBar: IMeasure | null;
  shouldRenderLastBarline: boolean;
  mustNotRenderFirstBarline: boolean;
  endOfLastStave: number;
  canResize: (newWidth: number) => boolean;
  resize: (widthChange: number) => void;
  noteState: NoteState;
  gracenoteState: GracenoteState;
  dispatch: Dispatch;
}

export function minWidth(measure: IMeasure, previousBar: IMeasure | null) {
  const totalReifiedWidth = Math.max(
    ...measure
      .bars()
      .map((bar, i) =>
        width.reify(
          noteOffsets(
            previousBar?.bars()[i].lastPitch() || null,
            bar.nonPreviewNotes()
          ).total,
          5
        )
      )
  );
  const previousTimeSignature = previousBar?.timeSignature() || null;
  const drawTimeSignature =
    previousTimeSignature && !measure.timeSignature().equals(previousTimeSignature);
  return Math.max(
    totalReifiedWidth + (drawTimeSignature ? 0 : measure.timeSignature().width()),
    60
  );
}

export function totalFixedWidth(bar: IMeasure, previousBar: IMeasure | null) {
  if (bar.fixedWidth !== 'auto') return bar.fixedWidth;
  return minWidth(bar, previousBar);
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

export function drawMeasure(measure: IMeasure, props: BarProps): m.Children {
  const hasTimeSignature =
    props.previousBar !== null
      ? !props.previousBar.timeSignature().equals(measure.timeSignature())
      : true;

  const barWidth =
    props.width -
    (hasTimeSignature ? measure.timeSignature().width() : 0) -
    // Uhh.. not sure why this is here
    (noteHeadWidth * 2) / 3 -
    barlineWidth(measure.startBarline()) -
    barlineWidth(measure.endBarline());

  const xAfterTimeSignature =
    props.x + (hasTimeSignature ? measure.timeSignature().width() : 0);
  const xAfterBarline = xAfterTimeSignature + barlineWidth(measure.startBarline());

  // note that the pitch boxes must extend the whole width of the bar because they are used to drag notes
  // but not if placing notes, because that causes strange behaviour where clicking in-between gracenote and
  // note adds a note to the start of the bar
  return m(
    'g[class=bar]',
    measure.bars().map((bar, p) => {
      const staveY = props.y + p * settings.harmonyStaveHeight();
      setXY(bar.id, props.x, props.x + props.width, staveY, bar.harmonyIndex());

      const isHarmony = p > 0;

      const partNotes = bar.notes();
      const actualNotes = bar.nonPreviewNotes();
      const groupedNotes = groupNotes(
        actualNotes,
        measure.timeSignature().beatDivision()
      );

      const previousNote = props.previousBar?.bars()[p]?.lastNote() || null;
      const previousPitch = props.previousBar?.bars()[p]?.lastPitch() || null;

      const beats = noteOffsets(previousPitch, actualNotes);
      const numberOfBeats = beats.total.extend;
      const beatWidth = (barWidth - beats.total.min) / numberOfBeats;

      const xOf = (i: number) =>
        xAfterBarline + width.reify(beats.widths[i], beatWidth);

      const preview = bar.preview(p);

      // There are a few special cases to deal with single notes being further
      // forward than they should be.
      const previewX = preview
        ? partNotes.length === 1
          ? xAfterBarline - barWidth / 5
          : partNotes.length === 2
            ? partNotes[0] === preview
              ? measure.isAnacrusis()
                ? xAfterBarline - 10
                : xAfterBarline
              : xOf(bar.notesAndTriplets().indexOf(preview)) + beatWidth / 2
            : xOf(bar.notesAndTriplets().indexOf(preview)) - noteHeadWidth
        : 0;

      const noteProps = (notes: INote[] | ITriplet): NoteProps => {
        const firstNote = notes instanceof ITriplet ? notes : notes[0];
        const index = actualNotes.indexOf(firstNote);
        return {
          x: xOf(index),
          y: staveY,
          harmonyIndex: bar.harmonyIndex(),
          justAddedNote: props.justAddedNote,
          boxToLast: index === 0 ? xAfterBarline : 'lastnote',
          noteWidth: beatWidth,
          previousNote:
            index === 0 ? previousNote : lastNote(actualNotes[index - 1]),
          endOfLastStave: props.endOfLastStave,
          state: props.noteState,
          gracenoteState: props.gracenoteState,
          dispatch: props.dispatch,
        };
      };

      return [
        pitchBoxes(
          xAfterBarline,
          staveY,
          barWidth,
          (pitch) => props.dispatch(mouseOverPitch(pitch, bar)),
          (pitch, e) =>
            props.noteState.inputtingNotes
              ? props.dispatch(addNoteToBarEnd(pitch, bar))
              : props.dispatch(clickBar(bar, e)),
          props.justAddedNote
        ),
        ...groupedNotes.map((notes) =>
          notes instanceof ITriplet
            ? drawTriplet(notes, noteProps(notes))
            : drawNoteGroup(notes, noteProps(notes))
        ),
        preview
          ? drawNoteGroup([preview], {
              x: previewX,
              y: staveY,
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

        measure.startBarline().mustDraw() ||
        (hasTimeSignature && !props.mustNotRenderFirstBarline)
          ? drawBarline(measure.startBarline(), {
              x: xAfterTimeSignature,
              y: staveY,
              atStart: true,
              isHarmony,
              drag: () => null,
              dispatch: props.dispatch,
            })
          : null,
        measure.endBarline().mustDraw() || props.shouldRenderLastBarline
          ? drawBarline(measure.endBarline(), {
              x: props.x + props.width,
              y: staveY,
              atStart: false,
              isHarmony,
              drag: (x) => {
                const newWidth = x - props.x;
                // The reason we can't just do props.width here is that when
                // this is called in the future, props.width may be out of date
                const oldWidth =
                  measure.fixedWidth === 'auto' ? props.width : measure.fixedWidth;
                if (props.canResize(newWidth)) {
                  props.resize(newWidth - oldWidth);
                  measure.fixedWidth = newWidth;
                }
              },
              dispatch: props.dispatch,
            })
          : null,
        hasTimeSignature
          ? drawTimeSignature(measure.timeSignature(), {
              x: props.x + 10,
              y: staveY,
              dispatch: props.dispatch,
            })
          : null,
      ];
    })
  );
}
