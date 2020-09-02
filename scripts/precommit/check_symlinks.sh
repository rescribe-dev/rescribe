#!/bin/bash

cd ../..

# see https://stackoverflow.com/a/4210072 for excluding directories
# see https://unix.stackexchange.com/a/38691 for other ways of finding broken symlinks
broken_symlinks=$(find . -type d \( -name node_modules -o -path ./.git -o -name .gradle -o \
  -name .cache -name dist \) -prune -false -o -xtype l)

num_broken_symlinks=$(echo -n "$broken_symlinks" | grep -c '^')


if [ $num_broken_symlinks -ne 0 ]; then
  echo "source file lines that have broken symlinks: $num_broken_symlinks"
  printf '%s\n' "$broken_symlinks"
  exit 1
fi

cd - > /dev/null
