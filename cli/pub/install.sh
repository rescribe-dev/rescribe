#!/bin/bash

set -e

cli_url="https://cli.rescribe.dev/linux.zip"
temp_folder=tmp
install_location=/usr/bin
config_file=~/.rescriberc.yml

if [ -d "$temp_folder" ]; then
  echo "folder \"$temp_folder\" already exists in current directory"
  exit 1
else
  mkdir "$temp_folder"
fi

cd "$temp_folder"

zip_file="rescribe.zip"
wget "$cli_url" -O "$zip_file"
unzip "$zip_file"

chmod +x rescribe
sudo cp rescribe "$install_location"
sudo cp nodegit.node "$install_location"

./postinstall.sh

rm -rf "$temp_folder"

cd -
