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
import { ITiming, TimingLine } from '.';
import { Dispatch } from '../Dispatch';
import { clickTiming, editTimingText } from '../Events/Timing';
import { IScore } from '../Score';
import { ISelection } from '../Selection';
import { TimingSelection } from '../Selection/timing';
import { settings } from '../global/settings';
import { foreach } from '../global/utils';
import { getXY, getXYRangeForPage } from '../global/xy';

interface TimingProps {
  score: IScore;
  page: number;
  staveStartX: number;
  staveEndX: number;
  selection: ISelection | null;
  dispatch: Dispatch;
}

function drawLine(
  timing: ITiming,
  line: TimingLine,
  props: TimingProps
): m.Children {
  const { start, end } = getXYRangeForPage(
    line.start,
    line.end,
    props.page,
    props.score,
    true
  );

  if (start && end) {
    const isSelected =
      props.selection instanceof TimingSelection &&
      props.selection.timing === timing;

    const colour = isSelected ? 'orange' : 'black';

    const height = 45;
    const mid = 30;
    const clickWidth = 10;

    const y = (i: number) =>
      props.score.staveY(props.score.staves()[i]) + settings.staveGap;

    const horizontal = (x1: number, x2: number, y: number) =>
      m('line', {
        x1,
        x2,
        y1: y - height,
        y2: y - height,
        stroke: colour,
      });
    const vertical = (x: number, y: number) =>
      m('line', {
        x1: x,
        x2: x,
        y1: y - mid,
        y2: y - height,
        stroke: colour,
      });

    const dragBox = (x: number, y: number, start: boolean) =>
      m('rect', {
        x: x - clickWidth / 2,
        y: y - height,
        width: clickWidth,
        height: height - mid,
        opacity: 0,
        cursor: 'ew-resize',
        onmousedown: () => props.dispatch(clickTiming(timing, line.part(start))),
      });

    const bXY = getXY(line.end);
    const bIsOnALaterPage = bXY === null || props.page < bXY.page;
    const drawAfterB = line.drawUntilAfterEnd || bIsOnALaterPage;
    const lastx = drawAfterB ? end.afterX : end.beforeX;
    const verticalLines = [
      vertical(start.beforeX, start.y),
      dragBox(start.beforeX, start.y, true),
      drawAfterB ? vertical(lastx, end.y) : null,
      drawAfterB ? dragBox(lastx, end.y, false) : null,
    ];

    const staveStartIndex = props.score
      .staves()
      .findIndex((s) => s.includesID(start.id));
    const staveEndIndex = props.score
      .staves()
      .findIndex((s) => s.includesID(end.id));
    const stavesBetween = staveEndIndex - staveStartIndex - 1;

    return m('g', [
      ...(start.y === end.y
        ? [horizontal(start.beforeX, lastx, start.y), ...verticalLines]
        : [
            horizontal(start.beforeX, props.staveEndX, start.y),
            vertical(props.staveEndX, start.y),

            horizontal(props.staveStartX, lastx, end.y),
            vertical(props.staveStartX, end.y),

            ...foreach(stavesBetween, (i) => staveStartIndex + i + 1).map((i) =>
              m('g', [
                horizontal(props.staveStartX, props.staveEndX, y(i)),
                vertical(props.staveStartX, y(i)),
                vertical(props.staveEndX, y(i)),
              ])
            ),
            ...verticalLines,
          ]),
      m(
        'text',
        {
          x: start.beforeX + 5,
          y: start.y - (height * 2) / 3,
          onmousedown: () => props.dispatch(clickTiming(timing, line.part(true))),
          ondblclick: () => props.dispatch(editTimingText(timing)),
        },
        line.start === start.id ? line.text : ''
      ),
    ]);
  }

  return null;
}

export function drawTiming(timing: ITiming, props: TimingProps) {
  return m(
    'g[class=timing]',
    timing.lines().map((line) => drawLine(timing, line, props))
  );
}
