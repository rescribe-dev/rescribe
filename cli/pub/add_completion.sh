#!/bin/bash

set -e

echo "adding completion"

start_completions_str="begin-rescribe-completions"

default_shell=$(getent passwd $USER | sed 's:.*/::')
shell_rc_file=~/."$default_shell""rc"

if [ -f $shell_rc_file ]; then
  if ! grep -q "$start_completions_str" "$shell_rc_file"; then
    if [ -f "$1/usr/bin/rescribe" ]; then
      "$1/usr/bin/rescribe" completion >> "$shell_rc_file"
    elif command -v rescribe &> /dev/null; then
      rescribe completion >> "$shell_rc_file"
    else
      echo "cannot find rescribe command. is the bin folder added to your path?"
      exit 1
    fi
    echo "completion added"
  else
    echo "completion already found"
  fi
else
  echo "no rc file found"
fi
