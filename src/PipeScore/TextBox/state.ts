/*
  State required for text boxes
  Copyright (C) 2021 Archie Maclean
*/
import { TextBoxModel } from './model';

export interface TextBoxState {
  selectedText: TextBoxModel | null;
}
