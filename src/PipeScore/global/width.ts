/*

  Widths are dealt with slightly oddly
  They are split into two parts
  - min : the minimum width (in pixels) - so for example, the physical width of the note head is the min
  - extend : a relative fraction, a bit like `fr` in display: flex, that determines how the remaining width is split up

  So when it is reified (when the actual width is found) it will fill up the space with the mins, then grow the rest
  according to extend

  (or it should anyway :) )
*/
export interface Width {
  // min - the minimum possible width for an element
  min: number,
  // extend - the relative fraction that the element takes up when expanded (like fr in display: flex)
  extend: number
};

function init(min: number, extend: number): Width {
    return { min, extend };
}

function add(...widths: Width[]): Width {
    return widths.reduce((a,b) => ({
        min: a.min + b.min,
        extend: a.extend + b.extend
    }));
}

function mul(width: Width, val: number): Width {
    return {
        ...width,
        extend: val * width.extend
    };
}

function reify(width: Width, beatWidth: number): number {
    return width.min + beatWidth * width.extend;
}

function zero(): Width {
    return {
        min: 0,
        extend: 0
    };
}

export default {
    init,
    add,
    mul,
    reify,
    zero
}
