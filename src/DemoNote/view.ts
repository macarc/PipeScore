import { svg, V } from '../render/h';
import { noteY } from '../global/pitch';
import { DemoNoteModel } from './model';

export interface DemoNoteProps {
  staveY: number
}

export default function render(demoNote: DemoNoteModel, props: DemoNoteProps): V {
  return svg('g', { class: 'demo-note' }, [
    svg('ellipse', { cx: demoNote.x, cy: noteY(props.staveY, demoNote.pitch), rx: 5, ry: 4, fill: 'black', 'pointer-events': 'none' })
  ]);
}
