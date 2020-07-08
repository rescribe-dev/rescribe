#!/bin/bash

set -e

output="dist.zip"

rm -rf yarn.lock node_modules "$output"
yarn install --prod
mv node_modules lib

cd lib
zip -r "$output" *
mv "$output" ..
cd -

yarn install
