#!/bin/bash

# abort on errors
set -e

cd ../../antlr

if [ -x "$(command -v yay)" ]; then
  # yay arch support
  yay -Syu --needed antlr4
else
  # default ubuntu
  sudo apt-get update -y
  sudo apt-get install -y antlr4
fi

./predeploy.sh

cd -
