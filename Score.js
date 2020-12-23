const Score = {
  render: (score, props) => {
    const width = 210 * 5;
    const height = 297 * 5;
    const margin = 30;
    const staveGap = 100;
    const topOffset = 150;
    const updateStave = (stave, index) => {
      score.staves[index] = stave;
      props.updateScore(score);
    }
    
    const staveProps = (stave, index) => ({
      x: margin,
      y: index * staveGap + topOffset,
      width: width - 2 * margin,
      // || null so it is not 'undefined' but 'null'
      previousStave: score.staves[index - 1] || null,
      updateStave
    });
  
    return svg`<svg width=${width} height=${height}>
      <rect x="0" y="0" width="100%" height="100%" fill="white" />
  
      ${score.staves.map((stave,idx) => svg.for(stave)`
        ${Stave.render(stave, staveProps(stave,idx))}
      `)}
    </svg>`;
  },
  
  
  init: () => ({
    staves: [Stave.init(),Stave.init()]
  })
}
