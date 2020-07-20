#!/bin/bash

# abort on errors
set -e

cd "../$1"

output="dist.zip"

rm -rf yarn.lock node_modules "$output"
yarn install --prod
mv node_modules lib

cd lib
zip -r "$output" *
mv "$output" ..
cd -

yarn install

cd -
