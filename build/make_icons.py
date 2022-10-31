# Generates icons for:
# - minus
# - plus
# - undo / redo
# - natural
# This may be expanded later to generate all of the other icons:
# - bin
# - tie
# - triplet

from common import *
import os
import svgwrite


line_length = 40


def add_horizontal_line(doc):
    doc.add(
        doc.line(
            start=(hmid - line_length, vmid),
            end=(hmid + line_length, vmid),
            stroke="black",
            stroke_width=5,
        )
    )


def add_vertical_line(doc):
    doc.add(
        doc.line(
            start=(hmid, vmid - line_length),
            end=(hmid, vmid + line_length),
            stroke="black",
            stroke_width=5,
        )
    )


def minus_icon(doc):
    add_horizontal_line(doc)


def plus_icon(doc):
    add_horizontal_line(doc)
    add_vertical_line(doc)


# This is flipped in CSS for the redo icon
def undo_icon(doc):
    arrow_x = 30
    arrow_y = 35
    arrow_width = 20
    arrow_height = 13
    tail_width = 70
    tail_height = 30
    tail_thickness = 7

    doc.add(
        doc.polygon(
            points=[
                (arrow_x, arrow_y),
                (arrow_x + arrow_width, arrow_y + arrow_height),
                (arrow_x + arrow_width, arrow_y - arrow_height),
            ],
            fill="black",
        )
    )
    doc.add(
        doc.path(
            d=f"M {arrow_x + arrow_width} {arrow_y - tail_thickness / 2} a {tail_width} {tail_height} 180 0 1 0,{arrow_height + tail_height} l 0 {-tail_thickness} A {tail_width - tail_thickness} {tail_height - tail_thickness} 180 0 0 {arrow_x + arrow_width},{arrow_y + tail_thickness / 2}"
        )
    )


def natural_icon(doc):
    x_gap = 10
    y_gap = 20
    y_off = 8
    y_height = 40
    y_shift = 3

    doc.add(
        doc.line(
            start=(hmid - x_gap, vmid + y_gap / 2 + y_shift + 3.5),
            end=(hmid - x_gap, vmid - y_height + y_gap / 2),
            stroke="black",
            stroke_width=4,
        )
    )
    doc.add(
        doc.line(
            start=(hmid + x_gap, vmid - y_off - y_gap / 2 + y_shift - 3.5),
            end=(hmid + x_gap, vmid + y_height - y_gap / 2),
            stroke="black",
            stroke_width=4,
        )
    )
    doc.add(
        doc.line(
            start=(hmid - x_gap, vmid + y_gap / 2 + y_shift),
            end=(hmid + x_gap, vmid - y_off + y_gap / 2 + y_shift),
            stroke="black",
            stroke_width=7,
        )
    )
    doc.add(
        doc.line(
            start=(hmid - x_gap, vmid - y_gap / 2 + y_shift),
            end=(hmid + x_gap, vmid - y_off - y_gap / 2 + y_shift),
            stroke="black",
            stroke_width=7,
        )
    )


icons = {
    "minus": minus_icon,
    "plus": plus_icon,
    "undo": undo_icon,
    "natural": natural_icon,
}

for name, draw in icons.items():
    doc = svgwrite.Drawing(
        filename=os.getcwd() + f"/public/images/icons/{name}.svg", size=(width, height)
    )
    draw(doc)
    doc.save()
