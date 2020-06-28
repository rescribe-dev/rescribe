#!/bin/bash

# abort on errors
set -e

cd ..

node_paths=("." "api/" "github-app/" "web/" "vscode/" ".github/build-frontend/" "docs/" "status/")

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

# additional install scripts

# local packages
./install_cli.sh
./install_antlr.sh
./install_nlp.sh

# additional installs
./install_git_secrets.sh
