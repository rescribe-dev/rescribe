#!/bin/bash

set -e

mkdir -p src/grammar
rm -rf src/grammar/gen
mkdir src/grammar/gen

if [ ! -d "./src/grammar/grammars" ]; then
  git clone https://github.com/antlr/grammars-v4 src/grammars
fi

cd src/grammar/grammars/python/python3-ts
antlr4ts -visitor Python3.g4 -o gen
mv gen/ ../../../gen/python
cd -

cd src/grammar/grammars/java/java
antlr4ts -visitor JavaLexer.g4 JavaParser.g4 -o gen
mv gen/ ../../../gen/java
cd -

cd src/grammar/grammars/cpp
antlr4ts -visitor CPP14.g4 -o gen
mv gen/ ../../gen/cpp
cd -
