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

//  LinearScore is a representation of an IScore as a simple list, that can
//  then be used to generate BWW text

import { Barline } from '../PipeScore/Barline';
import { type INote, ITriplet, groupNotes } from '../PipeScore/Note';
import { shortBeamDirection } from '../PipeScore/Note/noteview';
import type { IScore } from '../PipeScore/Score';
import type { ITimeSignature } from '../PipeScore/TimeSignature';
import type { Pitch } from '../PipeScore/global/pitch';
import {
  BBarline,
  BBeatBreak,
  BClef,
  BGracenote,
  BNote,
  BTerminatingBarline,
  BTimeSignature,
  BTripletEnd,
  BTripletStart,
  type BWWItem,
} from './BWWItem';

type LinearScore = BWWItem[];

export function toLinearScore(score: IScore): LinearScore {
  if (score.staves().length === 0) {
    return [new BClef()];
  }
  const linear: LinearScore = [];

  let previousPitch: Pitch | null = null;
  let previousTimeSignature: ITimeSignature | null = null;

  const pushNotes = (group: INote[]) => {
    for (const note of group) {
      linear.push(
        new BGracenote(note.gracenote().notes(note.pitch(), previousPitch))
      );
      linear.push(
        new BNote(
          note.pitch(),
          note.length(),
          note.natural(),
          group.length > 1 ? shortBeamDirection(group, group.indexOf(note)) : null
        )
      );

      previousPitch = note.pitch();
    }
  };

  for (const stave of score.staves()) {
    linear.push(new BClef());
    for (const measure of stave.measures()) {
      if (
        previousTimeSignature === null ||
        !measure.timeSignature().equals(previousTimeSignature)
      ) {
        linear.push(new BTimeSignature(measure.timeSignature()));
        previousTimeSignature = measure.timeSignature();
      }

      linear.push(new BBarline(measure.startBarline(), true));

      // TODO : support harmony staves
      const groupedNotes = groupNotes(
        measure.bars()[0].nonPreviewNotes(),
        measure.timeSignature().beatDivision()
      );

      for (const group of groupedNotes) {
        linear.push(new BBeatBreak());

        if (Array.isArray(group)) {
          pushNotes(group);
        } else if (group instanceof ITriplet) {
          linear.push(new BTripletStart());
          pushNotes(group.tripletSingleNotes());
          linear.push(new BTripletEnd());
        } else {
          throw new Error('Failed to export to BWW: unrecognised group type');
        }
      }

      linear.push(new BBarline(measure.endBarline(), false));
    }
    linear.push(new BTerminatingBarline());
  }
  return validate(linear);
}

function validate(linearScore: LinearScore): LinearScore {
  for (let i = 0; i < linearScore.length; i++) {
    const current = linearScore[i];
    const previous = linearScore[i - 1];

    // Collapse barlines adjacent to terminating barlines
    if (current instanceof BTerminatingBarline && previous instanceof BBarline) {
      if (previous.type === Barline.normal) {
        linearScore.splice(i - 1, 1);
      } else {
        linearScore.splice(i, 1);
      }
      return validate(linearScore);
    }

    // Collapse adjacent barlines
    if (
      current instanceof BBarline &&
      previous instanceof BBarline &&
      current.start === true &&
      previous.start === false
    ) {
      if (current.type === Barline.normal) {
        linearScore.splice(i, 1);
      } else {
        linearScore.splice(i - 1, 1);
      }
      return validate(linearScore);
    }
  }

  return linearScore;
}
