import { SingleNote } from '../Note';

export interface Previewable<T> {
  setPreview(preview: T, noteBefore: SingleNote | null): void;
  removePreview(): void;
  makePreviewReal(noteBefore: SingleNote | null): void;
}
