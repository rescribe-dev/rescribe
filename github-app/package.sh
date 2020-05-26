#!/bin/bash

set -e

npm run prepublishOnly

cp package.json lib
cp yarn.lock lib

cd lib
yarn install --production
zip -r ../dist.zip *
cd -
