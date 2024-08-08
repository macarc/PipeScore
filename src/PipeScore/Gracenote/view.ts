import m from 'mithril';
import type { IGracenote } from '.';
import type { Dispatch } from '../Dispatch';
import { clickGracenote } from '../Events/Gracenote';
import { Pitch, pitchY } from '../global/pitch';
import { settings } from '../global/settings';
import type { GracenoteNoteList } from './gracenotes';
import type { GracenoteState } from './state';

// Offsets from the centre of the gracenote head to the point where the stem touches it
const stemXOf = (x: number) => x + 2.5;
const colourOf = (selected: boolean) => (selected ? 'orange' : 'black');

export interface GracenoteProps {
  thisNote: Pitch;
  previousNote: Pitch | null;
  y: number;
  x: number;
  preview: boolean;
  state: GracenoteState;
  dispatch: Dispatch;
}

const tailXOffset = 2.5;
const gracenoteHeadRadius = 3;
const gracenoteHeadHeight = 2;
const gracenoteHeadWidth = 2 * gracenoteHeadRadius;
const gracenoteHeadGap = 1.5 * gracenoteHeadWidth;

export function gracenoteWidth(
  grace: IGracenote,
  thisNote: Pitch,
  previousNote: Pitch | null
) {
  const notes = grace.notes(thisNote, previousNote);
  const length = notes.length;
  return gracenoteHeadGap * length + settings.gapAfterGracenote;
}

// Draws head and stem
function head(
  x: number,
  y: number,
  note: Pitch,
  beamY: number,
  isValid: boolean,
  isSelected: boolean,
  isPreview: boolean,
  dragging: boolean,
  onmousedown: () => void
): m.Children {
  const stemY = y - 1;
  const ledgerLeft = 5;
  const ledgerRight = 5.1;
  const rotateText = `rotate(-30 ${x} ${y})`;
  const boxWidth = 3 * gracenoteHeadRadius;
  const boxHeight = 8;
  const colour = colourOf(isSelected);

  return m('g[class=gracenote-head]', [
    note === Pitch.HA
      ? m('line', {
          x1: x - ledgerLeft,
          x2: x + ledgerRight,
          y1: y,
          y2: y,
          stroke: colour,
        })
      : null,
    m('ellipse', {
      cx: x,
      cy: y,
      rx: gracenoteHeadRadius,
      ry: gracenoteHeadHeight,
      transform: rotateText,
      fill: isValid ? colour : 'red',
      'pointer-events': 'none',
    }),

    m('rect', {
      x: x - boxWidth / 2,
      y: y - boxHeight / 2,
      width: boxWidth,
      height: boxHeight,
      'pointer-events': isPreview || dragging ? 'none' : 'default',
      style: `cursor: ${isSelected ? 'normal' : 'pointer'}`,
      opacity: 0,
      onmousedown,
    }),
    m('line', {
      x1: x + tailXOffset,
      x2: x + tailXOffset,
      y1: stemY,
      y2: beamY,
      stroke: colour,
    }),
  ]);
}

function drawSingle(note: Pitch, grace: IGracenote, props: GracenoteProps) {
  const y = pitchY(props.y, note);
  const wholeSelected =
    props.state.selected?.gracenote === grace &&
    props.state.selected?.note === 'all';
  const selected =
    props.state.selected?.gracenote === grace &&
    (props.state.selected?.note === 0 || wholeSelected);

  const colour = colourOf(wholeSelected || props.preview);
  const height = settings.lineHeightOf(3);

  return m('g[class=gracenote]', [
    head(
      props.x,
      y,
      note,
      y - height,
      true,
      props.preview || selected,
      props.preview,
      props.state.dragged !== null,
      () => props.dispatch(clickGracenote(grace, 0))
    ),

    ...[0, 1, 2].map((n) =>
      m('line', {
        x1: stemXOf(props.x),
        x2: stemXOf(props.x) + 5,
        y1: y - height + 3 * n,
        y2: y - height + 4 + 3 * n,
        stroke: colour,
      })
    ),
  ]);
}

function drawMultiple(
  pitches: GracenoteNoteList,
  grace: IGracenote,
  props: GracenoteProps
) {
  const wholeSelected =
    props.state.selected?.gracenote === grace &&
    props.state.selected?.note === 'all';

  const x = (i: number) =>
    props.x + settings.gapAfterGracenote / 2 + i * gracenoteHeadGap;
  const y = (p: Pitch) => pitchY(props.y, p);

  const colour = colourOf(wholeSelected || props.preview);
  const beamY = props.y - settings.lineHeightOf(3.5);
  const tailStart = x(0) + tailXOffset - 0.5;
  const tailEnd = x(pitches.length - 1) + tailXOffset + 0.5;
  const clickBoxMargin = 3;
  return m('g[class=reactive-gracenote]', [
    ...[0, 2, 4].map((i) =>
      m('line', {
        x1: tailStart,
        x2: tailEnd,
        y1: beamY + i,
        y2: beamY + i,
        stroke: colour,
      })
    ),
    m('rect', {
      x: tailStart,
      y: beamY - clickBoxMargin,
      width: tailEnd - tailStart,
      height: 4 + 2 * clickBoxMargin,
      opacity: 0,
      style: 'cursor: pointer;',
      onmousedown: () => props.dispatch(clickGracenote(grace, 'all')),
    }),
    ...pitches.map((pitch, i) =>
      head(
        x(i),
        y(pitch),
        pitch,
        beamY,
        !pitches.invalid,
        props.preview ||
          (props.state.selected?.gracenote === grace &&
            (i === props.state.selected?.note || wholeSelected)),
        props.preview,
        props.state.dragged !== null,
        () => props.dispatch(clickGracenote(grace, i))
      )
    ),
  ]);
}

export function drawGracenote(
  gracenote: IGracenote,
  props: GracenoteProps
): m.Children {
  const pitches = gracenote.notes(props.thisNote, props.previousNote);

  switch (pitches.length) {
    case 0:
      return m('g');
    case 1:
      return drawSingle(pitches[0], gracenote, props);
    default:
      return drawMultiple(pitches, gracenote, props);
  }
}
