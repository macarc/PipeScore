import { h, svg, V } from '../../render/h';
import { Dispatch, Update } from '../Controllers/Controller';
import { changeText, clickText, textMouseUp } from '../Controllers/Text';
import dialogueBox from '../global/dialogueBox';
import { Selection, TextSelection } from '../Selection/model';

/*
  TextBox format
  Copyright (C) 2021 Archie Maclean
*/
interface TextBoxProps {
  dispatch: Dispatch;
  scoreWidth: number;
  selection: Selection | null;
}
export class TextBox {
  private centred: boolean;
  private x: number;
  private y: number;
  private size: number;
  private _text: string;

  constructor(text = '', predictable = false) {
    this.centred = predictable;
    this.x = Math.random() * 100;
    this.y = predictable ? 100 : Math.random() * 150;
    this.size = 20;
    this._text = text;
  }

  public text() {
    return this._text;
  }
  public set(text: string, size: number) {
    if (text !== this._text || size !== this.size) {
      this._text = text;
      this.size = size;
      return Update.ShouldSave;
    }
    return Update.NoChange;
  }
  public setText(text: string) {
    this._text = text;
  }
  public setSize(size: number) {
    this.size = size;
  }
  public toggleCentre() {
    this.centred = !this.centred;
  }
  public adjustAfterOrientation(width: number, height: number) {
    if (!this.centred) {
      this.x = (this.x / width) * height;
      this.y = (this.y / height) * width;
    }
  }
  public setCoords(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.centred = false;
  }

  private edit(dispatch: Dispatch) {
    dialogueBox(
      [
        h('label', ['Text:', h('input', { type: 'text', value: this._text })]),
        h('label', [
          'Font size:',
          h('input', {
            type: 'number',
            min: 5,
            max: 50,
            value: this.size,
          }),
        ]),
      ],
      (form) => ({
        size: parseInt(
          (form.querySelector('input[type="number"]') as HTMLInputElement).value
        ),
        text: (form.querySelector('input[type="text"]') as HTMLInputElement)
          .value,
      }),
      { size: this.size, text: this._text }
    ).then(({ size, text }) => dispatch(changeText(text, size, this)));
  }

  public render(props: TextBoxProps): V {
    if (this.centred) this.x = props.scoreWidth / 2;
    const selected =
      props.selection instanceof TextSelection && props.selection.text === this;
    return svg(
      'text',
      {
        x: this.x,
        y: this.y,
        style: `font-size: ${this.size}px`,
        'text-anchor': 'middle',
        fill: selected ? 'orange' : '',
      },
      {
        dblclick: () => this.edit(props.dispatch),
        mousedown: () => props.dispatch(clickText(this)),
        mouseup: () => props.dispatch(textMouseUp()),
      },
      [this._text || 'Double Click to Edit']
    );
  }
}
