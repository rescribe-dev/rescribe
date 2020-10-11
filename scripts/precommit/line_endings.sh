#!/bin/bash

cd ../..

line_endings_files=$(grep -R -I -U -P "\r$" \
  --exclude-dir={.git,node_modules,grammars,.gradle,.cache,build,dist} .)

num_line_endings_files=$(echo -n "$line_endings_files" | grep -c '^')

if [ $num_line_endings_files -ne 0 ]; then
  echo "source file lines that have dos line endings: $num_line_endings_files"
  printf '%s\n' "$line_endings_files"
  exit 1
fi

cd - > /dev/null
