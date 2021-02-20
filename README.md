# PipeScore
## A modern bagpipe notation app

I started building this a while ago since I wasn't satisfied with other bagpipe notation apps that I found.

PipeScore's "killer feature" is reactive gracenotes - pipe embellishments that automatically update when you change the note that they are on. This means gracenotes can be added in sets (e.g. 'add a doubling to this note') rather than the user having to individually pick the correct one.

It is currently under development - see `current.txt` for a rough roadmap.


## Project Structure

All of the main code is in the `src/` directory.

PipeScore uses a custom virtual DOM diff algorithm, in `src/render`. There are still quite a few bugs/cases to handle with it currently.

Each component of a score (e.g. note, gracenote, stave) gets its own folder, with 3 files:
* `model` - this defines the type associated with the component
* `functions` - this defines a set of functions for transforming the type defined in model
* `view` - this defines a render function which takes the model defined in model, along with a props object defined in this file, and returns the virtual dom associated with the view

PipeScore uses a global controller rather than individual controllers for each component because sheet music has a lot of parts that interact very heavily with each other, and it is simpler to have a single controller than separate ones trying to communicate somehow with each other.


The UI component defines the user interface - the top and sidebar.

`Event.ts` defines all the possible events that the controller will take.

`global/state` defines all the mutable state variables, the other files in `global` are fairly straightforward.


The entry point is `PipeScore.ts` which starts the controller.
