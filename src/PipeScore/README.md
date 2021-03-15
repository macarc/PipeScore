# PipeScore

This directory contains the implementation of the user interface of PipeScore.

## Project Structure

Each component of a score (e.g. note, gracenote, stave) gets its own folder, with 3 files:
* `model` - this defines the type associated with the component
* `functions` - this defines a set of functions for transforming the type defined in model
* `view` - this defines a render function which takes the model defined in model, along with a props object defined in this file, and returns the virtual dom associated with the view

`Note/render` is slightly different - since notes are used in groups rather than individually, `Note/render` takes either a list of notes (that will be rendered in a group) or a triplet.

PipeScore uses a global controller (in `Controller.ts`) rather than individual controllers for each component because sheet music has a lot of parts that interact very heavily with each other, and it is simpler to have a single controller than separate ones trying to communicate somehow with each other.

When events are dispatched, all the parts of the score that change are replaced rather than modified. This means that it will be easy to add optimisation later, by doing a simple equality check to see changes. While this isn't actually immutability, it is called that in code comments just to give a name to it.

`Event.ts` defines all the possible events that the controller will take.

To keep track of all the x/y coordinates, there is a global map containing `afterX`/`beforeX`/`y` coordinates of each item. Using a global mutable variable like this means that code duplication is less - for example, when tieing to a previous note, looking up the x value in the map is simple, whereas trying to recalculate where the note was placed introduces more code, and dependency between that code and the code that actually calculated where it was in the first place.

Since the score is rendered from the start to the end, looking up x/y of items ahead will probably result in the wrong answer, so that should not be done.

The entry point is `PipeScore.ts` which starts the controller.
