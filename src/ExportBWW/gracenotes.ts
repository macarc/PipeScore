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

//  Turn a list of pitches into a named BWW gracenote

import { Pitch } from '../PipeScore/global/pitch';

export function gracenoteToBWW(gracenote: Pitch[]): string {
  const match = (...pitches: Pitch[]) =>
    pitches.length === gracenote.length &&
    pitches.every((pitch, i) => gracenote[i] === pitch);

  // TODO - many gracenotes have the same notes but are represented differently
  //        e.g. strikes and gracenotes.
  //        Should we generate the different representations?

  if (match()) {
    return '';
  }

  // Single gracenotes
  if (match(Pitch.A)) {
    return 'ag';
  }
  if (match(Pitch.B)) {
    return 'bg';
  }
  if (match(Pitch.C)) {
    return 'cg';
  }
  if (match(Pitch.D)) {
    return 'dg';
  }
  if (match(Pitch.E)) {
    return 'eg';
  }
  if (match(Pitch.F)) {
    return 'fg';
  }
  if (match(Pitch.HG)) {
    return 'gg';
  }
  if (match(Pitch.HA)) {
    return 'tg';
  }

  // Regular, thumb and half doublings
  if (match(Pitch.HG, Pitch.G, Pitch.D)) {
    return 'dblg';
  }
  if (match(Pitch.HG, Pitch.A, Pitch.D)) {
    return 'dbla';
  }
  if (match(Pitch.HG, Pitch.B, Pitch.D)) {
    return 'dbb';
  }
  if (match(Pitch.HG, Pitch.C, Pitch.D)) {
    return 'dbc';
  }
  if (match(Pitch.HG, Pitch.D, Pitch.E)) {
    return 'dbd';
  }
  if (match(Pitch.HG, Pitch.E, Pitch.F)) {
    return 'dbe';
  }
  if (match(Pitch.HG, Pitch.F, Pitch.HG)) {
    return 'dbf';
  }
  if (match(Pitch.HG, Pitch.F)) {
    return 'dbhg';
  }
  if (match(Pitch.HA, Pitch.HG)) {
    return 'dbha';
  }

  if (match(Pitch.HA, Pitch.G, Pitch.D)) {
    return 'tdblg';
  }
  if (match(Pitch.HA, Pitch.A, Pitch.D)) {
    return 'tdbla';
  }
  if (match(Pitch.HA, Pitch.B, Pitch.D)) {
    return 'tdbb';
  }
  if (match(Pitch.HA, Pitch.C, Pitch.D)) {
    return 'tdbc';
  }
  if (match(Pitch.HA, Pitch.D, Pitch.E)) {
    return 'tdbd';
  }
  if (match(Pitch.HA, Pitch.E, Pitch.F)) {
    return 'tdbe';
  }
  if (match(Pitch.HA, Pitch.F, Pitch.HG)) {
    return 'tdbf';
  }

  if (match(Pitch.G, Pitch.D)) {
    return 'hdblg';
  }
  if (match(Pitch.A, Pitch.D)) {
    return 'hdbla';
  }
  if (match(Pitch.B, Pitch.D)) {
    return 'hdbb';
  }
  if (match(Pitch.C, Pitch.D)) {
    return 'hdbc';
  }
  if (match(Pitch.D, Pitch.E)) {
    return 'hdbd';
  }
  if (match(Pitch.E, Pitch.F)) {
    return 'hdbe';
  }
  if (match(Pitch.F, Pitch.HG)) {
    return 'hdbf';
  }

  // Single strikes
  if (match(Pitch.G)) {
    return 'strlg';
  }
  if (match(Pitch.A)) {
    return 'strla';
  }
  if (match(Pitch.B)) {
    return 'strb';
  }
  if (match(Pitch.C)) {
    return 'strc';
  }
  if (match(Pitch.D)) {
    return 'strd';
  }
  if (match(Pitch.E)) {
    return 'stre';
  }
  if (match(Pitch.F)) {
    return 'strf';
  }
  if (match(Pitch.HG)) {
    return 'strf';
  }

  // G gracenote, thumb and half strikes
  if (match(Pitch.HG, Pitch.A, Pitch.G)) {
    return 'gstla';
  }
  if (match(Pitch.HG, Pitch.B, Pitch.G)) {
    return 'gstb';
  }
  if (match(Pitch.HG, Pitch.C, Pitch.G)) {
    return 'gstc';
  }
  if (match(Pitch.HG, Pitch.D, Pitch.G)) {
    return 'gstd';
  }
  if (match(Pitch.HG, Pitch.D, Pitch.C)) {
    return 'lgstd';
  }
  if (match(Pitch.HG, Pitch.E, Pitch.A)) {
    return 'gste';
  }
  if (match(Pitch.HG, Pitch.F, Pitch.E)) {
    return 'gstf';
  }

  if (match(Pitch.HA, Pitch.A, Pitch.G)) {
    return 'tstla';
  }
  if (match(Pitch.HA, Pitch.B, Pitch.G)) {
    return 'tstb';
  }
  if (match(Pitch.HA, Pitch.C, Pitch.G)) {
    return 'tstc';
  }
  if (match(Pitch.HA, Pitch.D, Pitch.G)) {
    return 'tstd';
  }
  if (match(Pitch.HA, Pitch.D, Pitch.C)) {
    return 'lgtstd';
  }
  if (match(Pitch.HA, Pitch.E, Pitch.A)) {
    return 'tste';
  }
  if (match(Pitch.HA, Pitch.F, Pitch.E)) {
    return 'tstf';
  }
  if (match(Pitch.HA, Pitch.HG, Pitch.F)) {
    return 'tsthg';
  }

  if (match(Pitch.A, Pitch.G)) {
    return 'hstla';
  }
  if (match(Pitch.B, Pitch.G)) {
    return 'hstb';
  }
  if (match(Pitch.C, Pitch.G)) {
    return 'hstc';
  }
  if (match(Pitch.D, Pitch.G)) {
    return 'hstd';
  }
  if (match(Pitch.D, Pitch.C)) {
    return 'lghstd';
  }
  if (match(Pitch.E, Pitch.A)) {
    return 'hste';
  }
  if (match(Pitch.F, Pitch.E)) {
    return 'hstf';
  }
  if (match(Pitch.HG, Pitch.F)) {
    return 'hsthg';
  }

  // Regular grips
  if (match(Pitch.G, Pitch.D, Pitch.G)) {
    return 'grp';
  }
  if (match(Pitch.D, Pitch.G)) {
    return 'hgrp';
  }
  if (match(Pitch.G, Pitch.B, Pitch.G)) {
    return 'grpb';
  }

  // TODO : G gracenote, thumb and half grips

  // Taorluaths and bublys
  if (match(Pitch.G, Pitch.D, Pitch.G, Pitch.E)) {
    return 'tar';
  }
  if (match(Pitch.G, Pitch.B, Pitch.G, Pitch.E)) {
    return 'tarb';
  }
  if (match(Pitch.D, Pitch.G, Pitch.E)) {
    return 'htar';
  }
  if (match(Pitch.G, Pitch.D, Pitch.G, Pitch.C, Pitch.G)) {
    return 'bubly';
  }
  if (match(Pitch.D, Pitch.G, Pitch.C, Pitch.G)) {
    return 'hbubly';
  }

  // Birls
  if (match(Pitch.G, Pitch.A, Pitch.G)) {
    return 'brl';
  }
  if (match(Pitch.A, Pitch.G, Pitch.A, Pitch.G)) {
    return 'abr';
  }
  if (match(Pitch.HG, Pitch.A, Pitch.G, Pitch.A, Pitch.G)) {
    return 'gbr';
  }
  if (match(Pitch.HA, Pitch.A, Pitch.G, Pitch.A, Pitch.G)) {
    return 'tbr';
  }

  // Light, heavy and half D throws
  if (match(Pitch.G, Pitch.D, Pitch.C)) {
    return 'thrd';
  }
  if (match(Pitch.G, Pitch.D, Pitch.G, Pitch.C)) {
    return 'hvthrd';
  }
  if (match(Pitch.D, Pitch.C)) {
    return 'hthrd';
  }
  if (match(Pitch.D, Pitch.G, Pitch.C)) {
    return 'hhvthrd';
  }

  // Regular, thumb gracenote and half peles
  if (match(Pitch.HG, Pitch.A, Pitch.E, Pitch.A, Pitch.G)) {
    return 'pella';
  }
  if (match(Pitch.HG, Pitch.B, Pitch.E, Pitch.B, Pitch.G)) {
    return 'pelb';
  }
  if (match(Pitch.HG, Pitch.C, Pitch.E, Pitch.C, Pitch.G)) {
    return 'pelc';
  }
  if (match(Pitch.HG, Pitch.D, Pitch.E, Pitch.D, Pitch.G)) {
    return 'peld';
  }
  if (match(Pitch.HG, Pitch.D, Pitch.E, Pitch.D, Pitch.C)) {
    return 'lpeld';
  }
  if (match(Pitch.HG, Pitch.E, Pitch.F, Pitch.E, Pitch.A)) {
    return 'pele';
  }
  if (match(Pitch.HG, Pitch.F, Pitch.HG, Pitch.F, Pitch.E)) {
    return 'pelf';
  }

  if (match(Pitch.HA, Pitch.A, Pitch.E, Pitch.A, Pitch.G)) {
    return 'tpella';
  }
  if (match(Pitch.HA, Pitch.B, Pitch.E, Pitch.B, Pitch.G)) {
    return 'tpelb';
  }
  if (match(Pitch.HA, Pitch.C, Pitch.E, Pitch.C, Pitch.G)) {
    return 'tpelc';
  }
  if (match(Pitch.HA, Pitch.D, Pitch.E, Pitch.D, Pitch.G)) {
    return 'tpeld';
  }
  if (match(Pitch.HA, Pitch.D, Pitch.E, Pitch.D, Pitch.C)) {
    return 'ltpeld';
  }
  if (match(Pitch.HA, Pitch.E, Pitch.F, Pitch.E, Pitch.A)) {
    return 'tpele';
  }
  if (match(Pitch.HA, Pitch.F, Pitch.HG, Pitch.F, Pitch.E)) {
    return 'tpelf';
  }
  if (match(Pitch.HA, Pitch.HG, Pitch.HA, Pitch.HG, Pitch.F)) {
    return 'tpelhg';
  }

  if (match(Pitch.A, Pitch.E, Pitch.A, Pitch.G)) {
    return 'hpella';
  }
  if (match(Pitch.B, Pitch.E, Pitch.B, Pitch.G)) {
    return 'hpelb';
  }
  if (match(Pitch.C, Pitch.E, Pitch.C, Pitch.G)) {
    return 'hpelc';
  }
  if (match(Pitch.D, Pitch.E, Pitch.D, Pitch.G)) {
    return 'hpeld';
  }
  if (match(Pitch.D, Pitch.E, Pitch.D, Pitch.C)) {
    return 'htpeld';
  }
  if (match(Pitch.E, Pitch.F, Pitch.E, Pitch.A)) {
    return 'hpele';
  }
  if (match(Pitch.F, Pitch.HG, Pitch.F, Pitch.E)) {
    return 'hpelf';
  }
  if (match(Pitch.HG, Pitch.HA, Pitch.HG, Pitch.F)) {
    return 'hpelhg';
  }

  // TODO : Regular double strikes
  // TODO : G gracenote, thumb and half double strikes
  // TODO : Regular triple strikes
  // TODO : G gracenote, thumb and half triple strikes
  // TODO : double gracenotes

  // TODO : piobaireachd gracenotes

  throw new Error(`Can't convert gracenote to BWW format: ${gracenote.join(',')}`);
}
