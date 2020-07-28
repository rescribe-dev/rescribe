#!/bin/bash

# runs tests

# abort on errors
set -e

cd ..

# initial file tests
cd scripts/precommit
./spaces.sh
./line_endings.sh
cd -

node_tests=("api/")

for path in "${node_tests[@]}"
do
  cd "$path"
  pwd
  if [ -f yarn.lock ]; then
    echo "using yarn"
    yarn run coverage
  else
    echo "using npm"
    npm run coverage
  fi
  cd -
done

python_tests=()

for path in "${python_tests[@]}"
do
  cd "$path"
  ./coverage.sh
  cd -
done

cd scripts
echo "done with testing and generating coverage"
