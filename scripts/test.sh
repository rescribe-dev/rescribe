#!/bin/bash

# runs tests

# abort on errors
set -e

cd ..

node_tests=("api/")

for path in "${node_paths[@]}"
do
  cd "$path"
  npx npm-check-updates -u
  if [ -f yarn.lock ]; then
    echo "using yarn package manager"
    yarn run coverage
  else
    echo "using npm package manager"
    npm run coverage
  fi
  cd -
done

python_tests=()

for path in "${python_paths[@]}"
do
  cd "$path"
  ./coverage.sh
  cd -
done

cd scripts
