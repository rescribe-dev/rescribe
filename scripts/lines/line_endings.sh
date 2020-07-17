#!/bin/bash

# sudo apt-get install -y dos2unix

# abort on errors
set -e

cd ../..

# .sln and .bat are windows-only files

git ls-files | grep -Ev '^.*\.(bat|sln)$' | xargs dos2unix

cd - &>/dev/null
