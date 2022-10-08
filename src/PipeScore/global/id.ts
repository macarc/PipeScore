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

//  IDs are used as unique identifiers in e.g. selection, second timings.

export type ID = number;

export class Item {
  public id: ID;
  constructor(id: ID | null) {
    this.id = id || genId();
  }
  public hasID(id: ID) {
    return this.id === id;
  }
}

// Generate a random ID
export const genId = (): ID => Math.floor(Math.random() * 1000000000000);
