#!/bin/bash

# abort on errors
set -e

npm run precommit --prefix api
cd antlr && ./gradlew goJF && cd -
git add -A
