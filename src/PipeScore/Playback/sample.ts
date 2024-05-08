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

import { onSafari } from '../global/browser';

export function sleep(length_in_ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, length_in_ms));
}
export class Sample {
  buffer: AudioBuffer | null = null;
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  load(): Promise<(context: AudioContext) => void> {
    // Safari can't decode mp3
    const file_format = onSafari() ? 'wav' : 'mp3';

    return new Promise((res) => {
      const request = new XMLHttpRequest();
      request.open('GET', `/audio/${this.name}.${file_format}`, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        const data = request.response;
        res((context) => {
          context.decodeAudioData(data, (buffer) => {
            this.buffer = buffer;
          });
        });
      };
      request.send();
    });
  }

  getSource(context: AudioContext): AudioBufferSourceNode {
    const source = context.createBufferSource();
    source.buffer = this.buffer;
    return source;
  }
}

export class Player {
  private sample: Sample;
  private context: AudioContext;
  private source: AudioBufferSourceNode;

  constructor(sample: Sample, ctx: AudioContext) {
    this.sample = sample;
    this.context = ctx;
    this.source = this.createSource();
  }
  length() {
    return this.source?.buffer?.duration || 0;
  }
  play(gain: number) {
    this.source = this.createSource();
    const gainNode = this.context.createGain();
    gainNode.gain.value = gain;
    this.source.connect(gainNode).connect(this.context.destination);
    this.source.start(0);
  }
  stop() {
    if (this.source) this.source.stop();
  }
  private createSource() {
    return this.sample.getSource(this.context);
  }
}
