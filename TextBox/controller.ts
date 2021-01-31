import { TextBoxModel } from './model';

type TextClicked = {
  name: 'text clicked',
  text: TextBoxModel
}
const isTextClicked = (e: TextBoxEvent): e is TextClicked => e.name === 'text clicked';

type TextMouseUp = {
  name: 'text mouse up'
}
const isTextMouseUp = (e: TextBoxEvent): e is TextMouseUp => e.name === 'text mouse up';

type TextDragged = {
  name: 'text dragged',
  x: number,
  y: number
}
const isTextDragged = (e: TextBoxEvent): e is TextDragged => e.name === 'text dragged';

type EditText = {
  name: 'edit text',
  text: TextBoxModel
}
const isEditText = (e: TextBoxEvent): e is EditText => e.name === 'edit text';

type TextBoxEvent = TextClicked | TextMouseUp | TextDragged | EditText;

export function dispatch(a: TextBoxEvent) { }
