/*
  Interface describing items that can be previewed (i.e. a preview may be shown)
  Copyright (C) 2021 macarc
*/
import { SingleNote } from '../Note';

export interface Previews<T> {
  setPreview(preview: T, noteAfter: SingleNote | null): void;
  removePreview(): void;
  hasPreview(): boolean;
  makePreviewReal(notes: SingleNote[]): void;
}
