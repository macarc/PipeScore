/*
  Interface describing items that can be previewed (i.e. a demo item may be shown)
  Copyright (C) 2021 macarc
*/
import { SingleNote } from '../Note';

export interface Previewable<T> {
  setPreview(preview: T, noteBefore: SingleNote | null): void;
  removePreview(): void;
  hasPreview(): boolean;
  makePreviewReal(noteBefore: SingleNote | null): void;
}
