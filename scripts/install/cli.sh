#!/bin/bash

# abort on errors
set -e

cd ../../cli

if [ -x "$(command -v yay)" ]; then
  # yay arch support
  yay -Syu --needed krb5
else
  # default ubuntu
  sudo apt-get update -y
  sudo apt-get install -y libkrb5-dev
fi

if ! [ -d node_modules ]; then
  npm install
else
  echo "node_modules already exists"
fi

cd -
