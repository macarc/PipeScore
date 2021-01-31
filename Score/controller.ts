type BackgroundClicked = {
  name: 'background clicked'
}
const isBackgroundClicked = (e: ScoreEvent): e is BackgroundClicked => e.name === 'background clicked';

type MouseUp = {
  name: 'mouse up'
}
const isMouseUp = (e: ScoreEvent): e is MouseUp => e.name === 'mouse up';

type ScoreEvent = BackgroundClicked | MouseUp;

export function dispatch(a: ScoreEvent) { }
