#!/bin/bash

# abort on errors
set -e

cd ../..

# node
node_paths=("." "api/" "github-app/" "web/" "prerender/" "vscode/" "docs/" "status/" "emails/" \
            "aws/cloudfront/frontend/origin-request/" "aws/cloudfront/frontend/viewer-response/" \
            "aws/cloudfront/docs/origin-request/" "aws/cloudfront/docs/viewer-response/" \
            "aws/cloudfront/build-cloudfront/" "aws/lambda/update-cloudfront-lambda/" \
            "aws/cloudfront/frontend/viewer-request/" "aws/lambda/update-sitemap/" \
            "aws/lambda/update-currencies/")

for path in "${node_paths[@]}"
do
  cd "$path"
  echo "install dependencies in $path"
  if ! [ -d node_modules ]; then
    if [ -f yarn.lock ]; then
      echo "using yarn package manager"
      yarn install
    else
      echo "using npm package manager"
      npm install
    fi
  else
    echo "node_modules already exists"
  fi
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

cd scripts/install

# local packages
./cli.sh
./antlr.sh

# additional installs
./git_secrets.sh

cd -

# python
python_paths=("nlp/dataload/file-content-classifier" "nlp/dataload/search-classifier" \
  "nlp/deployment" "nlp/training" "aws/sagemaker/deploy")

for path in "${python_paths[@]}"
do
  cd "$path"
  echo "install dependencies in $path/"
  # fails if environment already exists
  conda env create --file ./environment.yml
  cd -
done
