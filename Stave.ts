import { svg } from 'uhtml';
import { lineHeightOf, Svg } from './all';
import Bar, { BarModel } from './Bar';

export interface StaveModel {
  bars: BarModel[]
}


interface StaveProps {
  x: number,
  y: number,
  width: number,
  previousStave: StaveModel | null,
  updateStave: (newStave: StaveModel) => void
}

function render(stave: StaveModel, props: StaveProps): Svg {
  const staveHeight = props.y;
  
  const staveLines = [...Array(5).keys()].map(idx => lineHeightOf(idx) + staveHeight);

  const barWidth = props.width / stave.bars.length;

  const getX = (barIdx: number) => barIdx * barWidth + props.x;

  const previousBar = (barIdx: number) => barIdx === 0
    ? (props.previousStave ? props.previousStave.bars[props.previousStave.bars.length - 1] : null)
    : stave.bars[barIdx - 1];

  const updateBar = (index: number) => (bar: BarModel) => {
    stave.bars[index] = bar;
    props.updateStave(stave);
  }

  const barProps = (bar: BarModel, index: number) => ({
    x: getX(index),
    y: staveHeight,
    width: barWidth,
    previousBar: previousBar(index),
    updateBar: updateBar(index)
  });

  return svg`
    <g class="stave">
      <g class="notes">
        ${stave.bars.map(
          (bar,idx) => svg.for(bar)`${Bar.render(bar, barProps(bar,idx))}`
        )}
      </g>
      <g class="stave-lines">
        ${staveLines.map(
          y => svg`<line x1=${props.x} x2=${props.x + props.width} y1=${y} y2=${y} stroke="black" />`
        )}
      </g>
    </g>
  `
};
const init: () => StaveModel = () => ({
  bars: [Bar.init(),Bar.init(),Bar.init(),Bar.init()]
})

export default {
  render,
  init
}
