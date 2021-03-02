# This is a short, hacky script that generates the gracenote input icons - i.e. it generates images of all the types of gracenotes that can be input
# It outputs them to /public/images/icons

# You will need to install svgwrite via `pip3 install svgwrite` before running

import math
import os
import svgwrite

top_gap = 35

heights = {
        'g': top_gap + 3 * 10,
        'a': top_gap + 2.5 * 10,
        'b': top_gap + 2 * 10,
        'c': top_gap + 1.5 * 10,
        'd': top_gap + 1 * 10,
        'e': top_gap + 0.5 * 10,
        'f': top_gap + 0 * 10,
        'hg': top_gap + -0.5 * 10,
        'ha': top_gap + -1 * 10,
        }
rx = 4
ry = 2.7
def transform(head_coords):
    return f'rotate(-30 {head_coords[0]} {head_coords[1]})'

def add_embellishment(doc, embellishment):
    x = 25
    bar_y = 10
    total_width = 100 - 2 * x
    note_width = total_width / (len(embellishment) - 1)
    stem_x_offset = rx * math.cos(math.radians(30))
    stem_y_offset = rx * math.sin(math.radians(30)) - 1
    for i in range(len(embellishment)):
        head_coords = (x + i * note_width, heights[embellishment[i]])
        doc.add(doc.ellipse(
            center=head_coords,
            r=(rx,ry),
            transform=transform(head_coords),
            fill="black"
            ))
        doc.add(doc.line(
            start=(head_coords[0] + stem_x_offset, head_coords[1] - stem_y_offset),
            end=(head_coords[0] + stem_x_offset, bar_y),
            stroke="black",
            stroke_width=1
            ))
    
    for n in range(3):
        doc.add(doc.line(
            start=(x + stem_x_offset, bar_y + 1 + n * 3),
            end=(x + total_width + stem_x_offset, bar_y + 1 + n * 3),
            stroke="black",
            stroke_width=2
            ))


def add_stave_lines(doc):
    for n in range(5):
        doc.add(doc.line(
            (10,top_gap + n * 10),
            (90,top_gap + n * 10),
            stroke="black",
            stroke_width=2,
            opacity="0.3"
            ))


doc = svgwrite.Drawing(filename="test.svg", size=(100, 100))

embellishments = {
        "doubling": ['hg','c','d'],
        "throw-d": ['g','d','c'],
        "grip": ['g','d','g'],
        "birl": ['g','a','g'],
        "g-gracenote-birl": ['hg','a','g','a','g'],
        "toarluath": ['g','d','g','e'],
        "crunluath": ['g','d','g','e','a','f','a'],
        "edre": ['e','a','f','a']
        }


for (name, embellishment) in embellishments.items():
    doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/icons/gracenote-' + name + ".svg", size=(100,100))
    add_stave_lines(doc)
    add_embellishment(doc, embellishment)
    doc.save()


# single
doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/icons/single.svg', size=(100,100))

head_coords = (50,60)
rx = 8
ry = 5
doc.add(doc.ellipse(
    center=head_coords,
    r=(rx,ry),
    transform=transform(head_coords),
    fill="black"
    ))

stem_x_offset = rx * math.cos(math.radians(30))
stem_y_offset = rx * math.sin(math.radians(30)) - 2
doc.add(doc.line(
    start=(head_coords[0] + stem_x_offset, head_coords[1] - stem_y_offset),
    end=(head_coords[0] + stem_x_offset, 20),
    stroke="black",
    stroke_width=2
    ))

for n in range(3):
    doc.add(doc.line(
        start=(head_coords[0] + stem_x_offset, 20 + n * 5),
        end=(head_coords[0] + stem_x_offset + 10, 30 + n * 5),
        stroke="black",
        stroke_width=2
        ))

doc.save()
