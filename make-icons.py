# Generate icons
# This may be expanded later to generate all of the other icons:
# bin, undo/redo, tie, triplet
# It outputs the generated images to /public/images/

# You will need to install svgwrite via `pip3 install svgwrite` before running

import os
import svgwrite

width = 100
height = 100
hmid = 50
vmid = 50
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

doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/home.svg', size=(width,height))
house_width = 60
door_width = 20
door_height = 30
house_height = 40
house_y = 40
roof_y = 20

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
    points=[(margin,house_y),(width - margin,house_y),(margin + house_width / 2,roof_y)],
    fill="black"
    ))
doc.save()
