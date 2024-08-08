import type { ScoreEvent } from './Events/types';

export type Dispatch = (event: ScoreEvent) => Promise<void>;
