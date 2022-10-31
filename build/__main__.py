#!/usr/bin/python3

# Build HTML pages and icons
# You will need to install svgwrite via `pip3 install svgwrite` before running

import os

os.makedirs("public/images/icons", exist_ok=True)

import make_html
import make_icons
import make_note_icons
import make_gracenote_icons
