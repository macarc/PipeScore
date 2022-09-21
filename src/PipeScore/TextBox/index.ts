import m from 'mithril';
import { dispatch } from '../Controller';
import { Update } from '../Controllers/Controller';
import { changeText, clickText } from '../Controllers/Text';
import dialogueBox from '../global/dialogueBox';
import { Obj, svgCoords } from '../global/utils';
import { Selection, TextSelection } from '../Selection';

/*
  TextBox format
  Copyright (C) 2021 macarc
*/
interface TextBoxProps {
  scoreWidth: number;
  selection: Selection | null;
}
export class TextBox {
  private centred: boolean;
  private x: number;
  private y: number;
  private mouseXOffset = 0;
  private mouseYOffset = 0;
  private size: number;
  private _text: string;

  constructor(text = '', centred = true, x = 0, y = 0, size = 20) {
    this.centred = centred;
    this.x = x ? x : Math.random() * 100;
    this.y = y ? y : Math.random() * 150;
    this.size = size;
    this._text = text;
  }
  public static fromJSON(o: Obj) {
    const tx = new TextBox(o.name);
    tx.x = o.x;
    tx.y = o.y;
    tx.size = o.size;
    tx._text = o._text;
    tx.centred = o.centred;
    return tx;
  }
  public toJSON() {
    return {
      x: this.x,
      y: this.y,
      size: this.size,
      _text: this._text,
      centred: this.centred,
    };
  }
  public text() {
    return this._text;
  }
  public setClickOffsetCoords(mouseX: number, mouseY: number) {
    this.mouseXOffset = this.x - mouseX;
    this.mouseYOffset = this.y - mouseY;
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
  public adjustAfterOrientation(newWidth: number, newHeight: number) {
    this.x = (this.x / newHeight) * newWidth;
    this.y = (this.y / newHeight) * newWidth;
  }
  public setCoords(x: number, y: number) {
    this.x = x + this.mouseXOffset;
    this.y = y + this.mouseYOffset;
    this.centred = false;
  }

  private edit() {
    dialogueBox(
      [
        m('label', ['Text:', m('input', { type: 'text', value: this._text })]),
        m('label', [
          'Font size:',
          m('input', {
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

  public render(props: TextBoxProps): m.Children {
    if (this.centred) this.x = props.scoreWidth / 2;
    const selected =
      props.selection instanceof TextSelection && props.selection.text === this;
    return m(
      'text',
      {
        x: this.x,
        y: this.y,
        style: `font-size: ${this.size}px; cursor: pointer;`,
        'text-anchor': 'middle',
        fill: selected ? 'orange' : '',
        ondblclick: () => this.edit(),
        onmousedown: (e: Event) => {
          const pt = svgCoords(e as MouseEvent);
          if (pt) this.setClickOffsetCoords(pt.x, pt.y);
          dispatch(clickText(this));
        },
      },
      this._text || 'Double Click to Edit'
    );
  }
}
