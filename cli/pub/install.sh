#!/bin/bash

set -e

cli_url="https://cli.rescribe.dev/linux.zip"
temp_folder=tmp
install_location=/usr/bin
config_file=~/.rescribe.yml

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

if [ ! -f "$config_file" ]; then
  cp .rescribe.yml "$config_file"
fi

completion_script="./add_completion.sh"
chmod +x "$completion_script"
"$completion_script"

rm -rf "$temp_folder"

cd -
