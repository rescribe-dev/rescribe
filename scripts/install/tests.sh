#!/bin/bash

# abort on errors
set -e

cd ../..

node_tests=("api/")

for path in "${node_tests[@]}"
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

python_tests=()

for path in "${python_tests[@]}"
do
  cd "$path"
  echo "install dependencies in $path/"
  conda env create --file ./environment.yml
  cd -
done

# install golang dependencies
go_tests=()

for path in "${go_tests[@]}"
do
  cd "$path/src"
  echo "install dependencies in $path/"
  go get .
  cd -
done

cd scripts/install

# additional install scripts
