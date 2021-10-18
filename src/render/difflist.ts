/*
   The beginning of a more efficient list render for PipeScore
   Copyright (C) 2021 macarc
 */
const enum Change {
  Modified,
  Removed,
  Added,
}

interface Diff<A> {
  index: number;
  change: Change;
  newValue: A;
}

function diffuneven<A>(
  longer: A[],
  shorter: A[],
  addChange: Change,
  removeChange: Change
): Diff<A>[] {
  let lengthDiff = longer.length - shorter.length;
  const elementsAdded = [];
  let so = 0; // shorter indexing offset
  for (let i = 0; i < longer.length; i++) {
    if (longer[i] !== shorter[i + so]) {
      if (longer[i] === shorter[i + so + 1]) {
        const diff = {
          index: i,
          change: removeChange,
          newValue: shorter[i + so],
        };
        elementsAdded.push(diff);
        lengthDiff += 1;
        so += 1;
      } else {
        const elementsBetween = [];
        let isAddedElements = false;
        let j = 0;
        for (; j <= lengthDiff; j++) {
          if (longer[i + j] === shorter[i + so]) {
            isAddedElements = true;
            break;
          } else {
            const diff = {
              index: i + j, //index i because it will be inserted at index i
              change: removeChange,
              newValue: longer[i + j],
            };
            elementsBetween.push(diff);
          }
        }

        if (isAddedElements) {
          i += j;
          elementsAdded.push(...elementsBetween);
          lengthDiff -= j;
          so -= j;
        } else {
          const diff = {
            index: i,
            change: Change.Modified,
            newValue: longer[i],
          };
          elementsAdded.push(diff);
        }
      }
    }
  }

  return elementsAdded;
}

// the indexes it returns are intended to be used from right to left, insert/deleting along the way
// TODO this is currently not the case for when before.length > after.length
export function difflist<A>(before: A[], after: A[]): Diff<A>[] {
  if (before.length > after.length) {
    return diffuneven(before, after, Change.Added, Change.Removed);
  } else if (after.length > before.length) {
    return diffuneven(after, before, Change.Removed, Change.Added);
  } else {
    // this doesn't do anything fancy like checking if elements are swapped, but actually that will not happen very much
    const changes = [];
    for (let i = 0; i < after.length; i++) {
      if (after[i] !== before[i]) {
        const diff = {
          index: i,
          change: Change.Modified,
          newValue: after[i],
        };
        changes.push(diff);
      }
    }
    return changes;
  }
}
