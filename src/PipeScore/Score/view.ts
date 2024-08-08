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
import type { IScore } from '.';
import type { Dispatch } from '../Dispatch';
import { clickBackground, mouseUp } from '../Events/Mouse';
import { mouseOffPitch } from '../Events/PitchBoxes';
import type { GracenoteState } from '../Gracenote/state';
import type { NoteState } from '../Note/state';
import { playbackCursor } from '../Playback/cursor';
import type { PlaybackState } from '../Playback/state';
import type { IPreview } from '../Preview';
import type { ISelection } from '../Selection';
import { ScoreSelection } from '../Selection/score';
import type { IStave } from '../Stave';
import { drawStave, trebleClefWidth } from '../Stave/view';
import { drawMovableTextBox } from '../TextBox/view';
import { drawTiming } from '../Timing/view';
import { ITune } from '../Tune';
import { drawTuneHeading } from '../Tune/view';
import { settings } from '../global/settings';
import { foreach } from '../global/utils';
import { setXYPage } from '../global/xy';

interface ScoreProps {
  selection: ISelection | null;
  justAddedNote: boolean;
  preview: IPreview | null;
  noteState: NoteState;
  gracenoteState: GracenoteState;
  playbackState: PlaybackState;
  dispatch: Dispatch;
}

export function drawScore(score: IScore, props: ScoreProps): m.Children {
  const width = score.width();
  const height = score.height();

  const staveWidth = width - 2 * settings.margin;

  const staveProps = (stave: IStave) => ({
    x: settings.margin,
    y: score.staveY(stave),
    justAddedNote: props.justAddedNote,
    width: staveWidth,
    previousStave: score.previousStaveSameTune(stave),
    previousStaveY: score.staveY(stave),
    noteState: props.noteState,
    gracenoteState: props.gracenoteState,
    dispatch: props.dispatch,
  });

  const timingProps = (page: number) => ({
    page,
    score,
    staveStartX: settings.margin + trebleClefWidth,
    staveEndX: width - settings.margin,
    selection: props.selection,
    dispatch: props.dispatch,
  });

  const selectionProps = (i: number) => ({
    page: i,
    score,
    staveStartX: settings.margin + trebleClefWidth,
    staveEndX: width - settings.margin,
  });

  const tuneProps = (tune: ITune) => ({
    y: score.staveY(tune),
    pageWidth: score.width(),
    dispatch: props.dispatch,
  });

  const pages = score.pages();
  const texts = (i: number) => score.textBoxes()[i] || [];

  const rendered = m(
    'div',
    foreach(pages.length, (page) => {
      setXYPage(page);
      return m(
        'svg',
        {
          width: (width * score.zoom) / 100,
          height: (height * score.zoom) / 100,
          viewBox: `0 0 ${width} ${height}`,
          class: page.toString(),
          onmouseup: () => props.dispatch(mouseUp()),
        },
        [
          m('rect', {
            x: '0',
            y: '0',
            width: '100%',
            height: '100%',
            fill: 'white',
            onmousedown: () => props.dispatch(clickBackground()),
            onmouseover: () => props.dispatch(mouseOffPitch()),
          }),
          ...pages[page].map((staveOrTune) =>
            staveOrTune instanceof ITune
              ? drawTuneHeading(staveOrTune, tuneProps(staveOrTune))
              : drawStave(staveOrTune, staveProps(staveOrTune))
          ),
          ...texts(page).map((textBox) =>
            drawMovableTextBox(textBox, {
              scoreWidth: width,
              selection: props.selection,
              dispatch: props.dispatch,
            })
          ),
          ...score.timings().map((timing) => drawTiming(timing, timingProps(page))),
          props.selection instanceof ScoreSelection &&
            props.selection.render(selectionProps(page)),

          playbackCursor(props.playbackState, page),

          score.showNumberOfPages && pages.length > 1
            ? m(
                'text',
                {
                  x: score.width() / 2,
                  y: score.height() - settings.margin + settings.lineHeightOf(5),
                },
                (page + 1).toString()
              )
            : null,
        ]
      );
    })
  );

  // If there are timings that point to nothing,
  // remove them and then redraw the score
  if (score.removeUselessTimings()) {
    return drawScore(score, props);
  }

  return rendered;
}
