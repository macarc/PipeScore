/*
  Event.ts - ScoreEvent type for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { Pitch } from './global/pitch';
import { ID } from './global/types';

import { NoteModel, TripletModel, NoteLength, BaseNote } from './Note/model';
import { BarModel } from './Bar/model';
import { SingleGracenote } from './Gracenote/model';
import { TimeSignatureModel } from './TimeSignature/model';
import { TextBoxModel } from './TextBox/model';
import { SecondTimingModel } from './SecondTiming/model';

export type ScoreEvent =
  MouseMovedOver
  | NoteClicked
  | DeleteSelectedNotes
  | StopInputtingNotes
  | SetGracenoteOnSelected
  | AddNoteAfter
  | AddNoteToBarStart
  | TieSelectedNotes
  | AddTriplet
  | ToggleDotted
  | SingleGracenoteClicked

  | UpdateDemoNote

  | AddAnacrusis
  | AddBar
  | DeleteBar
  | BarClicked

  | AddStave
  | DeleteStave

  | EditText
  | TextClicked
  | TextMouseUp
  | TextDragged
  | CentreText
  | AddText
  | DeleteText

  | AddSecondTiming
  | ClickSecondTiming
  | DragSecondTiming

  | EditTimeSignature


  | MouseUp
  | BackgroundClicked

  | SetInputLength
  | ChangeZoomLevel
  | StartResizingUserInterface
  | ResizeUserInterface

  | Copy
  | Paste
  | Undo
  | Redo;

export type Dispatch = (e: ScoreEvent) => void

type Copy = {
  name: 'copy'
}
export function isCopy(e: ScoreEvent): e is Copy {
  return e.name === 'copy';
}

type Paste = {
  name: 'paste'
}
export function isPaste(e: ScoreEvent): e is Paste {
  return e.name === 'paste';
}

type MouseMovedOver = {
  name: 'mouse over pitch',
  pitch: Pitch
}
export function isMouseMovedOver(e: ScoreEvent): e is MouseMovedOver {
  return e.name === 'mouse over pitch';
}

type SingleGracenoteClicked = {
  name: 'gracenote clicked',
  gracenote: SingleGracenote
}
export function isSingleGracenoteClicked(e: ScoreEvent): e is SingleGracenoteClicked {
  return e.name === 'gracenote clicked';
}

type NoteClicked = {
  name: 'note clicked',
  note: BaseNote,
  event: MouseEvent
}
export function isNoteClicked(e: ScoreEvent): e is NoteClicked {
  return e.name === 'note clicked';
}

type BackgroundClicked = {
  name: 'background clicked'
}
export function isBackgroundClicked(e: ScoreEvent): e is BackgroundClicked {
  return e.name === 'background clicked';
}

type MouseUp = {
  name: 'mouse up'
}
export function isMouseUp(e: ScoreEvent): e is MouseUp {
  return e.name === 'mouse up';
}

type DeleteSelectedNotes = {
  name: 'delete selected notes'
}
export function isDeleteSelectedNotes(e: ScoreEvent): e is DeleteSelectedNotes {
  return e.name === 'delete selected notes';
}

type SetGracenoteOnSelected = {
  name: 'set gracenote',
  value: string | null
}
export function isSetGracenoteOnSelected(e: ScoreEvent): e is SetGracenoteOnSelected {
  return e.name === 'set gracenote';
}

type SetInputLength = {
  name: 'set note input length',
  length: NoteLength
}
export function isSetInputLength(e: ScoreEvent): e is SetInputLength {
  return e.name === 'set note input length';
}

type StopInputtingNotes = {
  name: 'stop inputting notes'
}
export function isStopInputtingNotes(e: ScoreEvent): e is StopInputtingNotes {
  return e.name === 'stop inputting notes';
}

type AddNoteAfter = {
  name: 'note added',
  pitch: Pitch,
  noteBefore: NoteModel | TripletModel
}
export function isAddNoteAfter(e: ScoreEvent): e is AddNoteAfter {
  return e.name === 'note added';
}

type AddNoteToBarStart = {
  name: 'add note to beginning of bar',
  pitch: Pitch,
  bar: BarModel
}
export function isAddNoteToBarStart(e: ScoreEvent): e is AddNoteToBarStart {
  return e.name === 'add note to beginning of bar';
}

type ToggleDotted = {
  name:  'toggle dotted'
}
export function isToggleDotted(e: ScoreEvent): e is ToggleDotted {
  return e.name === 'toggle dotted';
}

type ChangeZoomLevel = {
  name: 'change zoom level',
  zoomLevel: number
}
export function isChangeZoomLevel(e: ScoreEvent): e is ChangeZoomLevel {
  return e.name === 'change zoom level';
}

type TextClicked = {
  name: 'text clicked',
  text: TextBoxModel
}
export function isTextClicked(e: ScoreEvent): e is TextClicked {
  return e.name === 'text clicked';
}

type EditText = {
  name: 'edit text',
  newText: string,
  text: TextBoxModel
}
export function isEditText(e: ScoreEvent): e is EditText {
  return e.name === 'edit text';
}

type AddText = {
  name: 'add text'
}
export function isAddText(e: ScoreEvent): e is AddText {
  return e.name === 'add text';
}

type AddAnacrusis = {
  name: 'add anacrusis',
  before: boolean
}
export function isAddAnacrusis(e: ScoreEvent): e is AddAnacrusis {
  return e.name === 'add anacrusis';
}
type AddBar = {
  name: 'add bar',
  before: boolean
}
export function isAddBar(e: ScoreEvent): e is AddBar {
  return e.name === 'add bar';
}

type DeleteBar = {
  name: 'delete bar'
}
export function isDeleteBar(e: ScoreEvent): e is DeleteBar {
  return e.name === 'delete bar';
}
type BarClicked = {
  name: 'bar clicked',
  bar: BarModel,
  mouseEvent: MouseEvent
}
export function isBarClicked(e: ScoreEvent): e is BarClicked {
  return e.name === 'bar clicked';
}

type AddStave = {
  name: 'add stave',
  before: boolean
}
export function isAddStave(e: ScoreEvent): e is AddStave {
  return e.name === 'add stave';
}

type DeleteStave = {
  name: 'delete stave'
}
export function isDeleteStave(e: ScoreEvent): e is DeleteStave {
  return e.name === 'delete stave';
}

type TieSelectedNotes = {
  name: 'tie selected notes'
}
export function isTieSelectedNotes(e: ScoreEvent): e is TieSelectedNotes {
  return e.name === 'tie selected notes';
}

type AddTriplet = {
  name: 'add triplet'
}
export function isAddTriplet(e: ScoreEvent): e is AddTriplet {
  return e.name === 'add triplet';
}

type TextDragged = {
  name: 'text dragged',
  x: number,
  y: number
}
export function isTextDragged(e: ScoreEvent): e is TextDragged {
  return e.name === 'text dragged';
}

type TextMouseUp = {
  name: 'text mouse up'
}
export function isTextMouseUp(e: ScoreEvent): e is TextMouseUp {
  return e.name === 'text mouse up';
}

type CentreText = {
  name: 'centre text'
}
export function isCentreText(e: ScoreEvent): e is CentreText {
  return e.name === 'centre text';
}

type DeleteText = {
  name: 'delete text'
}
export function isDeleteText(e: ScoreEvent): e is DeleteText {
  return e.name === 'delete text';
}

type AddSecondTiming = {
  name: 'add second timing',
}
export function isAddSecondTiming(e: ScoreEvent): e is AddSecondTiming {
  return e.name === 'add second timing';
}

type ClickSecondTiming = {
  name: 'click second timing',
  secondTiming: SecondTimingModel,
  part: 'start' | 'middle' | 'end'
}
export function isClickSecondTiming(e: ScoreEvent): e is ClickSecondTiming {
  return e.name === 'click second timing';
}

type EditTimeSignature = {
  name: 'edit time signature',
  timeSignature: TimeSignatureModel,
  newTimeSignature: TimeSignatureModel
}
export function isEditTimeSignature(e: ScoreEvent): e is EditTimeSignature {
  return e.name === 'edit time signature';
}

type Undo = {
  name: 'undo'
}
export function isUndo(e: ScoreEvent): e is Undo {
  return e.name === 'undo';
}

type Redo = {
  name: 'redo'
}
export function isRedo(e: ScoreEvent): e is Redo {
  return e.name === 'redo';
}

type UpdateDemoNote = {
  name: 'update demo note',
  x: number,
  staveIndex: number | null
}
export function isUpdateDemoNote(e: ScoreEvent): e is UpdateDemoNote {
  return e.name === 'update demo note';
}

type DragSecondTiming = {
  name: 'drag second timing',
  closest: ID
}
export function isDragSecondTiming(e: ScoreEvent): e is DragSecondTiming {
  return e.name === 'drag second timing';
}

type StartResizingUserInterface = {
  name: 'start resizing user interface'
}
export function isStartResizingUserInterface(e: ScoreEvent):e is StartResizingUserInterface {
  return e.name === 'start resizing user interface';
}
type ResizeUserInterface = {
  name: 'resize user interface',
  width: number
}
export function isResizeUserInterface(e: ScoreEvent):e is ResizeUserInterface {
  return e.name === 'resize user interface';
}
