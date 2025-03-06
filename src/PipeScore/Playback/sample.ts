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

//  AudioResource and Sample wrap the browser playback API to allow
//  loading and playing audio samples.
//
//  AudioResource handles loading the sample, Sample handles playing.

import { onSafari } from '../global/browser';

/**
 * AudioResource handles loading an AudioBuffer from a URL.
 *
 * After .load() has been called, .createSource() will create
 * an AudioBufferSourceNode with the buffer data.
 */
export class AudioResource {
  private buffer: AudioBuffer | null = null;
  private filename: string;

  /**
   * Create (but don't load) an AudioResource.
   * @param filename the name of the file, excluding path and file extension.
   */
  constructor(filename: string) {
    this.filename = filename;
  }

  /**
   * Load the file and decode into an internal audio buffer.
   * @param context audio context in which to load the audio buffers
   * @returns a promise which resolves when the buffer is loaded
   */
  load(context: AudioContext): Promise<void> {
    // Safari can't decode mp3
    const file_format = onSafari() ? 'wav' : 'mp3';

    return new Promise((res) => {
      const request = new XMLHttpRequest();
      request.open('GET', `/audio/${this.filename}.${file_format}`, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        const data = request.response;
        context.decodeAudioData(data, (buffer) => {
          this.buffer = buffer;
        });
        res();
      };
      request.send();
    });
  }

  /**
   * Get length of internal audio buffer (i.e. the resource duration) in seconds.
   * @returns buffer duration in seconds
   */
  duration() {
    return this.buffer?.duration || 0;
  }

  /**
   * Create an AudioBufferSourceNode with the contents of the resource's
   * buffer. Call .load() first!
   * @param context audio context in which to create the source
   * @returns the AudioBufferSourceNode
   */
  createSource(context: AudioContext): AudioBufferSourceNode {
    const source = context.createBufferSource();
    source.buffer = this.buffer;
    return source;
  }
}

/**
 * Sample turns an AudioResource into a playable object.
 */
export class Sample {
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private resource: AudioResource;

  /**
   * Create a Sample.
   * @param audio audio resource for sample
   * @param ctx audio context with which to play sample
   */
  constructor(audio: AudioResource, ctx: AudioContext) {
    this.resource = audio;
    this.context = ctx;
  }

  /**
   * Get duration of sample.
   * @returns length of sample in seconds
   */
  duration() {
    return this.resource.duration();
  }

  /**
   * Start playing audio sample.
   * @param gain volume between 0 and 1
   */
  start(gain = 1) {
    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(gain, 0);

    this.source?.stop();
    this.source = this.resource.createSource(this.context);
    this.source.connect(gainNode).connect(this.context.destination);
    this.source.start(0);
  }

  /**
   * Stop playing audio sample.
   */
  stop() {
    if (this.source) {
      this.source.stop();
    }
  }
}
