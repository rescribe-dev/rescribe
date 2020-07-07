#!/bin/bash

# abort on errors
set -e

cd ..

node_paths=("." "api/" "github-app/" "web/" "prerender/" "vscode/" ".github/build-frontend/" "docs/" "status/" "emails/")

for path in "${node_paths[@]}"
do
  cd "$path"
  echo "install dependencies in $path"
  if [ -f yarn.lock ]; then
    echo "using yarn package manager"
    yarn install
  else
    echo "using npm package manager"
    npm install
  fi
  cd -
done

# install golang dependencies
go_paths=("router")

for path in "${go_paths[@]}"
do
  cd "$path/src"
  echo "install dependencies in $path/"
  go get .
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
