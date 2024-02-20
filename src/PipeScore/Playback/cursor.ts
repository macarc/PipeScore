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

//  Playback cursor - show where the playback currently is on the score

import m from 'mithril';
import { settings } from '../global/settings';
import { getXY } from '../global/xy';
import { PlaybackState } from './state';

export function playbackCursor(state: PlaybackState, page: number) {
  if (state.playing && state.cursor) {
    const xy = getXY(state.cursor);

    if (xy) {
      if (xy.page === page) {
        const x = xy.afterX - 10;
        const y = xy.y - settings.lineGap;
        const width = 10;
        const height = settings.lineHeightOf(6);

        return m('g.playback-cursor', [
          m('rect', {
            x,
            y,
            width,
            height,
            fill: 'dodgerblue',
            opacity: 0.7,
            rx: 5,
            ry: 5,
          }),
        ]);
      }
    }
  }

  return null;
}
