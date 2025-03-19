#!/usr/bin/python3

# For static HTML, we use a simple format
# {Title} $optional-css$ %optional-js% [
# HTML here
# ]

# This script parses that and puts it into template defined in template.html

import re
import subprocess
import os

with open(f"src/static/template.html") as f:
    template = f.read()


def reify_template(title, body, css=None, js=None):
    "Substitute title, body, e.t.c. into template and return as a str."

    s = re.sub(r"\$title\$", title, template)
    s = re.sub(r"\$body\$", body, s)
    if css:
        s = re.sub(
            r"\<\/head\>",
            f'  <link type="text/css" rel="stylesheet" href="styles/{css}.css" />\n  </head>',
            s,
        )
    if js:
        s = re.sub(
            r"\<\/head\>", f'  <script src="dist/{js}.js"></script>\n  </head>', s
        )

    return s


def parse_file(filename):
    "Open file, parse and find title, body, css, js"

    with open(f"src/static/{filename}.html") as f:
        text = f.read()

    title = re.search(r"\{(.*)\}", text)[1]
    body = re.search(r"\[(.*)\]", text, flags=re.DOTALL)[1]
    css_ = re.search(r"\$(.*)\$", text, flags=re.DOTALL)
    css = css_[1] if css_ else None
    js_ = re.search(r"\%(.*)\%", text, flags=re.DOTALL)
    js = js_[1] if js_ else None

    return title, body, css, js


def output_file(filename, text):
    "Output text to file"

    with open(f"public/{filename}.html", "w+") as f:
        f.write(text)


def build(filename):
    "Parse, template, and output file to new location"

    output_file(filename, reify_template(*parse_file(filename)))


def cp_file(filename):
    "Copy a file straight from src/static to the public directory"
    if os.name == 'nt':  # Windows
        os.system(f'"copy src\\static\\{filename}.html public\\{filename}.html"')
    else:  # Unix/Linux
        subprocess.run(["cp", f"src/static/{filename}.html", f"public/{filename}.html"])


build("index")
build("login")
build("scores")
build("translate")
build("importbww")
build("support")
build("404")
build("contact")
build("forgotpassword")
cp_file("pipescore")
cp_file("help")
