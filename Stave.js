
const Stave = {
  render: (stave, props) => {
    const staveHeight = props.y;
    
    const staveLines = [...Array(5).keys()].map(idx => lineHeightOf(idx) + staveHeight);

    const barWidth = props.width / stave.bars.length;

    const getX = barIdx => barIdx * barWidth + props.x;

    const previousBar = barIdx => barIdx === 0
      ? (props.previousStave ? props.previousStave.bars[props.previousStave.bars.length - 1] : null)
      : stave.bars[barIdx - 1];

    const updateBar = (bar, index) => {
      stave.bars[index] = bar;
      props.updateStave(stave);
    }

    const barProps = (bar, index) => ({
      x: getX(index),
      y: staveHeight,
      width: barWidth,
      previousBar: previousBar(index),
      updateBar
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
  },
  init: () => ({
    bars: [Bar.init(),Bar.init(),Bar.init(),Bar.init()]
  })
}