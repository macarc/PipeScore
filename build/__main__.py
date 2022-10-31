#!/usr/bin/python3

# Build HTML pages and icons

import os
import sys

try:
    import svgwrite
except ModuleNotFoundError:
    print(
        "You must install svgwrite to build the SVG icons. Try `python -m pip install svgwrite`"
    )
    sys.exit(1)


os.makedirs("public/images/icons", exist_ok=True)

import make_html
import make_icons
import make_note_icons
import make_gracenote_icons
