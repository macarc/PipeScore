# Generate plus icon
# This may be expanded later to generate all of the other icons:
# bin, undo/redo, tie, triplet
# It outputs them to /public/images/icons

# You will need to install svgwrite via `pip3 install svgwrite` before running

import os
import svgwrite

width = 100
height = 100
hmid = 50
vmid = 50
line_length = 40

doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/plus.svg', size=(100,100))
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
