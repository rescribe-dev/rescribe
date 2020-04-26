#!/bin/bash

# abort on errors
set -e

npm run precommit --prefix api
npm run precommit --prefix github-app
npm run precommit --prefix cli
cd antlr && ./gradlew goJF && cd -
git add -A
