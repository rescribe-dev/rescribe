#!/bin/bash

set -e

rm -rf dist

npm run package

cd dist

nodegit_path=../node_modules/nodegit/build/Release/nodegit.node

zip linux.zip cli-linux $nodegit_path
rm cli-linux
zip macos.zip cli-macos $nodegit_path
rm cli-macos
zip windows.zip cli-win.exe $nodegit_path
rm cli-win.exe

cd -
