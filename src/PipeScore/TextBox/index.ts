//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Update } from '../Events/types';
import { SavedTextBox } from '../SavedModel';

export type Font = 'serif' | 'sans-serif';

export abstract class ITextBox {
  abstract toJSON(): SavedTextBox;
  abstract text(): string;
  abstract setCursorDragOffset(mouseX: number, mouseY: number): void;
  abstract set(text: string, size: number, font: Font): Update;
  abstract font(): Font;
  abstract fontSize(): number;
  abstract toggleCentre(): void;
  abstract centred(): boolean;
  abstract adjustAfterOrientation(newWidth: number, newHeight: number): void;
  abstract setCoords(x: number, y: number): void;
  abstract x(): number;
  abstract setX(x: number): void;
  abstract y(): number;
  abstract setY(y: number): void;
}
