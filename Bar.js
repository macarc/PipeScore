
const Bar = {
  dragBoxes: (x,y,width,mouseDrag) => {
    // Invisible rectangles that are used to detect note dragging
    const height = lineGap / 2;

    return svg`<g class="drag-boxes">

      <rect x=${x} y=${y - 4 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseDrag('HA')} opacity="0" />
      <rect x=${x} y=${y + 3.5 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseDrag('G')} opacity="0" />

      ${[...noteHeights.entries()].map(([note,boxY]) => 
        svg`<rect
          x=${x}
          y=${y + lineGap * boxY - lineGap / 2}
          width=${width}
          height=${height}
          onmouseover=${() => mouseDrag(note)}
          opacity="0"
          />`)}
    </g>`
  },
  render: (bar,props) => {
    const staveY = props.y;


    const previousWholeNote = props.previousBar ? props.previousBar.notes[props.previousBar.notes.length - 1] : null;
    const previousNote = Note.lastNoteOfWholeNote(previousWholeNote);
    const previousNoteOf = noteIndex => noteIndex === 0
      ? previousNote
      : bar.notes[noteIndex - 1] || null;
    
    const beats = bar.notes
      .reduce((nums, n) =>
        [...nums, nums[nums.length - 1] + Note.totalBeatWidth(n,previousNoteOf(n))],
        [1]);
    
    const totalNumberOfBeats = beats[beats.length - 1];
    const beatWidth = props.width / totalNumberOfBeats;

    const getX = noteIndex => props.x + beatWidth * beats[noteIndex];

    const updateNote = (note, index) => {
      bar.notes[index] = note;
      props.updateBar(bar);
    }

    const noteProps = (note,index) => ({
      x: getX(index),
      y: staveY,
      noteWidth: beatWidth,
      previousNote: index === 0
        ? previousNote
        : Note.lastNoteOfWholeNote(bar.notes[index - 1]),
      updateNote
    })

    return svg`

      <g class="bar">
        ${Bar.dragBoxes(props.x,staveY, props.width)}
        ${bar.notes.map(
          (note,idx) => svg.for(note)`${Note.render(note,noteProps(note,idx))}`
        )}

        <line x1=${props.x} x2=${props.x} y1=${staveY} y2=${lineHeightOf(4) + props.y} stroke="black" />
      </g>`;

  },
  init: () => ({
    notes: [Note.init(),Note.init()]

  })
};