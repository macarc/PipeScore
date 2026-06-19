import type { IScore } from '../../Score';
import { Score } from '../../Score/impl';
import type { State } from '../../State';

export function emptyState(score: IScore = Score.blank()): State {
  return {
    store: null,
    isLoggedIn: false,
    justClickedNote: false,
    preview: null,
    menu: 'note',
    doc: { current: 'doubling', show: false },
    clipboard: null,
    selection: null,
    history: { past: [], future: [] },
    view: { ui: null, score: null },
    playback: {
      playing: false,
      loading: false,
      userPressedStop: false,
      cursor: null,
      playingMetronome: false,
      beatIndicator: false,
    },
    score,
  };
}
