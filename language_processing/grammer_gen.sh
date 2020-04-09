#!/bin/bash


if [ ! -d "./grammars" ]; then
  git clone https://github.com/antlr/grammars-v4 grammars
fi

rm -r src/grammar/gen
mkdir -p src/grammar/gen

cd ../grammars/python/python3
java -Xmx500M -cp "/usr/local/lib/antlr-4.7.1-complete.jar:$CLASSPATH" org.antlr.v4.Tool -visitor Python3.g4 -o gen
mv gen ../../../src/grammar/gen/python3
cd -

cd ../grammars/java/java
java -Xmx500M -cp "/usr/local/lib/antlr-4.7.1-complete.jar:$CLASSPATH" org.antlr.v4.Tool -visitor JavaLexer.g4 JavaParser.g4 -o gen
mv gen ../../../src/grammar/gen/java
cd -

cd ../grammars/cpp
java -Xmx500M -cp "/usr/local/lib/antlr-4.7.1-complete.jar:$CLASSPATH" org.antlr.v4.Tool -visitor CPP14.g4 -o gen
mv gen ../../src/grammar/gen/cpp
cd -