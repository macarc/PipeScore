import { svg, V } from '../../render/h';
import { dispatch } from '../Controller';
import { clickBarline } from '../Controllers/Bar';
import { settings } from '../global/settings';
import { Obj } from '../global/utils';

type Drag = (x: number) => void;

export abstract class Barline {
  abstract render(drag: Drag, x: number, y: number, atStart: boolean): V;
  abstract toJSON(): Obj;
  protected lineOffset = 6;
  protected thickLineWidth = 2.5;

  public drag: Drag = () => null;

  public symmetric = true;

  public static fromJSON(o: Obj): Barline {
    switch (o.type) {
      case 'normal':
        return new NormalB();
      case 'repeat':
        return new RepeatB();
      case 'end':
        return new EndB();
      default:
        throw new Error(`Unrecognised barline type: ${o.type}`);
    }
  }

  protected height() {
    return settings.lineHeightOf(4);
  }
  public width() {
    return 10;
  }
}
export class NormalB extends Barline {
  public toJSON() {
    return { type: 'normal' };
  }
  public width() {
    return 1;
  }
  public render(drag: Drag, x: number, y: number) {
    this.drag = drag;
    const dragWidth = 2;
    return svg('g', [
      svg('line', {
        x1: x,
        x2: x,
        y1: y,
        y2: y + this.height(),
        stroke: 'black',
      }),
      svg(
        'rect',
        {
          x: x - dragWidth,
          y: y,
          width: 2 * dragWidth,
          height: this.height(),
          opacity: 0,
          style: 'cursor: ew-resize',
        },
        { mousedown: () => dispatch(clickBarline(this)) }
      ),
    ]);
  }
}
export class RepeatB extends Barline {
  public toJSON() {
    return { type: 'repeat' };
  }
  public symmetric = false;

  public render(drag: Drag, x: number, y: number, atStart: boolean) {
    this.drag = drag;
    const circleXOffset = 10;
    const topCircleY = y + settings.lineHeightOf(1.3);
    const bottomCircleY = y + settings.lineHeightOf(2.7);
    const circleRadius = 2;
    const cx = atStart ? x + circleXOffset : x - circleXOffset;
    return svg('g', { class: 'barline-repeat' }, [
      new EndB().render(drag, x, y, atStart),
      svg('circle', {
        cx,
        cy: topCircleY,
        r: circleRadius,
        fill: 'black',
      }),
      svg('circle', {
        cx,
        cy: bottomCircleY,
        r: circleRadius,
        fill: 'black',
      }),
    ]);
  }
}
export class EndB extends Barline {
  public toJSON() {
    return { type: 'end' };
  }
  public symmetric = false;

  public render(drag: Drag, x: number, y: number, atStart: boolean) {
    this.drag = drag;
    const thickX = atStart ? x : x - this.thickLineWidth;
    const thinX = atStart ? x + this.lineOffset : x - this.lineOffset;
    return svg('g', { class: 'barline-end' }, [
      svg(
        'rect',
        {
          x: thickX,
          y,
          width: this.thickLineWidth,
          height: this.height(),
          fill: 'black',
          style: 'cursor: ew-resize',
        },
        { mousedown: () => dispatch(clickBarline(this)) }
      ),
      svg('line', {
        x1: thinX,
        x2: thinX,
        y1: y,
        y2: y + this.height(),
        stroke: 'black',
      }),
    ]);
  }
}
