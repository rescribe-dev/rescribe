#!/bin/bash

set -e

rm -rf dist

npm run package

cd dist

cp ../node_modules/nodegit/build/Release/nodegit.node nodegit.node

mv cli-linux rescribe
zip linux.zip rescribe nodegit.node
rm rescribe
mv cli-macos rescribe
zip macos.zip rescribe nodegit.node
rm rescribe
mv cli-win.exe rescribe.exe
zip windows.zip rescribe.exe nodegit.node
rm rescribe.exe

rm nodegit.node

cd -
