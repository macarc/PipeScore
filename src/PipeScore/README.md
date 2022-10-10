# PipeScore

This directory contains the main implementation of PipeScore - the actual PipeScore logic and view.

## Project Structure

PipeScore is split into the following components:

- `Gracenote` - single gracenotes, custom embellishments and reactive gracenotes
- `Note` - notes and triplets.
- `Bar` - bars and barlines.
- `TimeSignature`
- `Stave` - staves (staffs) - each line of music is its own stave
- `Score` - pages
- `Preview` - the orange note that shows a preview of note/gracenote placement
- `TextBox`
- `Selection`
- `Timing` - timings can be second timings or first/second timings
- `UI` - the top/side panel, containing user controls
- `PitchBoxes` - the mechanism for detecting which pitch the mouse is hovering over

For events, the `dispatch` function is used, passing an event from the `Events` folder. The `Events` folder contains a lot of event functions. The event functions are stored in a separate directory from their respective components since they need knowledge of the entire state in order to update it, not just that of the single component.

The lifecycle goes like this:

- `redraw()` (in `Controller.ts`) is called, which draws the view
- The user interacts with the view, triggering a call to `dispatch()` (in `Controller.ts`) with an event function from the `Events` folder
- The event is called with the current state, which updates the state. It returns the status, which could mean:
  - `Update.NoChange` : Nothing happens
  - `Update.ViewChanged` : A new call to `redraw()` is triggered
  - `Update.ShouldSave` : A new call to `redraw()` is triggered, and the score is saved, and the current state snapshot is added to the undo/redo history (if it is different from the last snapshot)
  - `Update.MovedThroughHistory` : A new call to `redraw()` is triggered, and the score is saved

To keep track of all the x/y coordinates, there is a global map containing `afterX`/`beforeX`/`y` coordinates of each item. Using a global mutable variable like this means that code duplication is less - for example, when tieing to a previous note, looking up the x value in the map is simple, whereas trying to recalculate where the note was placed introduces more code, and dependency between that code and the code that actually calculated where it was in the first place.

Since the score is rendered from the start to the end, looking up x/y of items ahead will probably result in the wrong answer, so that should not be done.

Playback is done using the WebAudio API. It is quite powerful, but it's just being used in a very simple way here. See `Playback.ts`.

The entry point is `PipeScore.ts` which starts the controller.
