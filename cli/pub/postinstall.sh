#!/bin/bash

set -e

config_file=/home/$USER/.rescriberc.yml
if [ ! -f "$config_file" ]; then
  echo "add default config file to home dir"
  cp .rescriberc.yml "$1""$config_file"
fi

completion_script="./add_completion.sh"
chmod +x "$completion_script"
"$completion_script" $1

cd - &>/dev/null
