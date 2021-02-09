import math
import os
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
    doc.add(doc.ellipse(
        center=(headx, heady),
        r=(10,7),
        stroke_width=strokew,
        stroke="black",
        fill="black" if filled else "white",
        transform=f'rotate({angle} {headx} {heady})'
        ))
    stem_x_offset = 10 * math.cos(math.radians(30))
    stem_y_offset = 10 * math.sin(math.radians(30))
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


doc = svgwrite.Drawing(filename="test.svg", size=(100, 100))


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
