import { NoteLength } from '../Note/model';

type Copy = {
  name: 'copy'
}
const isCopy = (e: UIEvent): e is Copy => e.name === 'copy';

type Paste = {
  name: 'paste'
}
const isPaste = (e: UIEvent): e is Paste => e.name === 'paste';

type DeleteSelectedNotes = {
  name: 'delete selected notes'
}
const isDeleteSelectedNotes = (e: UIEvent): e is DeleteSelectedNotes => e.name === 'delete selected notes';

type SetGracenoteOnSelected = {
  name: 'set gracenote',
  value: string
}
const isSetGracenoteOnSelected = (e: UIEvent): e is SetGracenoteOnSelected => e.name === 'set gracenote';

type SetInputLength = {
  name: 'set note input length',
  length: NoteLength
}
const isSetInputLength = (e: UIEvent): e is SetInputLength => e.name === 'set note input length';

type StopInputtingNotes = {
  name: 'stop inputting notes'
}
const isStopInputtingNotes = (e: UIEvent): e is StopInputtingNotes => e.name === 'stop inputting notes';

type ToggleDotted = {
  name:  'toggle dotted'
}
const isToggleDotted = (e: UIEvent): e is ToggleDotted => e.name === 'toggle dotted';

type ChangeZoomLevel = {
  name: 'change zoom level',
  zoomLevel: number
}
const isChangeZoomLevel = (e: UIEvent): e is ChangeZoomLevel => e.name === 'change zoom level';

type AddBar = {
  name: 'add bar'
}
const isAddBar = (e: UIEvent): e is AddBar => e.name === 'add bar';

type DeleteBar = {
  name: 'delete bar'
}
const isDeleteBar = (e: UIEvent): e is DeleteBar => e.name === 'delete bar';

type AddStave = {
  name: 'add stave'
}
const isAddStave = (e: UIEvent): e is AddStave => e.name === 'add stave';

type DeleteStave = {
  name: 'delete stave'
}
const isDeleteStave = (e: UIEvent): e is DeleteStave => e.name === 'delete stave';

type TieSelectedNotes = {
  name: 'tie selected notes'
}
const isTieSelectedNotes = (e: UIEvent): e is TieSelectedNotes => e.name === 'tie selected notes';

type AddSecondTiming = {
  name: 'add second timing',
}
const isAddSecondTiming = (e: UIEvent): e is AddSecondTiming => e.name === 'add second timing';

type UIEvent
  = Copy
  | Paste
  | DeleteSelectedNotes
  | SetGracenoteOnSelected
  | SetInputLength
  | StopInputtingNotes
  | TieSelectedNotes
  | ToggleDotted
  | ChangeZoomLevel
  | AddSecondTiming
  | AddBar
  | AddStave
  | DeleteBar
  | DeleteStave;

export function dispatch(a: UIEvent) {
}
