type BackgroundClicked = {
  name: 'background clicked'
}
const isBackgroundClicked = (e: ScoreEvent): e is BackgroundClicked => e.name === 'background clicked';

type MouseUp = {
  name: 'mouse up'
}
const isMouseUp = (e: ScoreEvent): e is MouseUp => e.name === 'mouse up';

type Changed = {
  name: 'changed'
}
const isChanged = (e: ScoreEvent): e is Changed => e.name === 'changed'

type ScoreEvent = BackgroundClicked | MouseUp | Changed;

export function dispatch(e: ScoreEvent) {

}
