/*
  Event.ts - ScoreEvent type for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { Pitch } from './global/pitch';

import { NoteModel, TripletModel, NoteLength, BaseNote } from './Note/model';
import { BarModel, Barline } from './Bar/model';
import { GracenoteModel } from './Gracenote/model';
import { TimeSignatureModel } from './TimeSignature/model';
import { TextBoxModel } from './TextBox/model';
import { SecondTimingModel } from './SecondTiming/model';
import { Menu } from './UI/model';

export type ScoreEvent =
  | DeleteSelection
  | MouseMoveOver
  | ClickNote
  | StopInputtingNotes
  | SetGracenoteOnSelectedNotes
  | AddGracenoteToTriplet
  | AddNoteAfter
  | AddNoteToBarStart
  | TieSelectedNotes
  | AddTriplet
  | ToggleDot
  | ClickGracenote
  | MoveNoteUp
  | MoveNoteDown
  | UpdateDemoNote
  | AddAnacrusis
  | AddBar
  | ClickBar
  | SetBarRepeat
  | EditBarTimeSignature
  | ExpandSelection
  | DetractSelection
  | MoveLeft
  | MoveRight
  | AddStave
  | AddText
  | EditText
  | ClickText
  | CentreText
  | TextMouseUp
  | AddSecondTiming
  | ClickSecondTiming
  | EditTimeSignature
  | MouseUp
  | MouseDrag
  | ClickBackground
  | SetInputLength
  | ChangeZoomLevel
  | SetMenu
  | ToggleLandscape
  | Copy
  | Paste
  | Undo
  | Redo
  | Print
  | HoverDoc
  | ToggleDoc
  | StartPlayback
  | StopPlayback
  | SetPlaybackBpm;

export type Dispatch = (e: ScoreEvent) => void;

type Copy = {
  name: 'copy';
};
export function isCopy(e: ScoreEvent): e is Copy {
  return e.name === 'copy';
}

type Paste = {
  name: 'paste';
};
export function isPaste(e: ScoreEvent): e is Paste {
  return e.name === 'paste';
}

type MouseMoveOver = {
  name: 'mouse over pitch';
  pitch: Pitch;
};
export function isMouseMoveOver(e: ScoreEvent): e is MouseMoveOver {
  return e.name === 'mouse over pitch';
}

type ClickGracenote = {
  name: 'click gracenote';
  gracenote: GracenoteModel;
};
export function isClickGracenote(e: ScoreEvent): e is ClickGracenote {
  return e.name === 'click gracenote';
}

type ClickNote = {
  name: 'click note';
  note: BaseNote;
  event: MouseEvent;
};
export function isClickNote(e: ScoreEvent): e is ClickNote {
  return e.name === 'click note';
}

type MoveNoteUp = {
  name: 'move note up';
};
export function isMoveNoteUp(e: ScoreEvent): e is MoveNoteUp {
  return e.name === 'move note up';
}

type MoveNoteDown = {
  name: 'move note down';
};
export function isMoveNoteDown(e: ScoreEvent): e is MoveNoteDown {
  return e.name === 'move note down';
}

type ClickBackground = {
  name: 'click background';
};
export function isClickBackground(e: ScoreEvent): e is ClickBackground {
  return e.name === 'click background';
}

type MouseDrag = {
  name: 'mouse drag';
  x: number;
  y: number;
};

export function isMouseDrag(e: ScoreEvent): e is MouseDrag {
  return e.name === 'mouse drag';
}

type MouseUp = {
  name: 'mouse up';
};
export function isMouseUp(e: ScoreEvent): e is MouseUp {
  return e.name === 'mouse up';
}

type ExpandSelection = {
  name: 'expand selection';
};
export function isExpandSelection(e: ScoreEvent): e is ExpandSelection {
  return e.name === 'expand selection';
}

type DetractSelection = {
  name: 'detract selection';
};
export function isDetractSelection(e: ScoreEvent): e is DetractSelection {
  return e.name === 'detract selection';
}

type MoveLeft = {
  name: 'move left';
};
export function isMoveLeft(e: ScoreEvent): e is MoveLeft {
  return e.name === 'move left';
}

type MoveRight = {
  name: 'move right';
};
export function isMoveRight(e: ScoreEvent): e is MoveRight {
  return e.name === 'move right';
}

type DeleteSelection = {
  name: 'delete selection';
};
export function isDeleteSelection(e: ScoreEvent): e is DeleteSelection {
  return e.name === 'delete selection';
}

type SetGracenoteOnSelectedNotes = {
  name: 'set gracenote';
  value: string | null;
};
export function isSetGracenoteOnSelectedNotes(
  e: ScoreEvent
): e is SetGracenoteOnSelectedNotes {
  return e.name === 'set gracenote';
}

type SetInputLength = {
  name: 'set note input length';
  length: NoteLength;
};
export function isSetInputLength(e: ScoreEvent): e is SetInputLength {
  return e.name === 'set note input length';
}

type StopInputtingNotes = {
  name: 'stop inputting notes';
};
export function isStopInputtingNotes(e: ScoreEvent): e is StopInputtingNotes {
  return e.name === 'stop inputting notes';
}

type AddNoteAfter = {
  name: 'note added';
  pitch: Pitch;
  noteBefore: NoteModel | TripletModel;
};
export function isAddNoteAfter(e: ScoreEvent): e is AddNoteAfter {
  return e.name === 'note added';
}

type AddNoteToBarStart = {
  name: 'add note to beginning of bar';
  pitch: Pitch;
  bar: BarModel;
};
export function isAddNoteToBarStart(e: ScoreEvent): e is AddNoteToBarStart {
  return e.name === 'add note to beginning of bar';
}

type AddGracenoteToTriplet = {
  name: 'add gracenote to triplet';
  which: 'second' | 'third'; // first is dealt with by AddNoteAfter the note before
  triplet: TripletModel;
  pitch: Pitch;
};
export function isAddGracenoteToTriplet(
  e: ScoreEvent
): e is AddGracenoteToTriplet {
  return e.name === 'add gracenote to triplet';
}

type ToggleDot = {
  name: 'toggle dot';
};
export function isToggleDot(e: ScoreEvent): e is ToggleDot {
  return e.name === 'toggle dot';
}

type ChangeZoomLevel = {
  name: 'change zoom level';
  zoomLevel: number;
};
export function isChangeZoomLevel(e: ScoreEvent): e is ChangeZoomLevel {
  return e.name === 'change zoom level';
}

type ClickText = {
  name: 'click text';
  text: TextBoxModel;
};
export function isClickText(e: ScoreEvent): e is ClickText {
  return e.name === 'click text';
}

type EditText = {
  name: 'edit text';
  newText: string;
  newSize: number;
  text: TextBoxModel;
};
export function isEditText(e: ScoreEvent): e is EditText {
  return e.name === 'edit text';
}

type AddText = {
  name: 'add text';
};
export function isAddText(e: ScoreEvent): e is AddText {
  return e.name === 'add text';
}

type AddAnacrusis = {
  name: 'add anacrusis';
  before: boolean;
};
export function isAddAnacrusis(e: ScoreEvent): e is AddAnacrusis {
  return e.name === 'add anacrusis';
}
type AddBar = {
  name: 'add bar';
  before: boolean;
};
export function isAddBar(e: ScoreEvent): e is AddBar {
  return e.name === 'add bar';
}

type ClickBar = {
  name: 'click bar';
  bar: BarModel;
  mouseEvent: MouseEvent;
};
export function isClickBar(e: ScoreEvent): e is ClickBar {
  return e.name === 'click bar';
}

type SetBarRepeat = {
  name: 'set bar repeat';
  which: 'frontBarline' | 'backBarline';
  what: Barline;
};

export function isSetBarRepeat(e: ScoreEvent): e is SetBarRepeat {
  return e.name === 'set bar repeat';
}

type EditBarTimeSignature = {
  name: 'edit bar time signature';
};
export function isEditBarTimeSignature(
  e: ScoreEvent
): e is EditBarTimeSignature {
  return e.name === 'edit bar time signature';
}

type AddStave = {
  name: 'add stave';
  before: boolean;
};
export function isAddStave(e: ScoreEvent): e is AddStave {
  return e.name === 'add stave';
}

type TieSelectedNotes = {
  name: 'tie selected notes';
};
export function isTieSelectedNotes(e: ScoreEvent): e is TieSelectedNotes {
  return e.name === 'tie selected notes';
}

type AddTriplet = {
  name: 'add triplet';
};
export function isAddTriplet(e: ScoreEvent): e is AddTriplet {
  return e.name === 'add triplet';
}

type TextMouseUp = {
  name: 'text mouse up';
};
export function isTextMouseUp(e: ScoreEvent): e is TextMouseUp {
  return e.name === 'text mouse up';
}

type CentreText = {
  name: 'centre text';
};
export function isCentreText(e: ScoreEvent): e is CentreText {
  return e.name === 'centre text';
}

type AddSecondTiming = {
  name: 'add second timing';
};
export function isAddSecondTiming(e: ScoreEvent): e is AddSecondTiming {
  return e.name === 'add second timing';
}

type ClickSecondTiming = {
  name: 'click second timing';
  secondTiming: SecondTimingModel;
  part: 'start' | 'middle' | 'end';
};
export function isClickSecondTiming(e: ScoreEvent): e is ClickSecondTiming {
  return e.name === 'click second timing';
}

type EditTimeSignature = {
  name: 'edit time signature';
  timeSignature: TimeSignatureModel;
  newTimeSignature: TimeSignatureModel;
};
export function isEditTimeSignature(e: ScoreEvent): e is EditTimeSignature {
  return e.name === 'edit time signature';
}

type Undo = {
  name: 'undo';
};
export function isUndo(e: ScoreEvent): e is Undo {
  return e.name === 'undo';
}

type Redo = {
  name: 'redo';
};
export function isRedo(e: ScoreEvent): e is Redo {
  return e.name === 'redo';
}

type UpdateDemoNote = {
  name: 'update demo note';
  x: number;
  staveIndex: number | null;
};
export function isUpdateDemoNote(e: ScoreEvent): e is UpdateDemoNote {
  return e.name === 'update demo note';
}

type SetMenu = {
  name: 'set menu';
  menu: Menu;
};
export function isSetMenu(e: ScoreEvent): e is SetMenu {
  return e.name === 'set menu';
}

type ToggleLandscape = {
  name: 'toggle landscape';
};
export function isToggleLandscape(e: ScoreEvent): e is ToggleLandscape {
  return e.name === 'toggle landscape';
}

type Print = {
  name: 'print';
};
export function isPrint(e: ScoreEvent): e is Print {
  return e.name === 'print';
}

type StartPlayback = {
  name: 'start playback';
};
export function isStartPlayback(e: ScoreEvent): e is StartPlayback {
  return e.name === 'start playback';
}

type StopPlayback = {
  name: 'stop playback';
};
export function isStopPlayback(e: ScoreEvent): e is StopPlayback {
  return e.name === 'stop playback';
}

type SetPlaybackBpm = {
  name: 'set playback bpm';
  bpm: number;
};
export function isSetPlaybackBpm(e: ScoreEvent): e is SetPlaybackBpm {
  return e.name === 'set playback bpm';
}

type HoverDoc = {
  name: 'hover doc';
  element: string;
};
export function isHoverDoc(e: ScoreEvent): e is HoverDoc {
  return e.name === 'hover doc';
}
type ToggleDoc = {
  name: 'toggle doc';
};
export function isToggleDoc(e: ScoreEvent): e is ToggleDoc {
  return e.name === 'toggle doc';
}
