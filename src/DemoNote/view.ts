import { svg, V } from '../render/h';
import { Pitch, noteY } from '../global/pitch';
import { DemoNoteModel } from './model';

export interface DemoNoteProps {
  staveY: number
}

export default function render(demoNote: DemoNoteModel, props: DemoNoteProps): V {
  if (demoNote.pitch) {
    const y = noteY(props.staveY, demoNote.pitch);
    const ledgerWidth = 10;
    return svg('g', { class: 'demo-note' }, [
      svg('ellipse', { cx: demoNote.x, cy: y, rx: 5, ry: 4, fill: 'black', 'pointer-events': 'none' }),
      demoNote.pitch === Pitch.HA ? svg('line', { x1: demoNote.x - ledgerWidth, x2: demoNote.x + ledgerWidth, y1: y, y2: y, stroke: 'black', 'pointer-events': 'none' }) : svg('g')
    ]);
  } else {
    return svg('g');
  }
}
