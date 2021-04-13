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

## HOME icon
doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/home.svg', size=(width,height))
house_width = 50
door_width = 15
door_height = 30
house_height = 40
house_y = 40
roof_y = 15
overhang_size = 10

margin = (width - house_width) / 2.0
house_wall_size = (house_width - door_width) / 2.0

doc.add(doc.rect(
    insert=(margin, house_y),
    size=(house_wall_size, house_height),
    fill="black"
    ))
doc.add(doc.rect(
    insert=(margin + house_wall_size + door_width, house_y),
    size=(house_wall_size, house_height),
    fill="black"
    ))
doc.add(doc.rect(
    insert=(margin + house_wall_size, house_y),
    size=(door_width, house_height - door_height),
    fill="black"
    ))
doc.add(doc.polygon(
    points=[(margin - overhang_size,house_y),(width - margin + overhang_size,house_y),(margin + house_width / 2,roof_y)],
    fill="black"
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

