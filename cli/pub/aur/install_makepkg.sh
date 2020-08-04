#!/bin/bash

set -e

sudo apt-get install build-essential libarchive-dev bsdtar

tmp_dir="tmp-makepkg"

git clone git://projects.archlinux.org/pacman.git "$tmp_dir"

cd "$tmp_dir"
./autogen.sh
./configure --disable-doc
make
sudo make install

cd - &>/dev/null
