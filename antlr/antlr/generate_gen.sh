#!/bin/bash

set -e

classpath=src/com/rescribe

mkdir -p $classpath/gen
rm -rf $classpath/grammar/gen

if [ ! -d "./grammars" ]; then
  git clone https://github.com/antlr/grammars-v4 grammars
fi

cd grammars/python/python3
antlr4 -visitor Python3.g4 -o gen
mv gen/ ../../../$classpath/gen/python
cd -
