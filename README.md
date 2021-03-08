# PipeScore
## A modern bagpipe notation app

I started building this a while ago since I wasn't satisfied with other bagpipe notation apps that I found.

PipeScore's "killer feature" is reactive gracenotes - pipe embellishments that automatically update when you change the note that they are on. This means gracenotes can be added in sets (e.g. 'add a doubling to this note') rather than the user having to individually pick the correct one.

![GIF of reactive gracenote](dragging-gracenote.gif)

It is currently under development - see `todo.md` for a rough roadmap.

PipeScore uses [firebase](https://firebase.google.com) for saving, user accounts, and hosting, via [firebase-auth-lite](https://github.com/samuelgozi/firebase-auth-lite) and [firebase-firestore-lite](https://github.com/samuelgozi/firebase-firestore-lite) for a smaller, faster experience.

## Features

Piping features:
* Reactive embellishments
* Undo / redo
* Ties
* Triplets
* Repeats and Second timings
* Time signatures
* Text boxes
* Automatic note grouping
* Bars/Staves/e.t.c.

Programming features:
* ~3500 lines of TypeScript
* Custom virtual DOM
* Tiny - less than 20kB JS, minified + gzipped

## Project Structure

All of the main code is in the `src/PipeScore` directory.

PipeScore uses a custom virtual DOM diff algorithm, in the `render` directory. There are still quite a few bugs/cases to handle with it currently.

Each component of a score (e.g. note, gracenote, stave) gets its own folder, with 3 files:
* `model` - this defines the type associated with the component
* `functions` - this defines a set of functions for transforming the type defined in model
* `view` - this defines a render function which takes the model defined in model, along with a props object defined in this file, and returns the virtual dom associated with the view

`Note/render` is slightly different - since notes are used in groups rather than individually, `Note/render` takes either a list of notes (that will be rendered in a group) or a triplet.

PipeScore uses a global controller (in `Controller.ts`) rather than individual controllers for each component because sheet music has a lot of parts that interact very heavily with each other, and it is simpler to have a single controller than separate ones trying to communicate somehow with each other.

When events are dispatched, all the parts of the score that change are replaced rather than modified. This means that it will be easy to add optimisation later, by doing a simple equality check to see changes. While this isn't actually immutability, it is called that in code comments just to give a name to it.

`Event.ts` defines all the possible events that the controller will take.

The entry point is `PipeScore.ts` which starts the controller.
 
## Running locally

Run the following commands to run locally, ideally in separate terminals:
* `npm run dev` - to run the development server
* `npm run watch` - to rebuild JS on changes
* `tsc --watch` - to typecheck

To deploy:
* `npm run build` - to build minified bundle
* `npm run deploy` - to deploy to Firebase

The Firebase functionality (saving/user accounts/e.t.c.) will not work when running locally.
