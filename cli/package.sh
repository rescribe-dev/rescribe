#!/bin/bash

set -e

rm -rf dist

npm run package

cd dist

cp ../node_modules/nodegit/build/Release/nodegit.node nodegit.node
cp ../.rescriberc.default.yml .rescriberc.yml
completion_script="../pub/add_completion.sh"

mv cli-linux rescribe
zip linux.zip rescribe nodegit.node .rescriberc.yml "$completion_script"
rm rescribe
mv cli-macos rescribe
zip macos.zip rescribe nodegit.node .rescriberc.yml "$completion_script"
rm rescribe
mv cli-win.exe rescribe.exe
zip windows.zip rescribe.exe nodegit.node .rescriberc.yml "$completion_script"
rm rescribe.exe

cp ../pub/install.sh .

rm nodegit.node .rescriberc.yml

cd -
