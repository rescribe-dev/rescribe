#!/bin/bash

set -e

classpath=src/main/java/com/rescribe/antlr

package_base=com.rescribe.antlr.gen

mkdir -p $classpath/gen
rm -rf $classpath/gen/*

if [ ! -d "./grammars" ]; then
  git clone https://github.com/antlr/grammars-v4 grammars
fi

cd grammars/python/python3
antlr4 -visitor Python3.g4 -package $package_base.python3 -o gen
mv gen/ ../../../$classpath/gen/python3
cd -

cd grammars/java/java
antlr4 -visitor JavaParser.g4 JavaLexer.g4 -package $package_base.java -o gen
mv gen/ ../../../$classpath/gen/java
cd -

cd grammars/cpp
antlr4 -visitor CPP14.g4 -package $package_base.cpp -o gen
mv gen/ ../../$classpath/gen/cpp
cd -
