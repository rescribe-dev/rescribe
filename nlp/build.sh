#!/bin/bash

# abort on errors
set -e

if [ -z "$1" ]; then
  echo "No source directory provided"
  exit 1
fi

echo "files in source directory:"
ls "$1"

data_folder="data"

# delete data
cd "$data_folder"
git clean -fx
cd -

source_folder="src"
source_dir="$1"/"$source_folder"

# delete gitignored files
cd "$source_dir"
git clean -fx
cd -

dist_folder="$1"/"dist"

rm -rf "$dist_folder"
mkdir "$dist_folder"
cp -LR "$data_folder" "$dist_folder"
working_dir="$dist_folder"/"$1"
mkdir -p "$working_dir"
cp -LR "$source_dir" "$working_dir"/"$source_folder"
