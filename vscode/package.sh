#!/bin/bash

set -e

rm -rf dist *.vsix
mkdir dist
vsce package
mv *.vsix dist/
