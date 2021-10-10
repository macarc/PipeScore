import { svg, V } from '../../render/h';
import { settings } from '../global/settings';

export abstract class Barline {
  abstract render(x: number, y: number, atStart: boolean): V;
  protected lineOffset = 6;
  protected thickLineWidth = 2.5;

  public symmetric = true;

  protected height() {
    return settings.lineHeightOf(4);
  }
  public width() {
    return 10;
  }
}
export class NormalB extends Barline {
  public width() {
    return 1;
  }
  public render(x: number, y: number) {
    return svg('line', {
      x1: x,
      x2: x,
      y1: y,
      y2: y + this.height(),
      stroke: 'black',
    });
  }
}
export class RepeatB extends Barline {
  public symmetric = false;

  public render(x: number, y: number, atStart: boolean) {
    const circleXOffset = 10;
    const topCircleY = y + settings.lineHeightOf(1.3);
    const bottomCircleY = y + settings.lineHeightOf(2.7);
    const circleRadius = 2;
    const cx = atStart ? x + circleXOffset : x - circleXOffset;
    return svg('g', { class: 'barline-repeat', 'pointer-events': 'none' }, [
      new EndB().render(x, y, atStart),
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
  public symmetric = false;

  public render(x: number, y: number, atStart: boolean) {
    const thickX = atStart ? x : x - this.thickLineWidth;
    const thinX = atStart ? x + this.lineOffset : x - this.lineOffset;
    return svg('g', { class: 'barline-end', 'pointer-events': 'none' }, [
      svg('rect', {
        x: thickX,
        y,
        width: this.thickLineWidth,
        height: this.height(),
        fill: 'black',
      }),
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
