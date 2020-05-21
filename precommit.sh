#!/bin/bash

# abort on errors
set -e

npm run precommit --prefix api
npm run precommit --prefix github-app
npm run precommit --prefix cli
npm run precommit --prefix web
npm run precommit --prefix vscode
npm run precommit --prefix .github/build-frontend
cd antlr && ./precommit.sh && cd -
git add -A
