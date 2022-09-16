# Generate icons
# This may be expanded later to generate all of the other icons:
# bin, tie, triplet
# It outputs the generated images to /public/images/

# You will need to install svgwrite via `pip3 install svgwrite` before running

import os
import svgwrite

width = 100
height = 100
hmid = 50
vmid = 50


## PLUS icon
line_length = 40

doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/plus.svg', size=(width,height))
doc.add(doc.line(
    start=(hmid-line_length, vmid),
    end=(hmid+line_length, vmid),
    stroke="black",
    stroke_width=5
    ))
doc.add(doc.line(
    start=(hmid,vmid-line_length),
    end=(hmid,vmid+line_length),
    stroke="black",
    stroke_width=5
    ))
doc.save()

## UNDO/REDO icon
doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/undo.svg', size=(width,height))

arrow_x = 30
arrow_y = 35
arrow_width = 20
arrow_height = 13
tail_width = 70
tail_height = 30
tail_thickness = 7

doc.add(doc.polygon(
    points=[(arrow_x,arrow_y), (arrow_x + arrow_width,arrow_y + arrow_height), (arrow_x + arrow_width,arrow_y - arrow_height)],
    fill="black"
    ))
doc.add(doc.path(
    d=f'M {arrow_x + arrow_width} {arrow_y - tail_thickness / 2} a {tail_width} {tail_height} 180 0 1 0,{arrow_height + tail_height} l 0 {-tail_thickness} A {tail_width - tail_thickness} {tail_height - tail_thickness} 180 0 0 {arrow_x + arrow_width},{arrow_y + tail_thickness / 2}'
    ))
doc.save()

## Natural icon
x_gap = 10
y_gap = 20
y_off = 8
y_height = 40
y_shift = 3

doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/natural.svg', size=(width,height))
doc.add(doc.line(
    start=(hmid-x_gap, vmid + y_gap / 2 + y_shift + 3.5),
    end=(hmid-x_gap, vmid - y_height + y_gap / 2),
    stroke="black",
    stroke_width=4
    ))
doc.add(doc.line(
    start=(hmid+x_gap, vmid - y_off - y_gap/2 + y_shift - 3.5),
    end=(hmid+x_gap, vmid + y_height - y_gap/2),
    stroke="black",
    stroke_width=4
    ))
doc.add(doc.line(
    start=(hmid-x_gap, vmid + y_gap/2 + y_shift),
    end=(hmid+x_gap, vmid - y_off + y_gap/2 + y_shift),
    stroke="black",
    stroke_width=7
    ))
doc.add(doc.line(
    start=(hmid-x_gap, vmid - y_gap/2 + y_shift),
    end=(hmid+x_gap, vmid - y_off - y_gap/2 + y_shift),
    stroke="black",
    stroke_width=7
    ))
doc.save()

