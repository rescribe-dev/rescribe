#!/bin/bash

# note - script currently works for python and node.
# does not update java dependencies - this needs to be done manually.

# abort on errors
set -e

cd ..

node_paths=("." "api/" "github-app/" "cli/" "web/" "prerender/" "vscode/" ".github/build-frontend/" "docs/" "status/" "emails/")

for path in "${node_paths[@]}"
do
  cd "$path"
  npx npm-check-updates -u
  if [ -f yarn.lock ]; then
    echo "using yarn package manager"
    yarn install
  else
    echo "using npm package manager"
    npm install
  fi
  cd -
done

python_paths=("nlp/")

for path in "${python_paths[@]}"
do
  cd "$path"
  conda env update --file environment.yml --prune
  conda env export > environment.yml
  cd -
done

go_paths=("router")

for path in "${go_paths[@]}"
do
  cd "$path/src"
  go get -u
  cd -
done

cd scripts
