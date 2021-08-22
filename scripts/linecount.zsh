#!/bin/zsh
# Count lines of code :)
# ignores blank lines
setopt extended_glob
cd ..
echo "LOC:"
cat **/*.ts~*node_modules* | wc -l
echo "SLOC:"
cat **/*.ts~*node_modules* | sed '/^$/d' | wc -l
echo "Semicolons:"
rg ";" **/*.ts~*node_modules* | wc -l
