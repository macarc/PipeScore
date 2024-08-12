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
import { barlineWidth, drawBarline } from '../Barline/view';
import type { Dispatch } from '../Dispatch';
import { clickBar } from '../Events/Bar';
import { addNoteToBarEnd } from '../Events/Note';
import { mouseOverPitch } from '../Events/PitchBoxes';
import type { GracenoteState } from '../Gracenote/state';
import type { IMeasure } from '../Measure';
import type { NoteState } from '../Note/state';
import {
  noteHeadWidth,
} from '../Note/view';
import { pitchBoxes } from '../PitchBoxes';
import { drawTimeSignature } from '../TimeSignature/view';
import { settings } from '../global/settings';
import width from '../global/width';
import { setXY } from '../global/xy';
import { barWidth, drawBar } from '../Bar/view';

interface MeasureProps {
  x: number;
  y: number;
  width: number;
  justAddedNote: boolean;
  previousMeasure: IMeasure | null;
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
          barWidth(
            bar,
            previousBar?.bars()[i].lastPitch() || null,
          ),
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

export function drawMeasure(measure: IMeasure, props: MeasureProps): m.Children {
  const hasTimeSignature =
    props.previousMeasure !== null
      ? !props.previousMeasure.timeSignature().equals(measure.timeSignature())
      : true;

  const actualBarWidth =
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
      const isHarmony = p > 0;
      setXY(bar.id, props.x, props.x + props.width, staveY, bar.harmonyIndex());

      return [
        pitchBoxes(
          xAfterBarline,
          staveY,
          actualBarWidth,
          (pitch) => props.dispatch(mouseOverPitch(pitch, bar)),
          (pitch, e) =>
            props.noteState.inputtingNotes
              ? props.dispatch(addNoteToBarEnd(pitch, bar))
              : props.dispatch(clickBar(bar, e)),
          props.justAddedNote
        ),

        drawBar(bar, {
          x: xAfterBarline,
          y: staveY,
          width: actualBarWidth,
          previousBar: props.previousMeasure?.bars()[p] || null,
          justAddedNote: props.justAddedNote,
          endOfLastStave: props.endOfLastStave,
          noteState: props.noteState,
          gracenoteState: props.gracenoteState,
          dispatch: props.dispatch,
        }),

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
