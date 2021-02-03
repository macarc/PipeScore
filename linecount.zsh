# Count lines of code :)
setopt extended_glob
cat **/*.ts~*node_modules* | wc -l
