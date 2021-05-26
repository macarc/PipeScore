---
title: Documentation
header-includes:
  <link rel="icon" href="/images/favicon.ico" />

---
Welcome! This page contains information about how to use PipeScore. You can search through this page using the `Ctrl-F` keyboard shortcut in your browser. It currently isn't very easy to read - in future there will be an introductory video showing the basics here.

If you can't find what you're looking for, don't hesitate to contact me and ask!

PipeScore is still being developed, so if you find any bugs (or you want me to add any features) just tell me and I'll do my best.

You can also hover over many elements in the main PipeScore interface, and it shows the documentation for that thing at the bottom of the page.

## Before you begin
You can use PipeScore on any operating system, but you must use a modern browser to do so, since PipeScore relies on modern features. Here is a non-exhaustive list of modern browsers (make sure you're using a version that is post-2017):

* [Brave](https://brave.com) (recommended)
* Firefox
* Chrome
* Opera
* Microsoft Edge (the new version)

The following browsers are old and out of date. Some features of PipeScore might not work on them. If you are still using them, please upgrade to a newer browser for a faster, more secure, and modern experience.

* Internet Explorer
* Old Microsoft Edge
* Any other pre-2017 browser

PipeScore will not work on mobile, and it may look a bit squashed in small screens. If the interface is very cramped you could try zooming out in your browser, and then refreshing.

## Accounts
You can use PipeScore without an account if you wish, to try it out. Your scores will not be saved if you do, since there isn't an account to save them to.

Accounts are completely free. [Create an account here](/login).

## Creating Scores
Once you have created your account, you will be redirected to the scores page. Here, you can create new scores, and modify the ones you already have. Press the `New Score` button to create a new score.

This will give you a quick-start menu, where you can specify a few things about your score. You can change these later.

You will then enter the full interface. You can return to the scores page by pressing the Home button in the top left.

To re-open a score in the interface, press the `Edit` button.

## Saving
PipeScore automatically saves all your scores to the Cloud (so long as you have created your account), so you don't need to save it manually.

## Printing
You can print your score using the `Print` button under the `Document` menu.

You **must** set `Margins` to `None` on the print preview page to print it properly. Unfortunately this cannot be automatic, due to a security feature in browsers that prevents the browser meddling with printer settings - so you will have to meddle with them instead!

## Interface
The interface in PipeScore consists of three parts:

* Top panel - the top panel contains sub-menus for different aspects of the score.
* Help pane - in the bottom left there is a help pane. Hover over anything in the top panel to see the documentation for it in this panel. You can disable it by ticking `Disable Help` in the top right.
* Score - the rest of the interface is the score. This can be zoomed in or out using the `Zoom Level` slider at the bottom of the Side Panel


## Selection
You can select many items on the score by clicking them. This highlights them orange. You can select notes, text and bars this way (for bars, make sure you click a blank part of the bar that doesn't have any notes in it).

If you want to select more than one item, click on the first item and then press shift and click the last item. This won't work when selecting texts, since they aren't on the score.

Alternatively, you can click on the first item and then press `Shift-Right` to expand the selection one item to the right.

## Notes
You can add any note by clicking on the note length you want under the `Note` menu, then clicking on the score where you want to place the note.

PipeScore automatically places notes the correct space apart. This means that it is usually quickest to always place your notes right at the end of the bar, and let PipeScore put them in the correct place for you.

You can use the keyboard shortcuts 1-7 to select different note lengths.

To stop inputting notes, press a blank area of the page, or press the `Escape` (`esc`) key.

To change a note's length, select it then click the note length you want under the `Note` menu. To change a note's pitch, select the note, then drag the note up or down.

You can delete a note by selecting it, then pressing the bin icon in the top panel.

You can create a triplet by adding three notes, selecting all three, then pressing the triplet icon under the `Note` menu. You can make a triplet turn back into normal notes by selecting any note in the triplet, then clicking the triplet icon.

You can tie a note to the note before it by selecting the note, then pressing the tie icon in the top panel.

You can add a dot to any note (making the note 50% longer) by selecting the note then pressing the `.` icon in the top panel.

## Copying/Pasting
You can copy notes by selecting all the notes (or bars) you want to copy (see [Selection](#selection) above), then pressing the copy button in the top panel (the icon looks like two pages next to each other). You can also use the `Ctrl-C` shortcut if you want.

Then, select either the bar you want to paste them to, or a note that you want to paste them after, and press the paste button in the top panel (the icon loooks like a clipboard). You can use the `Ctrl-V` shortcut if you prefer.

PipeScore will automatically keep the same bar breaks in the notes that you paste.

## Gracenotes
### Single Gracenotes
You can add single a single gracenote by clicking the single gracenote in the top right, then clicking on the place you want to place the single.

You can drag single gracenotes up and down to change the pitch.

### Embellishments
Embellishments in PipeScore are added in 'sets'. An example of a set is 'doubling', or 'toarluath'. PipeScore will then make sure that the embellishment placed on the score is the correct type based on the note that it's on. If you drag the note that the embellishment is on, it will update automatically.

To add an embellishment:

* Select the gracenote you want under the `Gracenote` menu. Remember that PipeScore will choose the correct embellishment based on the note that you place it on, so for example, the C doubling button will place a B doubling if you add it to a B.
* Click either on the note you want to place it on, or just before the note you want to place it on. That will place the embellishment

In the future, you will be able to create custom embellishments. That is not the case right now however.

You can change which gracenote is on a note by selecting the note, and then clicking the gracenote type you want under the `Gracenote` menu.

You can delete a gracenote by selecting the note that the gracenote is on, then pressing the `Remove Gracenote` button under the `Gracenote` menu.

## Bars
You can place a bar by selecting the bar before where you want to place it, then pressing `+ After` under the `Bar` menu. Alternatively, you can select the bar after where you want to place it and click `+ Before` under the Bar menu on the right.

You can delete a bar by selecting the bar, then pressing the bin icon in the top panel. The other bars in the stave will then be made to fill up the rest of the space

You can change the repeats on a bar using the controls under the bar menu on the right panel - you can change the start and end of the bar to either have a normal barline, a repeating start/end of part, or a non-repeating start/end of part.

## Lead ins
You can add lead-ins similar to adding bars, using the `+ Before Bar` and `+ After Bar` buttons under the `Bar` menu. This will add a lead-in bar, which you can add notes to.

Like bars, you can delete these by selecting them, then pressing the bin icon in the top panel.

## Time Signatures
You can edit the time signature of a bar by selecting the bar and then pressing `Edit Time Signature` under the `Bar` menu. This will bring up a edit menu that allows you to change what the time signature will be.

You can bring up this edit menu of any time signature on the score by clicking the time signature.

On the edit menu, checking the `Cut time` box will set the time signature to use Cut time (which is used in reels).

On the edit menu, under `Advanced`, you can change the note grouping. By default PipeScore will group notes based on the bottom number of the time signature (for example, 8 always uses 3-quaver length groups). However, in certain cases, such as irregular time signatures, this needs to be changed. In the `Custom Grouping` box, you can enter the number of quavers that should be in each group. For example, if you want to have a group of 4 quavers then a group of 3, type `4,3` in to the box. PipeScore will then group the notes in that bar (and any bars immediately afterwards that have the same time signature) with that grouping. PipeScore will also handle other note lengths (e.g. semiquavers) correctly based on the group lengths you gave.

## Staves
You can add a stave by selecting a bar on the stave above where you want to place it and clicking the `+ After` button under the `Stave` menu. Alternatively, you can select a bar on the stave below where you want to place it and click `+ Before`.

You can delete a stave by selecting and deleting all the bars on the stave.

## Text boxes
You can add a new text box by pressing the `+` button under the Text menu.

You can edit any text box by double clicking it.

You can delete a text box by selecting it and pressing the bin icon in the top panel.

You can move a text box by clicking and dragging it. You can tell PipeScore to centre it by pressing the `Centre text` button.

## Second Timings
You can place a second timing by clicking on a bar that is not at the end of the score and pressing `1st/2nd`.

You can then drag the individual parts of the second timing around by clicking and dragging on the vertical lines of the second timing. PipeScore automatically snaps the lines to the closest note or bar on the score.

## Page Orientation
You can change a score between portait and landscape by pressing the `Toggle Landscape` button under the Document menu.
