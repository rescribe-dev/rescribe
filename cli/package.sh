#!/bin/bash

set -e

rm -rf dist-bin

if [ ! -d dist ]; then
  if [ ! -d lib ]; then
    echo "cannot find source files"
    exit 1
  fi
  cp -r lib dist
fi

npm run package

cd dist-bin

cp ../node_modules/nodegit/build/Release/nodegit.node nodegit.node
cp ../.rescriberc.default.yml .rescriberc.yml
cp ../pub/add_completion.sh .
cp ../pub/postinstall.sh .

mv cli-linux rescribe
zip linux.zip rescribe nodegit.node .rescriberc.yml add_completion.sh postinstall.sh
rm rescribe
mv cli-macos rescribe
zip macos.zip rescribe nodegit.node .rescriberc.yml add_completion.sh postinstall.sh
rm rescribe
mv cli-win.exe rescribe.exe
zip windows.zip rescribe.exe nodegit.node .rescriberc.yml add_completion.sh postinstall.sh
rm rescribe.exe

cp ../pub/install.sh .

rm nodegit.node .rescriberc.yml add_completion.sh postinstall.sh

cd -
