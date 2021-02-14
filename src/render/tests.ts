import { V } from './types';
import { h, svg, cache } from './h';
import patch from './vdom';

let st: V;

function Note(c: string) {
  return h('p', {}, {}, [c]);
}

function Score(counter: number): V {
  return h('div',
           { id: 'score' },
           { },
             [ 'hello, world!',
               h('button',
                 { },
                 { click: () => dispatch(counter) },
                 [ 'increment counter' ]),
               h('button',
                 { },
                 { click: () => dispatch(counter - 1) },
                 ['do nothing']),
                cache([counter], (counter) => Note(counter.toString()))]);
  //return h('div', { id: 'score' }, { mousedown: () => dispatch(counter) }, ['hello, world!', (Math.random() < 0.5 ? h('p', {}, {}, ['hi']) : null), Note(counter.toString())]);
}

function dispatch(c: number) {
  const nu = Score(c + 1);
  patch(st, nu);
  st = nu;
}

document.addEventListener("DOMContentLoaded", () => {
  st = { name: 'div', attrs: {}, events: {}, children: [], node: document.getElementById('root') }
  dispatch(0);
});
