#!/bin/bash

set -e

config_file=$1/home/$USER/.rescriberc.yml
if [ ! -f "$config_file" ]; then
  cp .rescriberc.yml "$config_file"
fi

completion_script="./add_completion.sh"
chmod +x "$completion_script"
"$completion_script" $1

cd -
