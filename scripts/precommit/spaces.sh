#!/bin/bash

cd ../..

tab_files=$(grep -R -I -n -P "\t" \
  --exclude-dir={.git,node_modules,grammars,.gradle,.cache,build,dist} \
  --exclude={.gitmodules,*.mod,makefile,.classpath,.project,*.jar,*.go,*.svg} .)

num_tab_files=$(echo -n "$tab_files" | grep -c '^')


if [ $num_tab_files -ne 0 ]; then
  echo "source file lines that have tabs: $num_tab_files"
  printf '%s\n' "$tab_files"
  exit 1
fi

cd - > /dev/null
