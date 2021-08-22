#!/bin/bash

# Build static HTML files

# Most of these are m4 (macro) files that produce straightforward HTML. The exception is /docs
# which is written in Markdown and converted to HTML using pandoc. I haven't yet figured out a
# way to remove repetition between template.m4 and template.html (used for pandoc)

build_md () {
  pandoc --standalone --template src/static/template.html src/static/$1.md -s -o public/$1.html
}

build () {
  cd src/static
  m4 $1.m4 > ../../public/$1.html
  cd -
}

build index
build login
build scores
build_md docs
cp src/static/pipescore.html public/pipescore.html

