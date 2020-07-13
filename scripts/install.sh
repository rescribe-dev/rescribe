#!/bin/bash

# abort on errors
set -e

cd ..

node_paths=("." "api/" "github-app/" "web/" "prerender/" "vscode/" "docs/" "status/" "emails/" \
            "aws/cloudfront/frontend/origin-request/" "aws/cloudfront/frontend/viewer-response/" \
            "aws/cloudfront/docs/origin-request/" "aws/cloudfront/docs/viewer-response/" \
            "aws/cloudfront/build-cloudfront/" "aws/lambda/update-cloudfront-lambda" \
            "aws/cloudfront/frontend/viewer-request/")

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

python_paths=("nlp/dataload" "nlp/deployment" "nlp/training" "aws/sagemaker/deploy")

for path in "${python_paths[@]}"
do
  cd "$path"
  echo "install dependencies in $path/"
  conda env create --file ./environment.yml
  cd -
done

# install golang dependencies
go_paths=("fast")

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

# additional installs
./install_git_secrets.sh
