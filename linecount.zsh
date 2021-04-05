#!/bin/zsh
# Count lines of code :)
# ignores blank lines
setopt extended_glob
cat **/*.ts~*node_modules* | sed '/^$/d' | wc -l
