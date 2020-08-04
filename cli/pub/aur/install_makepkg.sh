#!/bin/bash

set -e

sudo wget -O /usr/local/bin/pacapt https://github.com/icy/pacapt/raw/ng/pacapt
sudo chmod 755 /usr/local/bin/pacapt
sudo ln -sv /usr/local/bin/pacapt /usr/local/bin/pacman || true

whereis pacman

if [ ! -x "$(command -v makepkg)" ]; then
  echo "cannot find makepkg"
  exit 1
fi
