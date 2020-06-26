#!/bin/bash

set -e

rm -rf dist *.vsix
mkdir dist
npx vsce package --yarn
mv *.vsix dist/
