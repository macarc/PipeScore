import { Score } from '../Score';
import { Pitch } from '../global/pitch';

export class Selection {
  dragging: boolean = false;
  delete(score: Score) {}
  mouseDrag(x: number, y: number, score: Score, page: number) {}
  dragOverPitch(pitch: Pitch, score: Score) {}
  mouseUp() {}
}

export class Drags extends Selection {
  public dragging = true;
  public mouseUp() {
    this.dragging = false;
  }
}
