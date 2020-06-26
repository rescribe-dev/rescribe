#!/bin/bash

# abort on errors
set -e

cd ..

node_paths=("." "api/" "github-app/" "cli/" "web/" "vscode/" ".github/build-frontend/" "docs/")

for path in "${node_paths[@]}"
do
  cd "$path"
  if [ -f yarn.lock ]; then
    echo "using yarn package manager"
    yarn install
  else
    echo "using npm package manager"
    npm install
  fi
  cd -
done

cd scripts

./install_antlr.sh
