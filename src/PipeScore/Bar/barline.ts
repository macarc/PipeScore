// Barlines may be
// - normal (a single vertical line)
// - repeat (a thick line with dots)
// - end (a thick line only)

import m from 'mithril';
import { dispatch } from '../Controller';
import { clickBarline } from '../Events/Bar';
import { settings } from '../global/settings';
import { Obj } from '../global/utils';

interface BarlineProps {
  x: number;
  y: number;
  // atStart : is the barline at the start of the bar or not?
  atStart: boolean;
  drag: (x: number) => void;
}

type BarlineType = 'normal' | 'repeat' | 'end';

export class Barline {
  private type: BarlineType;

  static normal = new Barline('normal');
  static repeat = new Barline('repeat');
  static part = new Barline('end'); // It's called end for "legacy reasons"

  private constructor(type: BarlineType) {
    this.type = type;
  }
  static fromJSON(o: Obj): Barline {
    if (o.type === 'normal') return Barline.normal;
    else if (o.type === 'repeat') return Barline.repeat;
    else if (o.type === 'end') return Barline.part;
    else throw new Error(`Unrecognised barline type ${o.type}`);
  }
  toJSON(): Obj {
    return { type: this.type };
  }
  // Repeat and end barlines must be drawn. Normal barlines may
  // be skipped, e.g. if the previous bar ended in a normal barline,
  // there's no need to draw another normal barline at the start of this bar
  mustDraw() {
    return this.type === 'repeat' || this.type === 'end';
  }
  width() {
    if (this.type === 'normal') {
      return 1;
    } else {
      return 10;
    }
  }
  render(props: BarlineProps) {
    if (this.type === 'normal') {
      return renderNormal(props);
    } else if (this.type === 'repeat') {
      return renderRepeat(props);
    } else {
      return renderPart(props);
    }
  }
}

const lineOffset = 6;
const thickLineWidth = 2.5;
const dragWidth = 2;

function height() {
  return settings.lineHeightOf(4);
}

function renderNormal({ x, y, drag }: BarlineProps) {
  return m('g', [
    m('line', {
      x1: x,
      x2: x,
      y1: y,
      y2: y + height(),
      stroke: 'black',
    }),
    m('rect', {
      x: x - dragWidth,
      y: y,
      width: 2 * dragWidth,
      height: height(),
      opacity: 0,
      style: 'cursor: ew-resize',
      onmousedown: () => dispatch(clickBarline(drag)),
    }),
  ]);
}
function renderRepeat(props: BarlineProps) {
  const { x, y, atStart } = props;
  const circleXOffset = 10;
  const topCircleY = y + settings.lineHeightOf(1.3);
  const bottomCircleY = y + settings.lineHeightOf(2.7);
  const circleRadius = 2;
  const cx = atStart ? x + circleXOffset : x - circleXOffset;
  return m('g[class=barline-repeat]', [
    renderPart(props),
    m('circle', {
      cx,
      cy: topCircleY,
      r: circleRadius,
      fill: 'black',
    }),
    m('circle', {
      cx,
      cy: bottomCircleY,
      r: circleRadius,
      fill: 'black',
    }),
  ]);
}
function renderPart({ x, y, atStart, drag }: BarlineProps) {
  const thickX = atStart ? x : x - thickLineWidth;
  const thinX = atStart ? x + lineOffset : x - lineOffset;
  return m('g[class=barline-end]', [
    m('rect', {
      x: thickX,
      y,
      width: thickLineWidth,
      height: height(),
      fill: 'black',
      style: 'cursor: ew-resize',
      onmousedown: () => dispatch(clickBarline(drag)),
    }),
    m('line', {
      x1: thinX,
      x2: thinX,
      y1: y,
      y2: y + height(),
      stroke: 'black',
    }),
  ]);
}
