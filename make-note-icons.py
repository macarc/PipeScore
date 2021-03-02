# This is a short, hacky script that generates the note input icons - i.e. it generates images of all the types of notes that can be input
# These appear in the top left of the UI
# It outputs them to /public/images/icons

# You will need to install svgwrite via `pip3 install svgwrite` before running

import math
import os
import random
import svgwrite

width = 100
height = 100
hmid = 50
vmid = 50
stem_length = 50

def add_note(doc, cfg):
    filled = cfg["filled"]
    stem = cfg["stem"]
    num_tails = cfg["num_tails"]
    headx = hmid
    heady = 30 if stem else vmid
    strokew = 3
    angle = -30 if stem else 0
    mask_angle = 0 if stem else 60
    rx = 10
    ry = 7
    maskrx = 10 if stem else 8
    maskry = 4
    maskid = str(random.randint(0,100000))
    mask = doc.add(doc.mask(id = maskid))
    mask.add(doc.rect(
        insert=(0,0),
        size=(width,height),
        fill="white"
        ))
    mask.add(doc.ellipse(
        center=(headx, heady),
        r=(maskrx, maskry),
        transform=f'rotate({mask_angle} {headx} {heady})',
        fill="black"
        ))

    doc.add(doc.ellipse(
        center=(headx, heady),
        r=(rx,ry),
        stroke_width=strokew,
        stroke="black",
        fill="black",
        transform=f'rotate({angle} {headx} {heady})',
        mask='none' if filled else f'url(#{maskid})'
        ))
    stem_x_offset = rx * math.cos(math.radians(30))
    stem_y_offset = rx * math.sin(math.radians(30))
    if stem:
        doc.add(doc.line(
            start=(headx - stem_x_offset, heady + stem_y_offset),
            end=(headx - stem_x_offset, heady + stem_y_offset + stem_length),
            stroke_width=strokew,
            stroke="black"
            ))

    tail_width = 20
    tail_height = 10
    tail_gap = 8
    for n in range(num_tails):
        y = heady + stem_y_offset + stem_length - tail_gap * n
        doc.add(doc.line(
            start=(headx - stem_x_offset, y),
            end=(headx - stem_x_offset + tail_width, y - tail_height),
            stroke_width=strokew,
            stroke="black"
            ))
    return ""


notes = {
        "semibreve": { "filled": False, "stem": False, "num_tails": 0 },
        "minim": { "filled": False, "stem": True, "num_tails": 0 },
        "crotchet": { "filled": True, "stem": True, "num_tails": 0 },
        "quaver": { "filled": True, "stem": True, "num_tails": 1 },
        "semiquaver": { "filled": True, "stem": True, "num_tails": 2 },
        "demisemiquaver": { "filled": True, "stem": True, "num_tails": 3 },
        "hemidemisemiquaver": { "filled": True, "stem": True, "num_tails": 4 },
        }

for (note, cfg) in notes.items():
    doc = svgwrite.Drawing(filename=os.getcwd() + '/public/images/icons/' + note + ".svg", size=(100,100))
    add_note(doc, cfg)
    doc.save()
