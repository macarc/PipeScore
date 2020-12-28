
/*
  dump a whole bunch of rest backup stuff here


  in case I ever change it again back to what it wants
*/
/*



function isNonRest(note: NoteModel): note is NonRestNoteModel {
  return note.pitch !== 'rest';
}
function isRest(note: NoteModel): note is RestNoteModel {
  return note.pitch === 'rest';
}

function rest(rest: RestNoteModel, x: number, y: number, noteWidth: number): Svg {
  // todo this is very similar to singleton
  if (shouldntDisplayRests()) {
    return svg`<g></g>`
  }
  const stemX = x - 5;
  const stemY = noteY(y, Pitch.A) + 30;
  const numberOfTails = noteLengthToNumTails(rest.length);

  const opacity = 0.25;

  const pitch = Pitch.A//hoveringPitch();
  /*
    ${noteHead(x, noteY(y, pitch), {...rest, pitch: pitch}, () => null, opacity, true)}
    ${hasStem(rest.length) ? svg`<line
      x1=${stemX}
      x2=${stemX}
      y1=${noteY(y,pitch)}
      y2=${stemY}
      stroke="black"
      opacity="${opacity}"
      />`: null}
    ${numberOfTails > 0 ? svg`<g class="tails">
      ${[...Array(numberOfTails).keys()].map(t => svg`<line x1=${stemX} x2=${stemX + 10} y1=${stemY - 5 * t} y2=${stemY - 5 * t - 10} stroke="black" stroke-width="2" opacity=${opacity} />`)}
    </g>` : null}

  return svg`

    ${noteBoxes(stemX - 2.5,y,noteWidth + 5, pitch => dispatch({ name: 'mouse over pitch', pitch }), pitch => dispatch({ name: 'rest clicked', pitch, rest }))}

  `;
}
export const lastNoteOfWholeNote = (wholeNote: GroupNoteModel) => wholeNote.notes.length === 0 ? 'rest' : wholeNote.notes[wholeNote.notes.length - 1].pitch;
const noteAndGracenoteWidth = (notes: NoteModel[], gracenoteRatio: number, prevNote: RestOrPitch='rest') =>
	notes.map((n,i) => (n.pitch === 'rest' ? 0  : 1) +
	(n.pitch === 'rest' || n.gracenote === null
		? 0
		: gracenoteRatio * Gracenote.numberOfNotes(n.gracenote, n.pitch, i === 0 ? prevNote : notes[i - 1].pitch))
	).reduce((a,b) => a + b, 0);

function mergeRests(notes: NoteModel[]): NoteModel[] {
  // merges rests in an array to as few rests as possible
  // e.g. if there is an array [<normalnote1>,<rest semiquaver>,<rest semiquaver>,<normalnote2>]
  // it will return [<normalnote1>,<rest quaver>,<normalnote2>]
  const newNotes = notes.slice();
  let i=0;
  while (i < notes.length) {
    const note = notes[i];
    if (note.pitch === 'rest') {
      let next = notes.slice(notes.indexOf(note) + 1);
      let notesToMerge: NoteModel[] = [note];
      while (next.length > 0 && next[0].pitch === 'rest') {
        notesToMerge.push(next[0]);
        next = next.slice(1);
      }

      const newLengths = mergeLengths(notesToMerge.map(rest => rest.length));
      const newRests = newLengths.map(length => ({ pitch: <RestOrPitch>'rest', length, gracenote: null }));
      newNotes.splice(newNotes.indexOf(note), notesToMerge.length, ...newRests);
      i += notesToMerge.length;
    } else {
      i += 1;
    }
  }
  return newNotes;
}

export function conditionRestLength(groupNote: GroupNoteModel, mouseLength: NoteLength | null) {
  // takes an array of notes and splits all the rests into rests of length mouseLength (if possible)
  const notes = mergeRests(groupNote.notes);
  if (mouseLength !== null) {
    const newNotes = notes.slice();

    for (const note of notes) {
      if (isRest(note)) {
        const lengths = mouseLength === null ? [note.length] : splitLength(note.length, mouseLength);
        const rests = lengths.map(length => ({
          pitch: <RestOrPitch>'rest',
          length,
          gracenote: null
        }));
        newNotes.splice(newNotes.indexOf(note), 1, ...rests);
      }
    }
    groupNote.notes = newNotes;
  } else {
    groupNote.notes = notes;
  }
}


function render(note: GroupNoteModel,props: NoteProps): Svg {

  if (note.notes.length === 0) {
    return svg`<g></g>`;
  } else {
    // takes a note and returns not the actual index, but the index including
    // gracenoteToNoteWidthRatio * all the gracenotes up to it
    // useful for x calculations

    const lastNote: RestOrPitch = props.previousNote;
    const relativeIndexOfGracenote = (index: number) => noteAndGracenoteWidth(note.notes.slice().splice(0,index), gracenoteToNoteWidthRatio, lastNote);
    const relativeIndexOf = (shortNote: NoteModel,index: number) => relativeIndexOfGracenote(index) + gracenoteToNoteWidthRatio * (shortNote.gracenote === null ? 0 : Gracenote.numberOfNotes(shortNote.gracenote,shortNote.pitch, index === 0 ? lastNote : note.notes[index - 1].pitch));
    const xOf = (noteIndex: number) => props.x + relativeIndexOf(note.notes[noteIndex],noteIndex) * props.noteWidth;
    const yOf = (note: NoteModel) => noteY(props.y, note.pitch);

    const stemXOf = (index: number) => xOf(index) - 5;


    const firstNote = note.notes[0];
    if (numberOfNotes(note) === 1) {
      const gracenoteProps = ({
        // can just be props.x since it is the first note
        x: props.x,
        y: props.y,
        gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
        thisNote: firstNote.pitch,
        previousNote: lastNote
      })

      return singleton(firstNote,xOf(0),props.y,gracenoteProps);
    } else if (numberOfNotes(note) === 1) {
      // TODO what is this
      return svg`<g class="rest">
        <circle cx=${props.x} cy=${props.y} r="10" fill="red" />
      </g>`;

    } else {
      const firstNonRest_ = note.notes.reduce((last: null | [NonRestNoteModel, number],next: NoteModel, index: number) => {
        if (last !== null) {
          return last;
        } else if (isNonRest(next)) {
          return <[NonRestNoteModel, number]>[next, index];
        } else {
          return last;
        }
      }, <[NonRestNoteModel, number] | null>null);


      if (firstNonRest_ === null) {
        //todo
        return svg`<g></g>`;
      } else {
        const [firstNonRest, firstNonRestIndex] = firstNonRest_;

        const [lastNonRest, lastNonRestIndex] = note.notes.reduce((last: [NonRestNoteModel, number],next: NoteModel, index: number) => {
          if (index <= firstNonRestIndex) return last;
          if (isNonRest(next)) {
            return <[NonRestNoteModel, number]>[next, index];
          } else {
            return last;
          }
        }, [firstNonRest, firstNonRestIndex]);

        const cap = (n: number, cap: number) =>
          (n > cap) ? cap :
          (n < -cap) ? -cap :
          n;

        const diff = cap(
          // todo cap should be dependent on how many notes are in the group
          // difference between first and last notes in a group
          noteOffset(lastNonRest.pitch)
          - noteOffset(firstNonRest.pitch),
          10);


        

        let multiple = false;
        const [lowestNote,lowestNoteIndex]: [NonRestNoteModel,number] = note.notes.reduce((last,next, index) => {
          if (index <= firstNonRestIndex) return last;
          if (isNonRest(next)) {
            const [lowestNoteSoFar,lowestNoteIndexSoFar] = last;
            if (noteOffset(next.pitch) === noteOffset(lowestNoteSoFar.pitch)) {
              multiple = true;
              return last;
            } else if (noteOffset(next.pitch) > noteOffset(lowestNoteSoFar.pitch)) {
              multiple = false;
              return <[NonRestNoteModel, number]>[next,index];
            } else {
              return last;
            }
          } else {
            return last;
          }
        }, [firstNonRest,firstNonRestIndex]);

        const multipleLowest = multiple;

        const stemOffset = (note: NonRestNoteModel) => 
          noteOffset(lowestNote.pitch) - noteOffset(note.pitch);

        const diffForLowest = 30 + noteOffset(lowestNote.pitch) - (multipleLowest ? 0 : diff * relativeIndexOf(lowestNote,lowestNoteIndex) / totalBeatWidth(note,props.previousNote));


        const stemYOf = (shortNote: NoteModel, index: number) =>
          props.y
            + (multipleLowest
              // straight line if there is more than one lowest note
              ? 0
              // otherwise use a slant
              : diff * relativeIndexOf(shortNote,index) / totalBeatWidth(note,props.previousNote))
            // offset so that the lowest note is always a constant height
            + diffForLowest;
        // Intentional double equals (array out of bounds)
        const notANote = (note?: NoteModel) => note == null;

        const isSingleton = (index: number) => notANote(note.notes[index - 1]) && notANote(note.notes[index + 1]);


        return svg`
          <g class="grouped-notes">
            ${note.notes.map(
              (shortNote,index) => {
                let previousNote = note.notes[index - 1];

                const gracenoteProps = ({
                  x: props.x + props.noteWidth * relativeIndexOfGracenote(index),
                  y: props.y,
                  gracenoteWidth: props.noteWidth * 0.6,
                  thisNote: shortNote.pitch,
                  previousNote: previousNote ? previousNote.pitch : lastNote
                });

                if (isSingleton(index)) {
                  return singleton(shortNote, xOf(index), props.y, gracenoteProps);
                } else {
                return svg.for(shortNote)`<g class="grouped-note">
                    ${shortNote.gracenote === null ? null : Gracenote.render(shortNote.gracenote,gracenoteProps)}

                    ${noteHead(xOf(index), yOf(shortNote), shortNote, (event: MouseEvent) => dispatch({ name: 'note clicked', note: shortNote, event }))}

                    ${
                      (previousNote !== null) ? beamFrom(stemXOf(index),stemYOf(shortNote, index), stemXOf(index - 1),stemYOf(previousNote, index - 1), noteLengthToNumTails(shortNote.length), noteLengthToNumTails(previousNote.length)) : null
                    }

                    ${noteBoxes(xOf(index) + /*TODO7, props.y, props.noteWidth, () => null, (pitch: Pitch) => dispatch({ name: 'note added', pitch, index: index + 1, note: note }))}

                    <line
                      x1=${stemXOf(index)}
                      x2=${stemXOf(index)}
                      y1=${yOf(shortNote)}
                      y2=${stemYOf(shortNote, index)}
                      stroke="black"
                      />
                  </g>`
                }
              }
            )}
        </g>`;
      }
    }
  }
};









*/
