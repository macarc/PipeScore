# To-do list

## Perf
Bottlenecks:
* add/removeEventListener
* replaceChild

## Bugs to fix
- [ ] Cut time
- [ ] Notes with many beams can interfere with gracenotes (e.g. toarluath). Make beams lower?
- [ ] Stricter bar lengths
- [ ] Put copy/paste over correct bar
- [ ] Add optimised list render
- [ ] Ties to triplets
- [ ] Selection will be a bit weird with triplets - e.g. rawselection / selection mismatch
- [ ] Bars/staves should be selectable


## General features
- [X] Single notes
- [X] Note groups
- [X] Modifying notes
- [X] Adding notes
- [X] Reactive gracenotes
- [X] Time signatures
- [X] Repeat marks
- [X] Second timings
- [X] Anacrusis
- [X] Note ties
- [X] Adding staves / bars
- [X] Text boxes
- [X] Triplets
- [ ] Harmony Stave
- [X] Resizable interface
- [X] Copy/paste/undo/redo
- [ ] A easy way to input all of the above
- [ ] Multiple scores per page
- [ ] Documentation
- [ ] Saving / Loading
- [ ] Printing









## Bugs fixed
- [X] fix slanted beams
- [X] cap should be dependent on how many notes are in the group
- [X] check / fix gaps between notes
- [X] combine rests somehow into a single rest (if there are multiple next to each other)
- [X] placing notes from a blank score (of different lengths)
- [X] fix random errors with adding note (it just throws an error sometimes)
- [X] Any time rests are merged, some notes are deleted
- [X] Make adding notes more frictionless
- [X] Make icons for note input
- [X] Width of drag boxes is wrong
- [X] Automatically group notes to correct grouping
- [X] Add notes before first note in bar and in empty bar
- [X] Deleting multiple notes doesn't work
- [X] todo in groupNotes function
- [X] Add zoom
- [X] previousNoteData should return correct x value
- [X] Ties on notes on input (if inputted notes are split)
- [X] Tied notes should move together
- [X] When splitting really large notes right after a short note, the large note gets split into too many short notes
- [X] Notes can't be added to the end of the bar
- [X] Placing a minim then one before it causes stack overflow
- [X] Placing a single quaver and then moving the mouse causes an error
- [X] Delete second timings when their notes are deleted
- [X] Delete noteXY when a note is deleted
- [X] Have noteLeft, noteRight and noteY instead of noteXY
- [X] Good default zoom
- [X] Better zoom (instead of this weird 5 * 210 or whatever)
- [X] Second Timings for bars
- [X] ID for notes so that secondTiming can refer to that (also for bar, then there won't need to be different implementations!)
- [X] Tied notes still have bugs - e.g. changes gap between notes
- [X] a quaver then a crotchet in 6 8 produces 4 group notes
- [X] Selected items should be in a line from start to end
- [X] Selection should look nicer
- [X] Making a selection then adding another note somewhere crashes it (the selection is no longer in the noteModels)
- [X] Selecting a note then deleting its bar/stave leaves the selection box
- [X] Text box dragging is broken
- [X] Add transforms for texts
- [X] Correct zoom on page load
- [X] HG -> HA gracenote on next note looks a bit crushed
- [X] Merge long notes into long notes (semibreves into semibreves or minims, e.t.c.)
  - [X] Work out what the expected behaviour of groupNotes should be in regards to splitting notes into tied notes
- [X] I think for ties - no automatic insertion / deletion - it's too subjective
- [X] Tie-ing a crotchet to a semiquaver then placing a quaver in front breaks ties
- [X] Crotchet triplets act as if there is a beam
- [X] makeCorrectGroupings in Controller
- [X] Dragging a single gracenote up then down again causes a render bug
- [X] Tie causes a render bug
- [X] Bug where adding an odd number of notes then deleting breaks it
- [X] Remove all the state.score = { ...state.score } from Controller
- [X] It is too easy to accidentally add notes
- [X] Gracenotes on triplets
- [X] Dotted note can get crushed into next gracenote
- [X] Make a script to generate gracenote icons
- [X] Preview note for current placement
- [X] When adding triplets, use notes on stave rather than creating new notes
- [X] Better time signature editing (it should only change as far as the time signature is the same)
- [X] Deleting bar doesn't work
- [X] Remove forced no-caching once images/js/e.t.c. is in a stable state
- [X] Better second timing usage - you should click to add, then be able to drag the sections around
- [X] Second timing dragging will be a bar ahead for start, since it uses beforeX whereas the others use afterX
- [X] Make second timing dragging immutable
- [X] Use correct previous note in all calls to widthOfAnacrusis
- [X] Clicking on gracenote button then clicking off should unhighlight box
- [X] Clicking on gracenote button then clicking on note button is really slow??
- [X] Deal with selection going over stave break
