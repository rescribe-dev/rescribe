#!/bin/bash

set -e

npm run prepublishOnly

cp package.json lib
cp yarn.lock lib

cd lib
yarn install --production
cd -

zip -r dist.zip lib
