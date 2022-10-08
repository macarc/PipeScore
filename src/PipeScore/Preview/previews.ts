//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
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

//  A type implements Previews<T> if it can hold a preview of T.
//  In practice, the two implementations of this are:
//  - Bar implements Previews<SingleNote>
//  - Note implements Previews<Gracenote>
//  The reason it's an interface is to make the code in ./index a bit nicer.

import { SingleNote } from '../Note';

export interface Previews<T> {
  setPreview(preview: T, noteAfter: SingleNote | null): void;
  removePreview(): void;
  hasPreview(): boolean;
  makePreviewReal(notes: SingleNote[]): void;
}
