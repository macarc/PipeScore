# PipeScore

This directory contains the main implementation of PipeScore - the actual PipeScore logic and view.

## Project Structure

I spent a long time trying to create the perfect architecture. Then I gave up, and decided just to focus on making something that worked.

So, PipeScore works (just about), and uses the [Big Ball of Mud](http://laputan.org/mud/) architecture.

The following components are in PipeScore:

- `Gracenote` - handles single gracenotes, custom embellishments and reactive gracenotes
- `Note` - handles notes and triplets.
- `Bar` - handles bars, barlines.
- `TimeSignature` - handles time signatures (as they're drawn, not as they're grouped - that is handled by `groupNotes` in `Note/functions`)
- `Stave` - handles staves (staffs) - each line of music is its own stave
- `Score` - draws the staves, textboxes, and other items
- `DemoNote` - the orange note that shows a preview of note/gracenote placement
- `TextBox` - text boxes
- `Selection` - selection
- `SecondTiming` - First/second timings
- `UI` - the top/side panel, containing user controls

For events, the `dispatch` function is used, passing an event from the `Controller` folder. The `Controller` folder contains a lot of event functions. The controller files are stored in a separate directory rather than with their respective components since they need knowledge of the entire state in order to update it, not just the single component.

To keep track of all the x/y coordinates, there is a global map containing `afterX`/`beforeX`/`y` coordinates of each item. Using a global mutable variable like this means that code duplication is less - for example, when tieing to a previous note, looking up the x value in the map is simple, whereas trying to recalculate where the note was placed introduces more code, and dependency between that code and the code that actually calculated where it was in the first place.

Since the score is rendered from the start to the end, looking up x/y of items ahead will probably result in the wrong answer, so that should not be done.

Playback is done using the WebAudio API. It is quite powerful, but it's just being used in a very simple way here. See `Playback.ts`.

The entry point is `PipeScore.ts` which starts the controller.
